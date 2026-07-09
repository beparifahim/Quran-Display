import React from 'react';
import QuranDisplay from './components/QuranDisplay';

const mockSurahData = {
  surah_number: 36,
  audio_source: "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/036.mp3", 
  ayahs: [
    {
      ayah_number: 58,
      text_english: "\"Peace,\" a word from a Merciful Lord.",
      start_time: 0.0,
      end_time: 5.0,
      words: [
        { arabic: "سَلَامٌ", start_time: 0.0, end_time: 1.0 },
        { arabic: "قَوْلًا", start_time: 1.0, end_time: 2.0 },
        { arabic: "مِّن", start_time: 2.0, end_time: 3.0 },
        { arabic: "رَّبٍّ", start_time: 3.0, end_time: 4.0 },
        { arabic: "رَّحِيمٍ", start_time: 4.0, end_time: 5.0 }
      ]
    }
  ]
};

export default function App() {
  return <QuranDisplay surahData={mockSurahData} nextSurahData={null} />;
}
