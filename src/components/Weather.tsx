'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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

interface SelectOption {
  value: string;
  label: string;
  enName: string;
}

const CITIES = {
  metropolitan: [
    { id: 'seoul', name: '서울특별시', enName: 'Seoul' },
    { id: 'busan', name: '부산광역시', enName: 'Busan' },
    { id: 'incheon', name: '인천광역시', enName: 'Incheon' },
    { id: 'daegu', name: '대구광역시', enName: 'Daegu' },
    { id: 'gwangju', name: '광주광역시', enName: 'Gwangju' },
    { id: 'daejeon', name: '대전광역시', enName: 'Daejeon' },
    { id: 'ulsan', name: '울산광역시', enName: 'Ulsan' }
  ],
  province: [
    {
      id: 'gyeonggi',
      name: '경기도',
      districts: [
        { id: 'suwon', name: '수원시', enName: 'Suwon' },
        { id: 'seongnam', name: '성남시', enName: 'Seongnam' },
        { id: 'anyang', name: '안양시', enName: 'Anyang' },
        { id: 'bucheon', name: '부천시', enName: 'Bucheon' },
        { id: 'goyang', name: '고양시', enName: 'Goyang' },
        { id: 'yongin', name: '용인시', enName: 'Yongin' },
        { id: 'hwaseong', name: '화성시', enName: 'Hwaseong' },
        { id: 'pyeongtaek', name: '평택시', enName: 'Pyeongtaek' },
        { id: 'uijeongbu', name: '의정부시', enName: 'Uijeongbu' },
        { id: 'siheung', name: '시흥시', enName: 'Siheung' },
        { id: 'paju', name: '파주시', enName: 'Paju' },
        { id: 'gimpo', name: '김포시', enName: 'Gimpo' },
        { id: 'gwangmyeong', name: '광명시', enName: 'Gwangmyeong' },
        { id: 'gwangju', name: '광주시', enName: 'Gwangju-si' },
        { id: 'icheon', name: '이천시', enName: 'Icheon' },
        { id: 'yangju', name: '양주시', enName: 'Yangju' },
        { id: 'guri', name: '구리시', enName: 'Guri' },
        { id: 'namyangju', name: '남양주시', enName: 'Namyangju' },
        { id: 'ansan', name: '안산시', enName: 'Ansan' },
        { id: 'gunpo', name: '군포시', enName: 'Gunpo' },
        { id: 'hanam', name: '하남시', enName: 'Hanam' },
        { id: 'osan', name: '오산시', enName: 'Osan' },
        { id: 'anseong', name: '안성시', enName: 'Anseong' },
        { id: 'pocheon', name: '포천시', enName: 'Pocheon' },
        { id: 'dongducheon', name: '동두천시', enName: 'Dongducheon' },
        { id: 'yeoju', name: '여주시', enName: 'Yeoju' }
      ]
    },
    {
      id: 'gangwon',
      name: '강원도',
      districts: [
        { id: 'chuncheon', name: '춘천시', enName: 'Chuncheon' },
        { id: 'wonju', name: '원주시', enName: 'Wonju' },
        { id: 'gangneung', name: '강릉시', enName: 'Gangneung' },
        { id: 'donghae', name: '동해시', enName: 'Donghae' },
        { id: 'taebaek', name: '태백시', enName: 'Taebaek' },
        { id: 'sokcho', name: '속초시', enName: 'Sokcho' },
        { id: 'samcheok', name: '삼척시', enName: 'Samcheok' }
      ]
    },
    {
      id: 'chungbuk',
      name: '충청북도',
      districts: [
        { id: 'cheongju', name: '청주시', enName: 'Cheongju' },
        { id: 'chungju', name: '충주시', enName: 'Chungju' },
        { id: 'jecheon', name: '제천시', enName: 'Jecheon' },
        { id: 'boeun', name: '보은군', enName: 'Boeun' },
        { id: 'okcheon', name: '옥천군', enName: 'Okcheon' },
        { id: 'yeongdong', name: '영동군', enName: 'Yeongdong' },
        { id: 'jincheon', name: '진천군', enName: 'Jincheon' },
        { id: 'goesan', name: '괴산군', enName: 'Goesan' },
        { id: 'eumseong', name: '음성군', enName: 'Eumseong' },
        { id: 'danyang', name: '단양군', enName: 'Danyang' }
      ]
    },
    {
      id: 'chungnam',
      name: '충청남도',
      districts: [
        { id: 'cheonan', name: '천안시', enName: 'Cheonan' },
        { id: 'gongju', name: '공주시', enName: 'Gongju' },
        { id: 'boryeong', name: '보령시', enName: 'Boryeong' },
        { id: 'asan', name: '아산시', enName: 'Asan' },
        { id: 'seosan', name: '서산시', enName: 'Seosan' },
        { id: 'nonsan', name: '논산시', enName: 'Nonsan' },
        { id: 'gyeryong', name: '계룡시', enName: 'Gyeryong' },
        { id: 'dangjin', name: '당진시', enName: 'Dangjin' }
      ]
    },
    {
      id: 'jeonbuk',
      name: '전라북도',
      districts: [
        { id: 'jeonju', name: '전주시', enName: 'Jeonju' },
        { id: 'gunsan', name: '군산시', enName: 'Gunsan' },
        { id: 'iksan', name: '익산시', enName: 'Iksan' },
        { id: 'jeongeup', name: '정읍시', enName: 'Jeongeup' },
        { id: 'namwon', name: '남원시', enName: 'Namwon' },
        { id: 'gimje', name: '김제시', enName: 'Gimje' },
        { id: 'wanju', name: '완주군', enName: 'Wanju' },
        { id: 'jinan', name: '진안군', enName: 'Jinan' },
        { id: 'muju', name: '무주군', enName: 'Muju' },
        { id: 'jangsu', name: '장수군', enName: 'Jangsu' },
        { id: 'imsil', name: '임실군', enName: 'Imsil' },
        { id: 'sunchang', name: '순창군', enName: 'Sunchang' },
        { id: 'gochang', name: '고창군', enName: 'Gochang' },
        { id: 'buan', name: '부안군', enName: 'Buan' }
      ]
    },
    {
      id: 'jeonnam',
      name: '전라남도',
      districts: [
        { id: 'mokpo', name: '목포시', enName: 'Mokpo' },
        { id: 'yeosu', name: '여수시', enName: 'Yeosu' },
        { id: 'suncheon', name: '순천시', enName: 'Suncheon' },
        { id: 'naju', name: '나주시', enName: 'Naju' },
        { id: 'gwangyang', name: '광양시', enName: 'Gwangyang' },
        { id: 'damyang', name: '담양군', enName: 'Damyang' },
        { id: 'gokseong', name: '곡성군', enName: 'Gokseong' },
        { id: 'gurye', name: '구례군', enName: 'Gurye' },
        { id: 'goheung', name: '고흥군', enName: 'Goheung' },
        { id: 'boseong', name: '보성군', enName: 'Boseong' },
        { id: 'hwasun', name: '화순군', enName: 'Hwasun' },
        { id: 'jangheung', name: '장흥군', enName: 'Jangheung' },
        { id: 'gangjin', name: '강진군', enName: 'Gangjin' },
        { id: 'haenam', name: '해남군', enName: 'Haenam' },
        { id: 'yeongam', name: '영암군', enName: 'Yeongam' },
        { id: 'muan', name: '무안군', enName: 'Muan' },
        { id: 'hampyeong', name: '함평군', enName: 'Hampyeong' },
        { id: 'yeonggwang', name: '영광군', enName: 'Yeonggwang' },
        { id: 'jangseong', name: '장성군', enName: 'Jangseong' },
        { id: 'wando', name: '완도군', enName: 'Wando' },
        { id: 'jindo', name: '진도군', enName: 'Jindo' },
        { id: 'sinan', name: '신안군', enName: 'Sinan' }
      ]
    },
    {
      id: 'gyeongbuk',
      name: '경상북도',
      districts: [
        { id: 'pohang', name: '포항시', enName: 'Pohang' },
        { id: 'gyeongju', name: '경주시', enName: 'Gyeongju' },
        { id: 'gimcheon', name: '김천시', enName: 'Gimcheon' },
        { id: 'andong', name: '안동시', enName: 'Andong' },
        { id: 'gumi', name: '구미시', enName: 'Gumi' },
        { id: 'yeongju', name: '영주시', enName: 'Yeongju' },
        { id: 'yeongcheon', name: '영천시', enName: 'Yeongcheon' },
        { id: 'sangju', name: '상주시', enName: 'Sangju' },
        { id: 'mungyeong', name: '문경시', enName: 'Mungyeong' },
        { id: 'gyeongsan', name: '경산시', enName: 'Gyeongsan' }
      ]
    },
    {
      id: 'gyeongnam',
      name: '경상남도',
      districts: [
        { id: 'changwon', name: '창원시', enName: 'Changwon' },
        { id: 'jinju', name: '진주시', enName: 'Jinju' },
        { id: 'tongyeong', name: '통영시', enName: 'Tongyeong' },
        { id: 'sacheon', name: '사천시', enName: 'Sacheon' },
        { id: 'gimhae', name: '김해시', enName: 'Gimhae' },
        { id: 'miryang', name: '밀양시', enName: 'Miryang' },
        { id: 'geoje', name: '거제시', enName: 'Geoje' },
        { id: 'yangsan', name: '양산시', enName: 'Yangsan' },
        { id: 'uiryeong', name: '의령군', enName: 'Uiryeong' },
        { id: 'haman', name: '함안군', enName: 'Haman' },
        { id: 'changnyeong', name: '창녕군', enName: 'Changnyeong' },
        { id: 'goseong', name: '고성군', enName: 'Goseong' },
        { id: 'namhae', name: '남해군', enName: 'Namhae' },
        { id: 'hadong', name: '하동군', enName: 'Hadong' },
        { id: 'sancheong', name: '산청군', enName: 'Sancheong' },
        { id: 'hamyang', name: '함양군', enName: 'Hamyang' },
        { id: 'geochang', name: '거창군', enName: 'Geochang' },
        { id: 'hapcheon', name: '합천군', enName: 'Hapcheon' }
      ]
    }
  ],
  special: [
    { id: 'sejong', name: '세종특별자치시', enName: 'Sejong' },
    {
      id: 'jeju',
      name: '제주특별자치도',
      districts: [
        { id: 'jeju', name: '제주시', enName: 'Jeju City' },
        { id: 'seogwipo', name: '서귀포시', enName: 'Seogwipo' }
      ]
    }
  ]
};

