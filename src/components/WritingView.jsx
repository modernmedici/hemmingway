import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Check, Loader2, Maximize2 } from 'lucide-react';
import db from '../lib/db';
import EditorPresenceBar from './EditorPresenceBar';
import EditLockBanner from './EditLockBanner';

// Color palette for user avatars - Warm Academic Earth Tones
const COLORS = [
  'hsl(15, 40%, 55%)',  // Terracotta
  'hsl(110, 25%, 50%)', // Sage
  'hsl(35, 35%, 50%)',  // Clay
  'hsl(210, 15%, 45%)', // Slate
  'hsl(40, 40%, 55%)',  // Ochre
  'hsl(85, 30%, 45%)',  // Moss
  'hsl(45, 35%, 60%)',  // Sand
  'hsl(200, 12%, 50%)', // Stone
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
  const lastSavedContent = useRef({ title: post?.title ?? '', body: post?.body ?? '' });
  const [countChanged, setCountChanged] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const titleRef = useRef(null);
  const bodyRef = useRef(null);
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

  // Check if someone else (different user) has the edit lock
  const editorPeer = useMemo(() => {
    if (!presence?.peers || !currentUser) return null;

    // Find a peer who has the edit lock AND is a different user (different userId)
    const editorEntry = Object.entries(presence.peers).find(
      ([peerId, peerData]) =>
        peerId !== presence.user?.id &&
        peerData?.userId !== currentUser.id &&
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
  const latestRef = useRef({ title, body, onSave, onCancel, saving });
  latestRef.current = { title, body, onSave, onCancel, saving };

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

  // Centralized save with guard logic
  const saveWithGuard = useCallback(async (closeAfter = false) => {
    if (!title.trim() || saving) return false;

    // Skip if content hasn't changed since last save
    if (title === lastSavedContent.current.title && body === lastSavedContent.current.body) {
      return false;
    }

    setSaving(true);
    try {
      await onSave(title.trim(), body.trim(), defaultColumn, closeAfter);
      lastSavedContent.current = { title, body };
      return true;
    } catch (err) {
      console.error('Save failed:', err);
      return false;
    } finally {
      setSaving(false);
    }
  }, [title, body, saving, onSave, defaultColumn]);

  // Update latestRef to include saveWithGuard after it's defined
  latestRef.current.saveWithGuard = saveWithGuard;

  const handleCancel = useCallback(async () => {
    const { onCancel } = latestRef.current;
    const dirty = title !== originalTitle || body !== originalBody;

    // Auto-save if there are changes and title is not empty
    if (dirty && title.trim()) {
      await saveWithGuard(false); // false = already closing via onCancel
    }

    // Reset timer when leaving
    setTimeLeft(25 * 60);
    setTimerRunning(false);
    setHasStartedTyping(false);

    onCancel();
  }, [originalTitle, originalBody, title, saveWithGuard]);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const autoResizeTitle = useCallback(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  const autoResizeBody = useCallback(() => {
    const el = bodyRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    // Save scroll position before resize
    const scrollTop = container.scrollTop;

    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';

    // Restore scroll position (prevents cursor jump to bottom)
    container.scrollTop = scrollTop;
  }, []);

  useEffect(() => { autoResizeTitle(); }, [title, autoResizeTitle]);
  useEffect(() => { autoResizeBody(); }, [body, autoResizeBody]);

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
      userId: currentUser.id,
      name: currentUser.email?.split('@')[0] || 'Anonymous',
      email: currentUser.email,
      color,
      field: 'body', // Claim the edit lock
    });

    // Update presence every 10 seconds to maintain lock
    const interval = setInterval(() => {
      presence.publishPresence({
        userId: currentUser.id,
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
    if (!isDirty || !title.trim() || saving) return; // Skip if already saving

    const timer = setTimeout(() => {
      if (!saving) { // Double-check before calling onSave
        saveWithGuard(false); // false = don't close editor
      }
    }, 3000); // 3-second debounce

    return () => clearTimeout(timer);
  }, [title, body, isCollaborative, hasEditLock, post?.id, originalTitle, originalBody, saving, saveWithGuard]);

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
        e.preventDefault(); // Prevent default to avoid duplicate triggering
        const { saveWithGuard } = latestRef.current;
        saveWithGuard(true); // true = close after explicit save
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

  // Auto-save on browser navigation (back button, refresh, close tab)
  useEffect(() => {
    const handler = (e) => {
      const dirty = title !== originalTitle || body !== originalBody;

      if (dirty && title.trim()) {
        // Trigger auto-save via saveWithGuard (handles saving flag)
        saveWithGuard(false); // false = beforeunload already closing
        // Show browser warning if there are unsaved changes
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [originalTitle, originalBody, title, saveWithGuard]);

  const handleSave = async () => {
    const success = await saveWithGuard(false); // false = explicit "Save" button doesn't close
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  const canSave = title.trim().length > 0 && !saving;

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-background flex flex-col font-sans overflow-auto">
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
              className="text-xs font-sans tabular-nums cursor-pointer transition-all duration-200"
              style={{
                color: timeLeft === 0 ? 'hsl(var(--destructive))' : timerRunning ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              }}
            >
              {formatTime(timeLeft)}
            </span>
            {/* Word count in zen mode */}
            <span
              className="text-xs font-sans tabular-nums transition-all duration-200 ease-in-out"
              style={{
                color: countChanged ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                transform: countChanged ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
            </span>
            <button
              onClick={exitZenMode}
              className="text-xs font-sans bg-muted text-muted-foreground border-none rounded-sm px-3 py-1.5 cursor-pointer transition-all duration-[120ms] hover:bg-secondary"
            >
              Exit Fullscreen (Esc)
            </button>
          </div>
        </div>
      )}

      {/* Sticky header */}
      {!zenMode && (<div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-3 px-4 md:px-10 md:pl-[88px] flex items-center">
        <button
          onClick={handleCancel}
          className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-muted-foreground/70 text-xs font-sans p-0 transition-all duration-[120ms] hover:text-foreground active:scale-95"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to Board</span>
        </button>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Saved indicator */}
          {saved && (
            <span className="text-xs font-sans text-primary flex items-center gap-1 animate-[fadeOut_1.5s_ease-out_forwards]">
              <Check size={12} />
              Saved!
            </span>
          )}
          {/* Presence indicator (collaborative mode only) */}
          {isCollaborative && (
            <EditorPresenceBar
              peers={presence?.peers}
              currentUserId={presence?.user?.id}
            />
          )}

          {/* Metadata group: timer + word count */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Timer */}
            <span
              onClick={toggleTimer}
              onDoubleClick={resetTimer}
              title="Click to start/pause · Double-click to reset"
              className="text-xs font-sans tabular-nums cursor-pointer transition-all duration-200"
              style={{
                color: timeLeft === 0 ? 'hsl(var(--destructive))' : timerRunning ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              }}
            >
              {formatTime(timeLeft)}
            </span>
            {/* Word count */}
            <span
              className="text-xs font-sans tabular-nums transition-all duration-200 ease-in-out"
              style={{
                color: countChanged ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                transform: countChanged ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
            </span>
          </div>

          {/* Actions group: expand + save */}
          <div className="flex items-center gap-2">
            {/* Zen Mode Toggle */}
            <button
              onClick={enterZenMode}
              title="Fullscreen (⌘⇧F)"
              className="hidden sm:flex items-center gap-1 bg-transparent border-none cursor-pointer text-muted-foreground text-xs font-sans py-1.5 px-2 transition-all duration-[120ms] hover:text-foreground active:scale-95"
            >
              <Maximize2 size={14} />
            </button>
            {/* Save */}
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="text-xs font-sans font-medium border-none rounded-md py-1.5 px-3.5 transition-all duration-150 flex items-center gap-1 active:scale-95 disabled:cursor-not-allowed"
              style={{
                background: canSave ? 'hsl(var(--card))' : 'hsl(var(--secondary))',
                color: canSave ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                boxShadow: canSave ? '0 1px 3px hsl(var(--foreground) / 0.04)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (canSave) e.currentTarget.style.boxShadow = '0 2px 6px hsl(var(--foreground) / 0.05)';
              }}
              onMouseLeave={(e) => {
                if (canSave) e.currentTarget.style.boxShadow = '0 1px 3px hsl(var(--foreground) / 0.04)';
              }}
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
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
          paddingBottom: '50vh',
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
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              bodyRef.current?.focus();
            }
          }}
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
          ref={bodyRef}
          value={body}
          onChange={e => { setBody(e.target.value); autoResizeBody(); }}
          placeholder={isReadOnly ? "Read only - you'll see changes in real time" : "Start writing your thoughts..."}
          readOnly={isReadOnly}
          className="block w-full text-foreground border-none outline-none bg-transparent resize-none overflow-hidden"
          style={{
            fontSize: '17px',
            fontFamily: "'Libre Baskerville', Georgia, serif",
            lineHeight: '1.9',
            minHeight: '500px',
            opacity: isReadOnly ? 0.7 : 1,
            cursor: isReadOnly ? 'default' : 'text',
          }}
        />
      </div>

      {!zenMode && (
        <div className="py-2.5 px-4 md:px-10 text-center">
          <span className="text-[10px] tracking-widest text-muted-foreground font-sans">
            ⌘↵ to save<span className="hidden sm:inline"> · ⌘⇧F for fullscreen</span> · Esc to go back
          </span>
        </div>
      )}
    </div>
  );
}
