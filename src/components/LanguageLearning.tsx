import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaVolumeUp } from 'react-icons/fa';

interface GeneratedSentence {
  en: string;
  ko: string;
}

export default function LanguageLearning() {
  const [currentSentence, setCurrentSentence] = useState<GeneratedSentence | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const generateNewSentence = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-sentence', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate sentence');
      }

      const data = await response.json();
      setCurrentSentence(data);
    } catch (error) {
      console.error('Error generating sentence:', error);
    } finally {
      setLoading(false);
    }
  };

  const speakText = async (text: string, lang: string) => {
    if (speaking) return;
    
    setSpeaking(true);
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: lang === 'en' ? 'alloy' : 'nova', // English uses alloy, Korean uses nova
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setSpeaking(false);
    }
  };

  return (
    <motion.div 
      className="w-full bg-gradient-to-b from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-800/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
            오늘의 영어 문장
          </h2>
          <motion.button
            onClick={generateNewSentence}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? '번역중...' : '생성 완료'}
          </motion.button>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 space-y-6 border border-gray-800/50">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium bg-gradient-to-r from-blue-400 to-blue-300 text-transparent bg-clip-text">English</p>
              {currentSentence?.en && (
                <motion.button
                  onClick={() => speakText(currentSentence.en, 'en')}
                  disabled={speaking}
                  className={`p-2 rounded-lg hover:bg-gray-800/50 transition-colors ${speaking ? 'opacity-50' : ''}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaVolumeUp className="w-4 h-4 text-blue-400" />
                </motion.button>
              )}
            </div>
            <p className="text-base text-gray-100 font-medium">
              {currentSentence?.en || ""}
            </p>
          </div>

          <div className="pt-6 border-t border-gray-800/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium bg-gradient-to-r from-purple-400 to-purple-300 text-transparent bg-clip-text">Korean</p>
              {currentSentence?.ko && (
                <motion.button
                  onClick={() => speakText(currentSentence.ko, 'ko')}
                  disabled={speaking}
                  className={`p-2 rounded-lg hover:bg-gray-800/50 transition-colors ${speaking ? 'opacity-50' : ''}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaVolumeUp className="w-4 h-4 text-purple-400" />
                </motion.button>
              )}
            </div>
            <p className="text-base text-gray-100 font-medium">
              {currentSentence?.ko || ""}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 