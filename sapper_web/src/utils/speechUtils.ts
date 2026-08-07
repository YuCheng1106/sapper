/**
 * Helper function to convert audio blob to base64
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]); // Remove the data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Helper function to create audio blob from text using browser's speech synthesis
 * Note: This is just for demonstration - in a real app, you might use a backend API
 */
export const textToSpeech = (text: string, lang = 'zh-CN'): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            reject(new Error('Speech synthesis not supported'));
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;

        utterance.onend = () => {
            resolve();
        };

        utterance.onerror = (event) => {
            reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        window.speechSynthesis.speak(utterance);
    });
};

/**
 * Helper to detect browser speech recognition support
 */
export const isSpeechRecognitionSupported = (): boolean => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

/**
 * Helper to detect browser speech synthesis support
 */
export const isSpeechSynthesisSupported = (): boolean => {
    return 'speechSynthesis' in window;
};