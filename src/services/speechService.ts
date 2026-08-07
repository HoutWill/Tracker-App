export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

export const startVoiceRecognition = (
  onResult: (text: string, isFinal: boolean) => void,
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

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    let currentTranscript = '';
    let isFinal = false;

    for (let i = 0; i < event.results.length; ++i) {
      currentTranscript += event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        isFinal = true;
      }
    }

    if (currentTranscript.trim()) {
      onResult(currentTranscript, isFinal);
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
