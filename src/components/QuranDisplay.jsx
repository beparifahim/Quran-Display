import React, { useState, useEffect } from 'react';
import { useWakeLock } from '../hooks/useWakeLock';
import { useGaplessAudio } from '../hooks/useGaplessAudio';

export default function QuranDisplay({ surahData, nextSurahData }) {
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Settings State (Initialize from localStorage if available)
  const [layoutMode, setLayoutMode] = useState(() => localStorage.getItem('quran_layout') || 'split'); 
  const [theme, setTheme] = useState(() => localStorage.getItem('quran_theme') || 'oled'); 
  const [repeatGoal, setRepeatGoal] = useState(() => Number(localStorage.getItem('quran_repeat')) || 1); 
  
  // Save settings locally whenever they change
  useEffect(() => {
    localStorage.setItem('quran_layout', layoutMode);
    localStorage.setItem('quran_theme', theme);
    localStorage.setItem('quran_repeat', repeatGoal);
  }, [layoutMode, theme, repeatGoal]);

  useWakeLock(isPlaying);

  const handleTimeUpdate = (time) => setCurrentTime(time);

  const { activePlayer, audioRef0, audioRef1, getActiveAudio, internalTimeUpdate } = 
    useGaplessAudio(surahData, nextSurahData, handleTimeUpdate);

  // Find active Ayah and its index
  const currentIndex = surahData.ayahs.findIndex(
    (a) => currentTime >= a.start_time && currentTime < a.end_time
  );
  const currentAyah = currentIndex !== -1 ? surahData.ayahs[currentIndex] : surahData.ayahs[0];

  // Accurate Previous/Next Ayah Logic
  const handlePrevAyah = () => {
    if (currentIndex > 0) {
      getActiveAudio().currentTime = surahData.ayahs[currentIndex - 1].start_time;
    } else {
      getActiveAudio().currentTime = 0; // Snap to start
    }
  };

  const handleNextAyah = () => {
    if (currentIndex < surahData.ayahs.length - 1) {
      getActiveAudio().currentTime = surahData.ayahs[currentIndex + 1].start_time;
    }
  };

  const togglePlayback = () => {
    const audio = getActiveAudio();
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  const themeStyles = {
    oled: { bg: 'bg-black', text: 'text-white', english: 'text-gray-300' },
    dark: { bg: 'bg-[#121212]', text: 'text-[#E8E6D9]', english: 'text-gray-400' },
    paper: { bg: 'bg-[#F4F1EA]', text: 'text-black', english: 'text-gray-700' },
  };
  const currentTheme = themeStyles[theme];

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-8 transition-colors duration-700 ${currentTheme.bg}`}>
      
      <audio ref={audioRef0} src={activePlayer === 0 ? surahData.audio_source : ''} onTimeUpdate={activePlayer === 0 ? internalTimeUpdate : undefined} crossOrigin="anonymous" />
      <audio ref={audioRef1} src={activePlayer === 1 ? surahData.audio_source : ''} onTimeUpdate={activePlayer === 1 ? internalTimeUpdate : undefined} crossOrigin="anonymous" />

      {/* --- TELEPROMPTER UI --- */}
      <div className="w-full max-w-4xl flex flex-col items-center space-y-12 transition-opacity duration-500">
        
        {(layoutMode === 'split' || layoutMode === 'arabic') && (
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
              <span className="text-green-500 text-sm tracking-widest uppercase">
                [ Ayah {currentAyah.ayah_number} ]
                {repeatGoal === -1 ? ' (Looping)' : repeatGoal > 1 ? ` (Repeat ${repeatGoal}x)` : ''}
              </span>
            </div>
          </div>
        )}

        {layoutMode === 'split' && <div className="w-2/3 h-px bg-gray-600 opacity-30"></div>}

        {(layoutMode === 'split' || layoutMode === 'english') && (
          <div className="text-center space-y-4">
            <p className={`text-xl md:text-3xl font-light leading-relaxed max-w-2xl mx-auto ${currentTheme.english}`}>
              {currentAyah.text_english}
            </p>
          </div>
        )}
      </div>

      {/* --- INVISIBLE PAUSE SHIELD --- */}
      {isPlaying && <div className="fixed inset-0 z-40 cursor-pointer" onClick={togglePlayback} />}

      {/* --- ONSCREEN CONTROLS (Hidden while playing) --- */}
      {!isPlaying && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between p-8 pointer-events-none transition-opacity duration-500">
          
          {/* Top Settings Bar */}
          <div className="w-full max-w-5xl mx-auto flex justify-between items-start pointer-events-auto">
            
            <div className="flex flex-col space-y-2 bg-gray-900/90 backdrop-blur-md p-4 rounded-2xl border border-gray-800">
              <span className="text-gray-400 text-xs uppercase tracking-widest mb-1">Layout</span>
              <div className="flex space-x-2">
                {['arabic', 'split', 'english'].map(mode => (
                  <button 
                    key={mode}
                    onClick={() => setLayoutMode(mode)}
                    className={`px-4 py-2 rounded-lg text-sm capitalize ${layoutMode === mode ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2 bg-gray-900/90 backdrop-blur-md p-4 rounded-2xl border border-gray-800">
                <span className="text-gray-400 text-xs uppercase tracking-widest mb-1">Theme</span>
                <div className="flex space-x-2">
                  {['oled', 'dark', 'paper'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`px-4 py-2 rounded-lg text-sm capitalize ${theme === t ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col space-y-2 bg-gray-900/90 backdrop-blur-md p-4 rounded-2xl border border-gray-800">
                <span className="text-gray-400 text-xs uppercase tracking-widest mb-1">Memorize</span>
                <div className="flex space-x-2">
                  <button onClick={() => setRepeatGoal(1)} className={`px-4 py-2 rounded-lg text-sm ${repeatGoal === 1 ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Off</button>
                  <button onClick={() => setRepeatGoal(3)} className={`px-4 py-2 rounded-lg text-sm ${repeatGoal === 3 ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>3x</button>
                  <button onClick={() => setRepeatGoal(-1)} className={`px-4 py-2 rounded-lg text-sm ${repeatGoal === -1 ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Loop</button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Playback Bar */}
          <div className="w-full flex justify-center pointer-events-auto pb-4">
            <div className="flex items-center space-x-8 bg-gray-900/95 backdrop-blur-xl px-10 py-5 rounded-full shadow-2xl border border-gray-800 text-white">
              <button onClick={handlePrevAyah} className="text-gray-300 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 20L9 12l10-8v16zM5 19h2V5H5v14z"/></svg>
              </button>
              
              <button className="text-green-400 hover:text-green-300 transform hover:scale-110 transition-all" onClick={togglePlayback}>
                <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
              
              <button onClick={handleNextAyah} className="text-gray-300 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M5 4l10 8-10 8V4zm14 1v14h-2V5h2z"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
