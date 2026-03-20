import { useState, useEffect, useRef, useCallback } from 'react';

export function useTranscription() {
  const [recording, setRecording] = useState(false);
  const [lastLine, setLastLine]   = useState(null);
  const listenerRef = useRef(null);

  useEffect(() => {
    const handler = (text) => setLastLine(text);
    listenerRef.current = handler;
    window.api.transcription.onLine(handler);
    return () => {
      window.api.transcription.offLine(listenerRef.current);
    };
  }, []);

  const startRecording = useCallback(async () => {
    setLastLine(null);
    await window.api.transcription.start();
    setRecording(true);
  }, []);

  const stopRecording = useCallback(async () => {
    await window.api.transcription.stop();
    setRecording(false);
  }, []);

  const toggle = useCallback(async () => {
    if (recording) await stopRecording();
    else await startRecording();
  }, [recording, startRecording, stopRecording]);

  return { recording, lastLine, toggle };
}
