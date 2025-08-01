import { useEffect, useRef } from 'react';

export const useNotificationSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create a simple notification beep using Web Audio API
    const createBeepSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (error) {
        console.log('Audio not available:', error);
      }
    };

    audioRef.current = { play: createBeepSound } as any;
  }, []);

  const playNotificationSound = () => {
    try {
      if (audioRef.current && typeof audioRef.current.play === 'function') {
        audioRef.current.play();
        console.log('Notification sound played');
      }
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  return { playNotificationSound };
};