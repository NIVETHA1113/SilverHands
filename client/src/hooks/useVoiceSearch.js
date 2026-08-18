import { useState, useEffect, useRef, useCallback } from 'react';

const ERROR_MESSAGES = {
  'not-allowed':   'Microphone access denied. Please allow microphone in your browser settings.',
  'no-speech':     'No speech detected. Please try again.',
  'network':       'Network error during voice recognition.',
  'aborted':       '',   // user cancelled — silent
  'audio-capture': 'No microphone found. Please connect one and try again.',
};

/**
 * useVoiceSearch — Web Speech API hook
 *
 * @param {(text: string) => void} onResult  — called with the final transcript
 * @param {string}                 lang      — BCP-47 language tag, e.g. 'en-IN' or 'ta-IN'
 *
 * Returns { listening, supported, toggle, stop, errorMsg, clearError }
 */
export default function useVoiceSearch(onResult, lang = 'en-IN') {
  const [listening, setListening] = useState(false);
  const [errorMsg,  setErrorMsg]  = useState('');
  const recognitionRef            = useRef(null);
  const errorTimerRef             = useRef(null);

  const supported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  /** Show an error message and auto-clear it after 4 s */
  const showError = useCallback((msg) => {
    if (!msg) return;
    setErrorMsg(msg);
    clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setErrorMsg(''), 4000);
  }, []);

  const clearError = useCallback(() => {
    clearTimeout(errorTimerRef.current);
    setErrorMsg('');
  }, []);

  // Recreate the recognition instance whenever `lang` changes so the
  // correct language is used for the next recognition session.
  useEffect(() => {
    if (!supported) return;

    // Abort any in-progress session before replacing the instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) { /* ignore */ }
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous     = false;
    rec.interimResults = false;
    rec.lang           = lang;   // ← language-aware

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim();
      if (transcript) {
        clearError();
        onResult(transcript);
      }
    };

    rec.onend = () => setListening(false);

    rec.onerror = (e) => {
      setListening(false);
      const msg = ERROR_MESSAGES[e.error];
      if (msg === undefined) {
        showError('Voice recognition failed. Please try again.');
      } else if (msg) {
        showError(msg);
      }
      // msg === '' (aborted) → stay silent
    };

    recognitionRef.current = rec;

    return () => {
      clearTimeout(errorTimerRef.current);
      try { rec.abort(); } catch (_) { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported, lang]);   // re-run when lang changes

  const start = useCallback(() => {
    if (!supported || !recognitionRef.current) return;
    clearError();
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (_) {
      try { recognitionRef.current.stop(); } catch (__) { /* ignore */ }
      setListening(false);
    }
  }, [supported, clearError]);

  const stop = useCallback(() => {
    if (!supported || !recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch (_) { /* ignore */ }
    setListening(false);
  }, [supported]);

  const toggle = useCallback(() => {
    listening ? stop() : start();
  }, [listening, start, stop]);

  return { listening, supported, toggle, stop, errorMsg, clearError };
}
