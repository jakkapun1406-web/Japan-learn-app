// ============================================================
// IMPORTS
// ============================================================
import { useCallback } from 'react';

// ============================================================
// USE TEXT TO SPEECH — Web Speech API SpeechSynthesis wrapper
// ============================================================
export function useTextToSpeech() {
  const supported = typeof window !== 'undefined' && !!window.speechSynthesis;

  const speak = useCallback((text, lang = 'ja-JP') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    window.speechSynthesis.speak(utter);
  }, []);

  return { speak, supported };
}
