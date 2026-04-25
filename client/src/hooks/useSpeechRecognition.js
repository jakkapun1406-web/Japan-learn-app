// ============================================================
// IMPORTS
// ============================================================
import { useState, useRef, useCallback } from 'react';

// ============================================================
// CONSTANTS
// ============================================================
const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

// ============================================================
// USE SPEECH RECOGNITION — Web Speech API wrapper hook
// ============================================================
export function useSpeechRecognition({ onResult, onEnd } = {}) {
  const [listening, setListening] = useState(false);
  const [supported]               = useState(!!SpeechRecognition);
  const recRef                    = useRef(null);

  // --- START ---
  const start = useCallback(() => {
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang             = 'ja-JP';
    rec.interimResults   = false;
    rec.maxAlternatives  = 3;

    rec.onresult = (e) => {
      const alternatives = Array.from(e.results[0]).map((r) => r.transcript.trim());
      onResult?.(alternatives);
    };

    rec.onend = () => {
      setListening(false);
      onEnd?.();
    };

    rec.onerror = () => {
      setListening(false);
    };

    rec.start();
    recRef.current = rec;
    setListening(true);
  }, [onResult, onEnd]);

  // --- STOP ---
  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, supported, start, stop };
}
