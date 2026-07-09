import React, { useState } from 'react';

export default function App() {
  const [status, setStatus] = useState("Ready to fetch data from Quran.com");

  const generateData = async (chapterNum, chapterName) => {
    setStatus(`Fetching Surah ${chapterNum}...`);
    try {
      // 1. Fetch English Translation (Clear Quran) and Arabic Words
      const textRes = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${chapterNum}?words=true&translations=131&fields=text_uthmani&per_page=300`);
      const textData = await textRes.json();
      
      // 2. Fetch Audio Timestamps for Mishary Alafasy (Reciter ID: 7)
      const audioRes = await fetch(`https://api.quran.com/api/v4/recitations/7/by_chapter/${chapterNum}?per_page=300`);
      const audioData = await audioRes.json();

      const paddedNum = String(chapterNum).padStart(3, '0');
      
      const result = {
        surah_number: chapterNum,
        name: chapterName,
        audio_source: `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${paddedNum}.mp3`,
        ayahs: []
      };

      textData.verses.forEach((verse) => {
        const audioVerse = audioData.audio_files.find(a => a.verse_key === verse.verse_key);
        
        const words = verse.words
          .filter(w => w.char_type_name !== 'end')
          .map((word) => {
             // API segments format: [word_position, start_time_ms, end_time_ms]
             const segment = audioVerse?.segments?.find(s => s[0] === word.position);
             return {
                arabic: word.text_uthmani || word.text,
                start_time: segment ? segment[1] / 1000 : 0,
                end_time: segment ? segment[2] / 1000 : 0
             };
          });

        const start = words.length > 0 ? words[0].start_time : 0;
        const end = words.length > 0 ? words[words.length - 1].end_time : 0;

        result.ayahs.push({
          ayah_number: parseInt(verse.verse_key.split(':')[1]),
          text_english: verse.translations[0]?.text.replace(/<[^>]+>/g, ''),
          start_time: start,
          end_time: end,
          words: words
        });
      });

      // Automatically download the formatted JSON file
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chapterNum}.json`;
      a.click();
      
      setStatus(`Successfully downloaded ${chapterNum}.json!`);
    } catch (err) {
      console.error(err);
      setStatus(`Error fetching data: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-8 p-8">
      <h1 className="text-4xl font-light text-green-400">Data Generator</h1>
      <p className="text-gray-400 max-w-lg text-center leading-relaxed">
        This tool securely connects to the Quran.com API. It matches Mishary Alafasy's audio timestamps to individual Arabic words.
      </p>
      
      <div className="flex space-x-6">
        <button onClick={() => generateData(1, "Al-Fatiha")} className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold">
          Download 1.json
        </button>
        <button onClick={() => generateData(36, "Ya-Sin")} className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold">
          Download 36.json
        </button>
      </div>
      
      <p className="text-yellow-500 mt-8 text-xl font-mono">{status}</p>
    </div>
  );
}
