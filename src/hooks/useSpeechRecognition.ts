import { useState, useEffect, useCallback } from 'react';

// Extend the window object to include the speech recognition APIs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'ar-SA';

        recognitionInstance.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionInstance.onerror = (event: any) => {
          let message = 'حدث خطأ غير متوقع.';
          switch (event.error) {
            case 'not-allowed':
              message = 'تم رفض الإذن للوصول إلى الميكروفون.';
              break;
            case 'no-speech':
              message = 'لم يتم اكتشاف أي صوت.';
              break;
            case 'network':
              message = 'مشكلة في الشبكة.';
              break;
            default:
              message = `خطأ: ${event.error}`;
          }
          setError(message);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      } else {
        setError('متصفحك لا يدعم ميزة التسجيل الصوتي.');
      }
    }
  }, []);

  const toggleListening = useCallback(async () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setTranscript('');
    } else {
      try {
        // Request mic permission explicitly — triggers browser prompt
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop()); // release immediately
        setError(null);
        setTranscript('');
        recognition.start();
        setIsListening(true);
      } catch {
        setError('يرجى السماح للمتصفح باستخدام الميكروفون من إعدادات الموقع.');
        setIsListening(false);
      }
    }
  }, [isListening, recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  return {
    isListening,
    transcript,
    error,
    toggleListening,
    stopListening,
    hasSupport: !!recognition
  };
}
