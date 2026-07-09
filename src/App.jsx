import React, { useState } from 'react';
import QuranDisplay from './components/QuranDisplay';

// A mock catalog of Surahs. You can expand this JSON later.
const quranCatalog = [
  {
    surah_number: 1,
    name: "Al-Fatiha",
    audio_source: "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/001.mp3",
    ayahs: [
      { ayah_number: 1, text_english: "In the name of Allah, the Entirely Merciful, the Especially Merciful.", start_time: 0.0, end_time: 7.0, words: [{ arabic: "بِسْمِ", start_time: 0.0, end_time: 1.5 }, { arabic: "اللَّهِ", start_time: 1.5, end_time: 3.0 }, { arabic: "الرَّحْمَٰنِ", start_time: 3.0, end_time: 5.0 }, { arabic: "الرَّحِيمِ", start_time: 5.0, end_time: 7.0 }] },
      { ayah_number: 2, text_english: "[All] praise is [due] to Allah, Lord of the worlds -", start_time: 7.0, end_time: 12.5, words: [{ arabic: "الْحَمْدُ", start_time: 7.0, end_time: 8.5 }, { arabic: "لِلَّهِ", start_time: 8.5, end_time: 9.5 }, { arabic: "رَبِّ", start_time: 9.5, end_time: 10.5 }, { arabic: "الْعَالَمِينَ", start_time: 10.5, end_time: 12.5 }] }
    ]
  },
  {
    surah_number: 36,
    name: "Ya-Sin",
    audio_source: "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/036.mp3",
    ayahs: [
      { ayah_number: 57, text_english: "For them therein is fruit, and for them is whatever they request", start_time: 254.3, end_time: 260.1, words: [{ arabic: "لَهُمْ", start_time: 254.3, end_time: 255.0 }, { arabic: "فِيهَا", start_time: 255.0, end_time: 256.0 }, { arabic: "فَاكِهَةٌ", start_time: 256.0, end_time: 257.5 }, { arabic: "وَلَهُم", start_time: 257.5, end_time: 258.5 }, { arabic: "مَّا", start_time: 258.5, end_time: 259.0 }, { arabic: "يَدَّعُونَ", start_time: 259.0, end_time: 260.1 }] },
      { ayah_number: 58, text_english: "\"Peace,\" a word from a Merciful Lord.", start_time: 260.1, end_time: 265.0, words: [{ arabic: "سَلَامٌ", start_time: 260.1, end_time: 261.2 }, { arabic: "قَوْلًا", start_time: 261.2, end_time: 262.5 }, { arabic: "مِّن", start_time: 262.5, end_time: 263.1 }, { arabic: "رَّبٍّ", start_time: 263.1, end_time: 263.8 }, { arabic: "رَّحِيمٍ", start_time: 263.8, end_time: 265.0 }] }
    ]
  }
];

export default function App() {
  const [activeSurahIndex, setActiveSurahIndex] = useState(0);

  return (
    <QuranDisplay 
      surahData={quranCatalog[activeSurahIndex]} 
      allSurahs={quranCatalog}
      onSurahChange={(index) => setActiveSurahIndex(index)}
    />
  );
}
