'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  { id: 1, name: 'Seoul', korName: '서울' },
  { id: 2, name: 'Busan', korName: '부산' },
  { id: 3, name: 'Incheon', korName: '인천' },
  { id: 4, name: 'Daegu', korName: '대구' },
  { id: 5, name: 'Daejeon', korName: '대전' },
  { id: 6, name: 'Gwangju', korName: '광주' },
  { id: 7, name: 'Ulsan', korName: '울산' },
  { id: 8, name: 'Jeju', korName: '제주' },
];

const MAX_LOCATIONS = 5;

export default function Weather() {
  const [selectedLocations, setSelectedLocations] = useState<LocationWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchWeatherData = async (city: string) => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!API_KEY) {
        throw new Error('OpenWeather API key is not configured');
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error('날씨 정보를 가져오는데 실패했습니다');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      return null;
    }
  };

  useEffect(() => {
    const initializeWeather = async () => {
      setLoading(true);
      const weatherData = await fetchWeatherData('Seoul');
      if (weatherData) {
        setSelectedLocations([{
          id: 1,
          city: 'Seoul',
          data: weatherData
        }]);
      }
      setLoading(false);
    };

    initializeWeather();
  }, []);

  useEffect(() => {
    if (selectedLocations.length === 0) return;

    const updateWeather = async () => {
      setLoading(true);
      const updatedLocations = await Promise.all(
        selectedLocations.map(async (location) => ({
          ...location,
          data: await fetchWeatherData(location.city)
        }))
      );
      setSelectedLocations(updatedLocations);
      setLoading(false);
    };

    const interval = setInterval(updateWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedLocations.length]);

  const addLocation = async (cityName: string) => {
    if (!cityName) return;
    
    if (selectedLocations.length >= MAX_LOCATIONS) {
      alert(`최대 ${MAX_LOCATIONS}개의 도시만 선택할 수 있습니다.`);
      return;
    }
    if (selectedLocations.some(loc => loc.city === cityName)) {
      alert('이미 선택된 도시입니다.');
      return;
    }

    setLoading(true);
    const weatherData = await fetchWeatherData(cityName);
    if (weatherData) {
      const newLocation: LocationWeather = {
        id: Date.now(),
        city: cityName,
        data: weatherData
      };
      setSelectedLocations(prev => [...prev, newLocation]);
      setCurrentIndex(selectedLocations.length);
    }
    setLoading(false);
  };

  const removeLocation = (id: number) => {
    const currentLocation = selectedLocations[currentIndex];
    const locationIndex = selectedLocations.findIndex(loc => loc.id === id);
    
    setSelectedLocations(locations => locations.filter(loc => loc.id !== id));
    
    if (currentLocation.id === id) {
      setCurrentIndex(Math.max(0, locationIndex - 1));
    } else if (locationIndex < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const nextLocation = () => {
    if (currentIndex < selectedLocations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevLocation = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading && selectedLocations.every(loc => !loc.data)) {
    return (
      <motion.div 
        className="flex items-center justify-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700 min-h-[240px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="w-10 h-10 border-t-2 border-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h2 
          className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text flex items-center gap-2"
        >
          <span>
            {selectedLocations[currentIndex]?.data ? 
              CITIES.find(c => c.name === selectedLocations[currentIndex].city)?.korName : '서울'}
          </span>
          <span className="text-gray-400 font-normal">날씨 정보</span>
        </motion.h2>
        {selectedLocations.length < MAX_LOCATIONS && (
          <div className="relative">
            <motion.select
              onChange={(e) => {
                addLocation(e.target.value);
                e.target.value = '';
              }}
              value=""
              className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              whileHover={{ scale: 1.05 }}
            >
              <option value="" disabled>도시 선택 ({selectedLocations.length}/{MAX_LOCATIONS})</option>
              {CITIES.filter(city => !selectedLocations.some(loc => loc.city === city.name)).map(city => (
                <option key={city.id} value={city.name}>
                  {city.korName}
                </option>
              ))}
            </motion.select>
          </div>
        )}
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {selectedLocations[currentIndex]?.data && (
            <motion.div
              key={selectedLocations[currentIndex].id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex items-center space-x-6"
            >
              <motion.img
                src={`http://openweathermap.org/img/wn/${selectedLocations[currentIndex].data.weather[0].icon}@2x.png`}
                alt={selectedLocations[currentIndex].data.weather[0].description}
                className="w-20 h-20 filter brightness-125"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <motion.p className="text-4xl font-bold text-white mb-2">
                    {Math.round(selectedLocations[currentIndex].data.main.temp)}°C
                  </motion.p>
                  <motion.button
                    onClick={() => removeLocation(selectedLocations[currentIndex].id)}
                    className="text-red-400 hover:text-red-300 p-1"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                </div>
                <motion.p className="text-gray-300 mb-2">
                  {CITIES.find(c => c.name === selectedLocations[currentIndex].city)?.korName}
                </motion.p>
                <motion.p className="text-gray-300 mb-2">
                  {selectedLocations[currentIndex].data.weather[0].description}
                </motion.p>
                <motion.p className="text-sm text-gray-400">
                  체감온도: {Math.round(selectedLocations[currentIndex].data.main.feels_like)}°C
                </motion.p>
                <motion.p className="text-sm text-gray-400">
                  습도: {selectedLocations[currentIndex].data.main.humidity}%
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedLocations.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-2">
            <motion.button
              onClick={prevLocation}
              className={`p-2 rounded-full bg-gray-700/50 text-white ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600/50'}`}
              whileHover={currentIndex > 0 ? { scale: 1.1 } : {}}
              whileTap={currentIndex > 0 ? { scale: 0.9 } : {}}
              disabled={currentIndex === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <motion.button
              onClick={nextLocation}
              className={`p-2 rounded-full bg-gray-700/50 text-white ${currentIndex === selectedLocations.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600/50'}`}
              whileHover={currentIndex < selectedLocations.length - 1 ? { scale: 1.1 } : {}}
              whileTap={currentIndex < selectedLocations.length - 1 ? { scale: 0.9 } : {}}
              disabled={currentIndex === selectedLocations.length - 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        )}

        {selectedLocations.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {selectedLocations.map((_, index) => (
              <motion.button
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-blue-500' : 'bg-gray-600'}`}
                onClick={() => setCurrentIndex(index)}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
} 