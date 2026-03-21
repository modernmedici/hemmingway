import { useState, useEffect, useRef, useCallback } from 'react';

export function useTranscription() {
  const [recording, setRecording] = useState(false);
  const [lastLine, setLastLine]   = useState(null);
  const [error, setError]         = useState(null);
  const listenerRef = useRef(null);

  useEffect(() => {
    const handler = (text) => setLastLine(text);
    listenerRef.current = handler;
    window.api.transcription.onLine(handler);

    const errorHandler = (msg) => {
      setError(msg);
      setRecording(false); // desync fix: reset recording on error
    };
    window.api.transcription.onError(errorHandler);

    return () => {
      window.api.transcription.offLine(listenerRef.current);
      window.api.transcription.offError(errorHandler);
    };
  }, []);

  const startRecording = useCallback(async () => {
    setLastLine(null);
    setError(null);
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

  return { recording, lastLine, error, toggle };
}
