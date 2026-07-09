import React, { useState } from 'react';
import { useWakeLock } from '../hooks/useWakeLock';
import { useGaplessAudio } from '../hooks/useGaplessAudio';

export default function QuranDisplay({ surahData, nextSurahData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [layoutMode] = useState('split'); 
  const [theme] = useState('oled'); 

  useWakeLock(isPlaying);

  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

  const { activePlayer, audioRef0, audioRef1, getActiveAudio, internalTimeUpdate } = 
    useGaplessAudio(surahData, nextSurahData, handleTimeUpdate);

  const currentAyah = surahData.ayahs.find(
    (a) => currentTime >= a.start_time && currentTime < a.end_time
  ) || surahData.ayahs[0];

  const themeStyles = {
    oled: { bg: 'bg-black', text: 'text-white', english: 'text-gray-300' }
  };

  const currentTheme = themeStyles[theme];

  const togglePlayback = () => {
    const audio = getActiveAudio();
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-8 transition-colors duration-700 ${currentTheme.bg}`}>
      
      <audio ref={audioRef0} src={activePlayer === 0 ? surahData.audio_source : ''} onTimeUpdate={activePlayer === 0 ? internalTimeUpdate : undefined} crossOrigin="anonymous" />
      <audio ref={audioRef1} src={activePlayer === 1 ? surahData.audio_source : ''} onTimeUpdate={activePlayer === 1 ? internalTimeUpdate : undefined} crossOrigin="anonymous" />

      <div className="w-full max-w-4xl flex flex-col items-center space-y-12 transition-opacity duration-500">
        <div className="text-center w-full">
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-6 md:gap-x-5" dir="rtl">
            {currentAyah.words.map((word, index) => {
              const isActiveWord = currentTime >= word.start_time && currentTime < word.end_time;
              return (
                <span key={index} className={`text-5xl md:text-7xl font-indopak transition-colors duration-150 ${isActiveWord ? 'text-green-400 drop-shadow-md' : currentTheme.text}`}>
                  {word.arabic}
                </span>
              );
            })}
          </div>
          <div className="mt-8">
            <span className="text-green-500 text-sm tracking-widest uppercase">[ Ayah {currentAyah.ayah_number} ]</span>
          </div>
        </div>

        {layoutMode === 'split' && <div className="w-2/3 h-px bg-gray-600 opacity-30"></div>}

        <div className="text-center space-y-4">
          <p className={`text-xl md:text-3xl font-light leading-relaxed max-w-2xl mx-auto ${currentTheme.english}`}>
            {currentAyah.text_english}
          </p>
        </div>
      </div>

      {isPlaying && <div className="fixed inset-0 z-50 cursor-pointer" onClick={togglePlayback} />}

      {!isPlaying && (
        <div className="fixed bottom-10 flex space-x-6 bg-gray-900 px-8 py-4 rounded-full shadow-2xl z-50 text-white">
           <button onClick={() => getActiveAudio().currentTime = currentAyah.start_time - 5}>Prev</button>
           <button className="text-green-400 font-bold" onClick={togglePlayback}>Play</button>
           <button onClick={() => getActiveAudio().currentTime = currentAyah.end_time + 0.1}>Next</button>
        </div>
      )}
    </div>
  );
}
