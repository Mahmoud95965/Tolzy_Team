import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechRecognition(options?: { lang?: string }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasSupport, setHasSupport] = useState(false);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const shouldListenRef = useRef<boolean>(false);
  const lang = options?.lang || 'ar-SA';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setHasSupport(!!SpeechRecognition);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.stop();
      } catch {
        // ignore errors during cleanup
      }
      recognitionRef.current = null;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const msg = 'متصفحك لا يدعم ميزة التسجيل الصوتي المباشر. يرجى تجربة Google Chrome أو Edge.';
      setError(msg);
      toast.error(msg, { id: 'speech-unsupported' });
      return;
    }

    // Explicitly request microphone permissions to avoid browser block
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (permErr: any) {
        console.warn('Microphone permission denied:', permErr);
        const msg = 'يرجى تفعيل صلاحيات الميكروفون من إعدادات المتصفح للتحدث.';
        setError(msg);
        toast.error(msg, { id: 'speech-perm-error' });
        return;
      }
    }

    cleanup();
    setError(null);
    setTranscript('');
    finalTranscriptRef.current = '';
    shouldListenRef.current = true;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        toast('جاري الاستماع... تحدث الآن 🎙️', { id: 'speech-listening', icon: '🎙️', duration: 3500 });
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += trans + ' ';
          } else {
            interimTranscript += trans;
          }
        }

        if (currentFinal) {
          finalTranscriptRef.current += currentFinal;
        }

        const fullTranscript = (finalTranscriptRef.current + interimTranscript).trim();
        setTranscript(fullTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        let message = '';

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          message = 'تم رفض الإذن بالوصول للميكروفون. يرجى السماح باستخدامه من إعدادات المتصفح.';
          shouldListenRef.current = false;
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // Transient no-speech, don't interrupt immediately
          return;
        } else if (event.error === 'network') {
          message = 'تعذر الاتصال بخدمة التعرف على الصوت. تحقق من اتصال الإنترنت.';
          shouldListenRef.current = false;
          setIsListening(false);
        } else if (event.error === 'aborted') {
          setIsListening(false);
          return;
        } else {
          message = `خطأ في التسجيل: ${event.error}`;
          setIsListening(false);
        }

        if (message) {
          setError(message);
          toast.error(message, { id: 'speech-error' });
        }
      };

      recognition.onend = () => {
        if (shouldListenRef.current) {
          try {
            recognition.start();
            return;
          } catch {
            // failed to auto-restart
          }
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      const msg = 'تعذر تشغيل الميكروفون. يرجى التحقق من أذونات المتصفح.';
      setError(msg);
      toast.error(msg, { id: 'speech-failed' });
      setIsListening(false);
      shouldListenRef.current = false;
    }
  }, [cleanup, lang]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    cleanup();
    setIsListening(false);
    toast.dismiss('speech-listening');
  }, [cleanup]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isListening,
    transcript,
    error,
    toggleListening,
    startListening,
    stopListening,
    hasSupport
  };
}
