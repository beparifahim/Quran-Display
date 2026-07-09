import React, { useState, useEffect } from 'react';
import { useWakeLock } from '../hooks/useWakeLock';
import { useGaplessAudio } from '../hooks/useGaplessAudio';

export default function QuranDisplay({ surahData, allSurahs, onSurahChange }) {
  // Playback & Navigation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showNav, setShowNav] = useState(false);
  
  // Settings State (Initialized from localStorage)
  const [layoutMode, setLayoutMode] = useState(() => localStorage.getItem('quran_layout') || 'split'); 
  const [theme, setTheme] = useState(() => localStorage.getItem('quran_theme') || 'oled'); 
  const [repeatGoal, setRepeatGoal] = useState(() => Number(localStorage.getItem('quran_repeat')) || 1); 
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('quran_font') || 'md'); 
  
  // Save settings locally
  useEffect(() => {
    localStorage.setItem('quran_layout', layoutMode);
    localStorage.setItem('quran_theme', theme);
    localStorage.setItem('quran_repeat', repeatGoal);
    localStorage.setItem('quran_font', fontSize);
  }, [layoutMode, theme, repeatGoal, fontSize]);

  useWakeLock(isPlaying);
  const handleTimeUpdate = (time) => setCurrentTime(time);
  const { activePlayer, audioRef0, audioRef1, getActiveAudio, internalTimeUpdate } = useGaplessAudio(surahData, null, handleTimeUpdate);

  // Current Ayah Logic
  const currentIndex = surahData.ayahs.findIndex(a => currentTime >= a.start_time && currentTime < a.end_time);
  const currentAyah = currentIndex !== -1 ? surahData.ayahs[currentIndex] : surahData.ayahs[0];

  const jumpToAyah = (startTime) => {
    getActiveAudio().currentTime = startTime;
    setShowNav(false);
  };

  const togglePlayback = () => {
    const audio = getActiveAudio();
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  // Dynamic Theme & Font Classes
  const themeStyles = {
    oled: { bg: 'bg-black', text: 'text-white', english: 'text-gray-300', menu: 'bg-gray-900/95 border-gray-800' },
    dark: { bg: 'bg-[#121212]', text: 'text-[#E8E6D9]', english: 'text-gray-400', menu: 'bg-[#1a1a1a]/95 border-gray-800' },
    paper: { bg: 'bg-[#F4F1EA]', text: 'text-black', english: 'text-gray-700', menu: 'bg-white/95 border-gray-300' },
  };
  const currentTheme = themeStyles[theme];

  const fontClasses = {
    sm: { arabic: 'text-4xl md:text-5xl', english: 'text-lg md:text-xl' },
    md: { arabic: 'text-5xl md:text-7xl', english: 'text-xl md:text-3xl' },
    lg: { arabic: 'text-6xl md:text-8xl', english: 'text-2xl md:text-4xl' },
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 md:p-8 transition-colors duration-700 ${currentTheme.bg}`}>
      
      <audio ref={audioRef0} src={activePlayer === 0 ? surahData.audio_source : ''} onTimeUpdate={activePlayer === 0 ? internalTimeUpdate : undefined} crossOrigin="anonymous" />
      <audio ref={audioRef1} src={activePlayer === 1 ? surahData.audio_source : ''} onTimeUpdate={activePlayer === 1 ? internalTimeUpdate : undefined} crossOrigin="anonymous" />

      {/* --- TELEPROMPTER UI --- */}
      <div className="w-full max-w-5xl flex flex-col items-center space-y-8 md:space-y-12 transition-opacity duration-500 pb-32">
        
        {(layoutMode === 'split' || layoutMode === 'arabic') && (
          <div className="text-center w-full">
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-6 md:gap-x-5" dir="rtl">
              {currentAyah.words.map((word, index) => {
                const isActiveWord = currentTime >= word.start_time && currentTime < word.end_time;
                return (
                  <span key={index} className={`${fontClasses[fontSize].arabic} font-indopak transition-colors duration-150 ${isActiveWord ? 'text-green-400 drop-shadow-md' : currentTheme.text}`}>
                    {word.arabic}
                  </span>
                );
              })}
            </div>
            <div className="mt-8">
              <span className="text-green-500 text-xs md:text-sm tracking-widest uppercase">
                [ Surah {surahData.name} • Ayah {currentAyah.ayah_number} ]
              </span>
            </div>
          </div>
        )}

        {layoutMode === 'split' && <div className="w-2/3 h-px bg-gray-600 opacity-30"></div>}

        {(layoutMode === 'split' || layoutMode === 'english') && (
          <div className="text-center space-y-4 px-4">
            <p className={`${fontClasses[fontSize].english} font-light leading-relaxed max-w-3xl mx-auto ${currentTheme.english}`}>
              {currentAyah.text_english}
            </p>
          </div>
        )}
      </div>

      {/* --- INVISIBLE PAUSE SHIELD --- */}
      {isPlaying && <div className="fixed inset-0 z-40 cursor-pointer" onClick={togglePlayback} />}

      {/* --- ONSCREEN CONTROLS (Hidden while playing) --- */}
      {!isPlaying && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between p-4 md:p-8 pointer-events-none transition-opacity duration-500">
          
          {/* Top Navigation Button */}
          <div className="w-full flex justify-center pointer-events-auto">
            <button 
              onClick={() => setShowNav(true)}
              className={`px-6 py-3 rounded-full border shadow-lg backdrop-blur-md flex items-center space-x-2 text-gray-300 hover:text-white ${currentTheme.menu}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              <span className="font-semibold">{surahData.surah_number}. {surahData.name}</span>
            </button>
          </div>

          {/* Bottom Settings & Playback Bar (Mobile Friendly Stacking) */}
          <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center pointer-events-auto gap-4">
            
            {/* Settings Card */}
            <div className={`w-full md:w-auto flex flex-wrap justify-center md:justify-start gap-4 p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${currentTheme.menu}`}>
              
              {/* Size & Theme */}
              <div className="flex flex-col space-y-1">
                <span className="text-gray-500 text-[10px] uppercase tracking-widest">Font & Theme</span>
                <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
                  <button onClick={() => setFontSize('sm')} className={`px-3 py-1 rounded text-sm ${fontSize === 'sm' ? 'bg-green-600 text-white' : 'text-gray-300'}`}>A-</button>
                  <button onClick={() => setFontSize('md')} className={`px-3 py-1 rounded text-sm ${fontSize === 'md' ? 'bg-green-600 text-white' : 'text-gray-300'}`}>A</button>
                  <button onClick={() => setFontSize('lg')} className={`px-3 py-1 rounded text-sm ${fontSize === 'lg' ? 'bg-green-600 text-white' : 'text-gray-300'}`}>A+</button>
                  <div className="w-px bg-gray-600 mx-1"></div>
                  <button onClick={() => setTheme(theme === 'oled' ? 'paper' : 'oled')} className="px-3 py-1 rounded text-sm text-gray-300 hover:text-white">
                    {theme === 'oled' ? '☀️' : '🌙'}
                  </button>
                </div>
              </div>

              {/* Layout */}
              <div className="flex flex-col space-y-1">
                <span className="text-gray-500 text-[10px] uppercase tracking-widest">Layout</span>
                <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
                  {['arabic', 'split', 'english'].map(mode => (
                    <button key={mode} onClick={() => setLayoutMode(mode)} className={`px-3 py-1 rounded text-sm capitalize ${layoutMode === mode ? 'bg-green-600 text-white' : 'text-gray-300'}`}>{mode}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className={`flex items-center space-x-6 px-8 py-4 rounded-full border shadow-2xl backdrop-blur-md text-white ${currentTheme.menu}`}>
              <button onClick={() => jumpToAyah(currentIndex > 0 ? surahData.ayahs[currentIndex - 1].start_time : 0)} className="text-gray-400 hover:text-white">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 20L9 12l10-8v16zM5 19h2V5H5v14z"/></svg>
              </button>
              <button className="text-green-400 hover:text-green-300 transform hover:scale-110 transition-all" onClick={togglePlayback}>
                <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <button onClick={() => jumpToAyah(currentIndex < surahData.ayahs.length - 1 ? surahData.ayahs[currentIndex + 1].start_time : currentAyah.start_time)} className="text-gray-400 hover:text-white">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M5 4l10 8-10 8V4zm14 1v14h-2V5h2z"/></svg>
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* --- SURAH/AYAH NAV MODAL --- */}
      {showNav && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-lg flex flex-col p-6 text-white overflow-y-auto">
          <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto w-full">
            <h2 className="text-2xl font-light">Select Surah</h2>
            <button onClick={() => setShowNav(false)} className="text-gray-400 hover:text-white p-2 text-xl">✕</button>
          </div>
          
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {allSurahs.map((surah, sIndex) => (
              <div key={surah.surah_number} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <button 
                  onClick={() => { onSurahChange(sIndex); setShowNav(false); }}
                  className="w-full text-left text-xl text-green-400 mb-4 hover:text-green-300">
                  {surah.surah_number}. {surah.name}
                </button>
                <div className="flex flex-wrap gap-2">
                  {surah.ayahs.map(ayah => (
                    <button 
                      key={ayah.ayah_number}
                      onClick={() => {
                        onSurahChange(sIndex);
                        setTimeout(() => jumpToAyah(ayah.start_time), 100);
                      }}
                      className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm flex items-center justify-center">
                      {ayah.ayah_number}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
