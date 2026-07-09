import { useState, useEffect, useRef } from 'react';

export function useGaplessAudio(currentSurah, nextSurah, onTimeUpdateCallback) {
  const [activePlayer, setActivePlayer] = useState(0);
  const audioRef0 = useRef(null);
  const audioRef1 = useRef(null);

  const getActiveAudio = () => activePlayer === 0 ? audioRef0.current : audioRef1.current;
  const getStandbyAudio = () => activePlayer === 0 ? audioRef1.current : audioRef0.current;

  useEffect(() => {
    const standbyAudio = getStandbyAudio();
    if (nextSurah && standbyAudio) {
      standbyAudio.src = nextSurah.audio_source;
      standbyAudio.load(); 
    }
  }, [nextSurah, activePlayer]);

  const internalTimeUpdate = () => {
    const activeAudio = getActiveAudio();
    if (!activeAudio) return;

    const time = activeAudio.currentTime;
    const duration = activeAudio.duration;

    onTimeUpdateCallback(time);

    if (duration && time >= duration - 0.2) {
      const standbyAudio = getStandbyAudio();
      if (standbyAudio && standbyAudio.readyState >= 3) {
        standbyAudio.play();
        activeAudio.pause();
        activeAudio.currentTime = 0;
        setActivePlayer(prev => prev === 0 ? 1 : 0);
      }
    }
  };

  return { activePlayer, audioRef0, audioRef1, getActiveAudio, internalTimeUpdate };
}
