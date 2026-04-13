import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Check, Loader2, Maximize2 } from 'lucide-react';
import db from '../lib/db';
import EditorPresenceBar from './EditorPresenceBar';
import EditLockBanner from './EditLockBanner';

// Color palette for user avatars
const COLORS = [
  'hsl(210, 100%, 56%)', // Blue
  'hsl(340, 82%, 52%)',  // Pink
  'hsl(291, 64%, 42%)',  // Purple
  'hsl(171, 100%, 41%)', // Teal
  'hsl(48, 100%, 67%)',  // Yellow
  'hsl(25, 95%, 53%)',   // Orange
  'hsl(141, 71%, 48%)',  // Green
  'hsl(0, 84%, 60%)',    // Red
];

function getUserColor(userId) {
  if (!userId) return COLORS[0];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

export default function WritingView({ post, defaultColumn, onSave, onCancel, currentUser }) {
  const [title,  setTitle]  = useState(post?.title ?? '');
  const [body,   setBody]   = useState(post?.body  ?? '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [countChanged, setCountChanged] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const titleRef = useRef(null);
  const containerRef = useRef(null);

  // Collaborative editing state
  const isCollaborative = !!post?.id; // Only enable for existing posts
  const postId = post?.id || 'new-post';

  // Create room unconditionally (required for React hooks)
  const room = db.room('postEditor', postId);
  const presence = room.usePresence();

  // Debug logging
  useEffect(() => {
    console.log('WritingView render:', {
      postId,
      isCollaborative,
      hasPresence: !!presence,
      peers: presence?.peers,
      userId: presence?.user?.id
    });
  }, [postId, isCollaborative, presence]);

  // Check if someone else has the edit lock
  const editorPeer = useMemo(() => {
    if (!presence?.peers || !currentUser) return null;

    // Find the peer who has the edit lock (field === 'body' or 'title')
    const editorEntry = Object.entries(presence.peers).find(
      ([peerId, peerData]) =>
        peerId !== presence.user?.id &&
        (peerData?.field === 'body' || peerData?.field === 'title')
    );

    return editorEntry ? { id: editorEntry[0], ...editorEntry[1] } : null;
  }, [presence, currentUser]);

  const hasEditLock = !editorPeer;
  const isReadOnly = isCollaborative && !hasEditLock;

  const wordCount = useMemo(() => {
    const combinedText = `${title} ${body}`.trim();
    if (!combinedText) return 0;
    return combinedText.split(/\s+/).length;
  }, [title, body]);

  useEffect(() => {
    if (wordCount > 0) {
      setCountChanged(true);
      const timer = setTimeout(() => setCountChanged(false), 300);
      return () => clearTimeout(timer);
    }
  }, [wordCount]);

  const originalTitle = post?.title ?? '';
  const originalBody  = post?.body  ?? '';

  // Keep latest values accessible in the keydown handler without re-registering
  const latestRef = useRef({ title, body, onSave, onCancel });
  latestRef.current = { title, body, onSave, onCancel };

  const enterZenMode = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setZenMode(true);
    } catch (err) {
      console.error('Failed to enter fullscreen:', err);
      // Fallback to just hiding UI
      setZenMode(true);
    }
  }, []);

  const exitZenMode = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setZenMode(false);
    } catch (err) {
      console.error('Failed to exit fullscreen:', err);
      setZenMode(false);
    }
  }, []);

  // Listen for fullscreen changes (user can exit with ESC or F11)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && zenMode) {
        setZenMode(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [zenMode]);

  const handleCancel = useCallback(async () => {
    const { title, body, onCancel, onSave } = latestRef.current;
    const dirty = title !== originalTitle || body !== originalBody;

    // Auto-save if there are changes and title is not empty
    if (dirty && title.trim()) {
      await onSave(title.trim(), body.trim(), defaultColumn);
    }

    // Reset timer when leaving
    setTimeLeft(25 * 60);
    setTimerRunning(false);
    setHasStartedTyping(false);

    onCancel();
  }, [originalTitle, originalBody, defaultColumn]);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const autoResizeTitle = useCallback(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  useEffect(() => { autoResizeTitle(); }, [title, autoResizeTitle]);

  // Timer countdown effect
  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setTimerRunning(!timerRunning);
  const resetTimer = () => {
    setTimeLeft(25 * 60);
    setTimerRunning(false);
  };

  // Publish presence when entering the editor
  useEffect(() => {
    if (!presence || !currentUser || !hasEditLock) return;

    const color = getUserColor(currentUser.id);

    // Publish presence to claim the edit lock
    presence.publishPresence({
      name: currentUser.email?.split('@')[0] || 'Anonymous',
      email: currentUser.email,
      color,
      field: 'body', // Claim the edit lock
    });

    // Update presence every 10 seconds to maintain lock
    const interval = setInterval(() => {
      presence.publishPresence({
        name: currentUser.email?.split('@')[0] || 'Anonymous',
        email: currentUser.email,
        color,
        field: 'body',
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [presence, currentUser, hasEditLock]);

  // Auto-save for collaborative editing
  useEffect(() => {
    if (!isCollaborative || !hasEditLock || !post?.id) return;

    const isDirty = title !== originalTitle || body !== originalBody;
    if (!isDirty || !title.trim()) return;

    const timer = setTimeout(() => {
      onSave(title.trim(), body.trim(), defaultColumn);
    }, 3000); // 3-second debounce

    return () => clearTimeout(timer);
  }, [title, body, isCollaborative, hasEditLock, post?.id, originalTitle, originalBody, onSave, defaultColumn]);

  // Auto-start timer on first keystroke
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  useEffect(() => {
    if (!hasStartedTyping && (title.length > 0 || body.length > 0)) {
      setHasStartedTyping(true);
      if (timeLeft === 25 * 60 && !timerRunning) {
        setTimerRunning(true);
      }
    }
  }, [title, body, hasStartedTyping, timeLeft, timerRunning]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (zenMode) {
          exitZenMode();
        } else {
          handleCancel();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        const { title, body, onSave } = latestRef.current;
        if (title.trim()) onSave(title.trim(), body.trim(), defaultColumn);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        if (zenMode) {
          exitZenMode();
        } else {
          enterZenMode();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleCancel, zenMode, defaultColumn, enterZenMode, exitZenMode]);

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(title.trim(), body.trim(), defaultColumn);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  };

  const canSave = title.trim().length > 0 && !saving;

  return (
    <div ref={containerRef} className="view-enter min-h-screen bg-background flex flex-col font-sans relative">
      {/* Editor presence bar (collaborative mode only) */}
      {!zenMode && isCollaborative && (
        <EditorPresenceBar
          peers={presence?.peers}
          currentUserId={presence?.user?.id}
          editorPeer={editorPeer}
        />
      )}

      {/* Zen mode indicator */}
      {zenMode && (
        <div
          className="zen-mode-indicator fixed top-5 right-5 z-20 opacity-30 transition-opacity duration-200 hover:opacity-100"
        >
          <div className="flex items-center gap-3">
            {/* Timer in zen mode */}
            <span
              onClick={toggleTimer}
              onDoubleClick={resetTimer}
              title="Click to start/pause · Double-click to reset"
              className="text-[11px] font-sans tabular-nums cursor-pointer transition-all duration-200"
              style={{
                color: timeLeft === 0 ? 'hsl(var(--destructive))' : timerRunning ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              }}
            >
              {formatTime(timeLeft)}
            </span>
            <button
              onClick={exitZenMode}
              className="text-[11px] font-sans bg-muted text-muted-foreground border-none rounded-sm px-3 py-1.5 cursor-pointer transition-all duration-[120ms] hover:bg-secondary"
            >
              Exit Fullscreen (Esc)
            </button>
          </div>
        </div>
      )}

      {/* Sticky header */}
      {!zenMode && (<div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-3.5 px-10 pl-[88px] flex items-center">
        <button
          onClick={handleCancel}
          className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-muted-foreground text-xs font-sans p-0 transition-all duration-[120ms] hover:text-foreground active:scale-95"
        >
          <ArrowLeft size={14} />
          Back to Board
        </button>

        <div className="ml-auto flex items-center gap-2.5">
          {/* Saved indicator */}
          {saved && (
            <span className="text-[11px] font-sans text-primary flex items-center gap-1 animate-[fadeOut_1.5s_ease-out_forwards]">
              <Check size={12} />
              Saved!
            </span>
          )}
          {/* Timer */}
          <span
            onClick={toggleTimer}
            onDoubleClick={resetTimer}
            title="Click to start/pause · Double-click to reset"
            className="text-[11px] font-sans tabular-nums cursor-pointer transition-all duration-200"
            style={{
              color: timeLeft === 0 ? 'hsl(var(--destructive))' : timerRunning ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
            }}
          >
            {formatTime(timeLeft)}
          </span>
          {/* Word count */}
          <span
            className="text-[11px] font-sans tabular-nums transition-all duration-200 ease-in-out"
            style={{
              color: countChanged ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              transform: countChanged ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
          </span>
          {/* Zen Mode Toggle */}
          <button
            onClick={enterZenMode}
            title="Fullscreen (⌘⇧F)"
            className="flex items-center gap-1 bg-transparent border-none cursor-pointer text-muted-foreground text-[11px] font-sans py-1.5 px-2 transition-all duration-[120ms] rounded-sm hover:text-foreground hover:bg-secondary"
          >
            <Maximize2 size={14} />
          </button>
          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="text-[11px] font-sans font-medium border-none rounded-sm py-1.5 px-3.5 transition-all duration-[120ms] flex items-center gap-1 active:scale-95 disabled:cursor-not-allowed"
            style={{
              background: canSave ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
              color: canSave ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
            }}
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>)}

      {/* Editor */}
      <div
        className="flex-1 w-full mx-auto"
        style={{
          maxWidth: '768px',
          paddingLeft: '32px',
          paddingRight: '32px',
          paddingTop: zenMode ? '128px' : '64px',
          paddingBottom: '256px',
        }}
      >
        {/* Edit lock banner */}
        {!zenMode && isReadOnly && editorPeer && (
          <EditLockBanner editorName={editorPeer.name || editorPeer.email} />
        )}

        <textarea
          ref={titleRef}
          value={title}
          onChange={e => { setTitle(e.target.value); autoResizeTitle(); }}
          placeholder={isReadOnly ? "Read only - someone else is editing" : "Essay Title"}
          rows={1}
          readOnly={isReadOnly}
          className="block w-full text-foreground border-none outline-none bg-transparent resize-none overflow-hidden"
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700,
            fontFamily: "'Libre Baskerville', Georgia, serif",
            lineHeight: '1.2',
            marginBottom: '32px',
            opacity: isReadOnly ? 0.7 : 1,
            cursor: isReadOnly ? 'default' : 'text',
          }}
        />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={isReadOnly ? "Read only - you'll see changes in real time" : "Start writing your thoughts..."}
          readOnly={isReadOnly}
          className="block w-full min-h-[500px] text-foreground border-none outline-none bg-transparent resize-none"
          style={{
            fontSize: '17px',
            fontFamily: "'Libre Baskerville', Georgia, serif",
            lineHeight: '1.9',
            opacity: isReadOnly ? 0.7 : 1,
            cursor: isReadOnly ? 'default' : 'text',
          }}
        />
      </div>

      {!zenMode && (
        <div className="py-2.5 px-10 text-center">
          <span className="text-[10px] tracking-widest text-muted-foreground font-sans">
            ⌘↵ to save · ⌘⇧F for fullscreen · Esc to go back
          </span>
        </div>
      )}
    </div>
  );
}
