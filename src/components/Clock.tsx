'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);
  const [is24Hour, setIs24Hour] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('timeFormat') === '24h';
    }
    return false;
  });

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('timeFormat', is24Hour ? '24h' : '12h');
  }, [is24Hour]);

  const formatTime = () => {
    if (!time) return '';
    if (is24Hour) {
      return time.toLocaleTimeString('ko-KR', { hour12: false });
    }
    return time.toLocaleTimeString('ko-KR', { hour12: true });
  };

  const formatDate = () => {
    if (!time) return '';
    return time.toLocaleDateString('ko-KR', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div className="text-sm text-gray-400 mb-2">
        {formatDate()}
      </motion.div>
      <motion.div 
        className="relative text-7xl font-bold font-mono mb-6 select-none"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
           // key={formatTime()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text"
          >
            {formatTime()}
          </motion.div>
        </AnimatePresence>
        <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-pink-500/20" />
      </motion.div>
      <motion.button
        onClick={() => setIs24Hour(!is24Hour)}
        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg relative group overflow-hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className="relative z-10"
          initial={false}
          animate={{ y: is24Hour ? 0 : -20 }}
          transition={{ duration: 0.2 }}
        >
          {is24Hour ? '12시간제로 변경' : '24시간제로 변경'}
        </motion.span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={false}
          transition={{ duration: 0.2 }}
        />
      </motion.button>
    </motion.div>
  );
} 