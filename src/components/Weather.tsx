'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  name: string;
}

interface LocationWeather {
  id: number;
  city: string;
  data: WeatherData | null;
}

const CITIES = [
  { id: 'gyeonggi', name: '경기도', enName: 'Suwon' },        // 약 1,370만
  { id: 'seoul', name: '서울특별시', enName: 'Seoul' },       // 약 940만
  { id: 'busan', name: '부산광역시', enName: 'Busan' },       // 약 330만
  { id: 'gyeongnam', name: '경상남도', enName: 'Changwon' },  // 약 330만
  { id: 'incheon', name: '인천광역시', enName: 'Incheon' },   // 약 290만
  { id: 'gyeongbuk', name: '경상북도', enName: 'Andong' },    // 약 260만
  { id: 'daegu', name: '대구광역시', enName: 'Daegu' },       // 약 240만
  { id: 'jeonnam', name: '전라남도', enName: 'Muan' },        // 약 180만
  { id: 'chungnam', name: '충청남도', enName: 'Hongseong' },  // 약 210만
  { id: 'jeonbuk', name: '전라북도', enName: 'Jeonju' },      // 약 180만
  { id: 'gangwon', name: '강원도', enName: 'Chuncheon' },     // 약 150만
  { id: 'chungbuk', name: '충청북도', enName: 'Cheongju' },   // 약 160만
  { id: 'gwangju', name: '광주광역시', enName: 'Gwangju' },   // 약 140만
  { id: 'daejeon', name: '대전광역시', enName: 'Daejeon' },   // 약 140만
  { id: 'ulsan', name: '울산광역시', enName: 'Ulsan' },       // 약 110만
  { id: 'jeju', name: '제주특별자치도', enName: 'Jeju' },     // 약 67만
  { id: 'sejong', name: '세종특별자치시', enName: 'Sejong' }  // 약 37만
];

export default function Weather() {
  const [selectedLocation, setSelectedLocation] = useState<LocationWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = useCallback(async (city: string) => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!API_KEY) {
        const error = new Error('OpenWeather API key is not configured');
        setError(error.message);
        return null;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        const error = new Error('날씨 정보를 가져오는데 실패했습니다');
        setError(error.message);
        return null;
      }

      setError(null);
      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
      setError(errorMessage);
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeWeather = async () => {
      setLoading(true);
      const weatherData = await fetchWeatherData('Seoul');
      if (weatherData) {
        setSelectedLocation({
          id: 1,
          city: 'Seoul',
          data: weatherData
        });
      }
      setLoading(false);
    };

    initializeWeather();
  }, [fetchWeatherData]);

  useEffect(() => {
    if (!selectedLocation) return;

    const updateWeather = async () => {
      setLoading(true);
      const weatherData = await fetchWeatherData(selectedLocation.city);
      if (weatherData) {
        setSelectedLocation(prev => ({
          ...prev!,
          data: weatherData
        }));
      }
      setLoading(false);
    };

    const interval = setInterval(updateWeather, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [selectedLocation, fetchWeatherData]);

  const addLocation = async (cityId: string) => {
    if (!cityId) return;
    
    const city = CITIES.find(c => c.id === cityId);
    if (!city) return;

    setLoading(true);
    const weatherData = await fetchWeatherData(city.enName);
    if (weatherData) {
      setSelectedLocation({
        id: Date.now(),
        city: city.name,
        data: weatherData
      });
    }
    setLoading(false);
  };

  if (loading && !selectedLocation?.data) {
    return (
      <motion.div 
        className="flex items-center justify-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700 min-h-[240px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="w-10 h-10 border-t-2 border-blue-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-red-400">{error}</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col items-center justify-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex flex-col items-center gap-2 mb-6">
        <motion.h2 
          className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text"
        >
          {selectedLocation?.data ? 
            CITIES.find(c => c.name === selectedLocation.city)?.name : '서울특별시'}
        </motion.h2>
        <p className="text-sm text-gray-400">실시간 날씨 정보</p>
      </div>

      {selectedLocation?.data && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative text-center mb-6 select-none"
        >
          <div className="flex items-center justify-center gap-4">
            <motion.img
              src={`http://openweathermap.org/img/wn/${selectedLocation.data.weather[0].icon}@2x.png`}
              alt={selectedLocation.data.weather[0].description}
              className="w-20 h-20 filter brightness-125"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            />
            <motion.div 
              className="text-7xl font-bold font-mono bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text"
            >
              {Math.round(selectedLocation.data.main.temp)}°
            </motion.div>
          </div>
          <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-pink-500/20" />
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-8 w-full max-w-md">
        <div className="flex flex-col items-center p-4">
          <p className="text-gray-400 text-sm mb-2">체감 온도</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            {Math.round(selectedLocation?.data?.main.feels_like ?? 0)}°
          </p>
        </div>
        <div className="flex flex-col items-center p-4">
          <p className="text-gray-400 text-sm mb-2">습도</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
            {selectedLocation?.data?.main.humidity ?? 0}%
          </p>
        </div>
      </div>

      <motion.select
        value={selectedLocation?.city ? CITIES.find(c => c.name === selectedLocation.city)?.id || '' : ''}
        onChange={(e) => addLocation(e.target.value)}
        className="mt-6 px-4 py-2.5 text-base bg-gray-800/70 border border-gray-700/50 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
        whileHover={{ scale: 1.02 }}
      >
        <option value="">도시 선택</option>
        {CITIES.map(city => (
          <option key={city.id} value={city.id} className="bg-gray-800 text-gray-300">
            {city.name}
          </option>
        ))}
      </motion.select>
    </motion.div>
  );
} 