export default function Weather() {
  const [selectedLocation, setSelectedLocation] = useState<LocationWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const groupedOptions = useMemo(() => {
    const metropolitan: SelectOption[] = [];
    const province: SelectOption[] = [];
    const special: SelectOption[] = [];
    
    // Add metropolitan cities
    CITIES.metropolitan.forEach(city => {
      metropolitan.push({
        value: `metropolitan:${city.id}`,
        label: city.name,
        enName: city.enName
      });
    });

    // Add province districts
    CITIES.province.forEach(prov => {
      prov.districts.forEach(district => {
        province.push({
          value: `province:${prov.id}:${district.id}`,
          label: `${prov.name} ${district.name}`,
          enName: district.enName
        });
      });
    });

    // Add special cities/districts
    CITIES.special.forEach(region => {
      if ('districts' in region) {
        region.districts.forEach(district => {
          special.push({
            value: `special:${region.id}:${district.id}`,
            label: `${region.name} ${district.name}`,
            enName: district.enName
          });
        });
      } else {
        special.push({
          value: `special:${region.id}`,
          label: region.name,
          enName: region.enName
        });
      }
    });

    return {
      metropolitan,
      province,
      special
    };
  }, []);

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedOptions;
    
    const searchLower = searchTerm.toLowerCase();
    return {
      metropolitan: groupedOptions.metropolitan.filter(opt => 
        opt.label.toLowerCase().includes(searchLower)
      ),
      province: groupedOptions.province.filter(opt => 
        opt.label.toLowerCase().includes(searchLower)
      ),
      special: groupedOptions.special.filter(opt => 
        opt.label.toLowerCase().includes(searchLower)
      )
    };
  }, [searchTerm, groupedOptions]);

  const hasResults = useMemo(() => {
    return (
      filteredGroups.metropolitan.length > 0 ||
      filteredGroups.province.length > 0 ||
      filteredGroups.special.length > 0
    );
  }, [filteredGroups]);

  const filteredOptions = useMemo(() => {
    return Object.values(filteredGroups).flat();
  }, [filteredGroups]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchTerm || !hasResults) {
      setFocusedIndex(-1);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          const selected = filteredOptions[focusedIndex];
          handleLocationChange({
            value: selected.value,
            label: selected.label,
            enName: selected.enName
          });
          setSearchTerm('');
          setFocusedIndex(-1);
        }
        break;
      case 'Escape':
        setSearchTerm('');
        setFocusedIndex(-1);
        break;
    }
  };

  const fetchWeatherData = useCallback(async (city: string) => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!API_KEY) {
        return null;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return { cod: "404", message: "city not found" };
        }
        return null;
      }

      return await response.json();
    } catch (err) {
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
          city: '서울특별시',
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

  const handleLocationChange = (selected: SelectOption | null) => {
    if (!selected) return;
    addLocation(selected.value, selected.label, selected.enName);
  };

  const addLocation = async (value: string, cityName: string, enName: string) => {
    if (!value || !cityName || !enName) return;

    setLoading(true);
    const weatherData = await fetchWeatherData(enName);
    if (weatherData && weatherData.cod !== "404") {
      setSelectedLocation({
        id: Date.now(),
        city: cityName,
        data: weatherData
      });
    } else {
      setSelectedLocation({
        id: Date.now(),
        city: `${cityName} (날씨 정보가 없습니다)`,
        data: selectedLocation?.data || null
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
          className={`text-2xl font-bold truncate max-w-full ${
            selectedLocation?.city.includes('날씨 정보가 없습니다')
              ? 'text-red-400'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text'
          }`}
        >
          {selectedLocation?.city || '서울특별시'}
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

      <div className="grid grid-cols-2 gap-8 w-full max-w-md mb-6">
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

      <div className="w-full max-w-xs space-y-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <div className="relative w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setFocusedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="지역명으로 검색..."
            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700/50 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFocusedIndex(-1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-300"
            >
              ✕
            </button>
          )}
          {searchTerm && hasResults && (
            <div className="absolute w-full z-10">
              <ul className="w-full mt-1 max-h-60 overflow-auto bg-gray-800/90 border border-gray-700/50 rounded-lg text-gray-300">
                {filteredOptions.map((opt, index) => (
                  <li 
                    key={opt.value}
                    className={`px-4 py-2 cursor-pointer transition-colors ${
                      index === focusedIndex 
                        ? 'bg-gray-700/70 text-white'
                        : 'hover:bg-gray-700/50'
                    }`}
                    onClick={() => {
                      handleLocationChange({
                        value: opt.value,
                        label: opt.label,
                        enName: opt.enName
                      });
                      setSearchTerm('');
                      setFocusedIndex(-1);
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {searchTerm && !hasResults && (
            <div className="absolute inset-x-0 top-full mt-1 p-2 bg-gray-800/90 border border-gray-700/50 rounded-lg text-gray-400 text-sm">
              검색 결과가 없습니다
            </div>
          )}
        </div>

        <div className="relative w-full">
          <select
            value={selectedLocation?.city ? 
              Object.values(groupedOptions)
                .flat()
                .find(opt => opt.label === selectedLocation.city)?.value : ''
            }
            onChange={(e) => {
              const selected = Object.values(groupedOptions)
                .flat()
                .find(opt => opt.value === e.target.value);
              if (selected) {
                handleLocationChange({
                  value: selected.value,
                  label: selected.label,
                  enName: selected.enName
                });
              }
            }}
            className="w-full px-4 py-2.5 text-base bg-gray-800/70 border border-gray-700/50 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
          >
            <option value="">지역 선택</option>
            <optgroup label="광역시">
              {groupedOptions.metropolitan.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="도">
              {groupedOptions.province.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="특별자치시/도">
              {groupedOptions.special.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>
    </motion.div>
  );
} 