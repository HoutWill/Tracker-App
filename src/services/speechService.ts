export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

export const startVoiceRecognition = (
  onResult: (text: string) => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) => {
  if (!isSpeechRecognitionSupported()) {
    alert('Voice speech recognition is not supported on this browser.');
    if (onEnd) onEnd();
    return null;
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    if (event.results && event.results[0] && event.results[0][0]) {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event);
    if (onError) onError(event);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
  } catch (e) {
    console.error('Failed to start speech recognition:', e);
    if (onEnd) onEnd();
  }

  return recognition;
};
