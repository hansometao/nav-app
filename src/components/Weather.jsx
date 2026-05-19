import { useState, useEffect, useMemo } from 'react';
import { CACHE_CONFIG, STORAGE_KEYS } from '../config/storage';
import { Icon, getWeatherIcon } from '../utils/icons';
import ErrorMessage from './ErrorMessage';
import { fetchWithTimeout, getErrorMessage, withRetry } from '../utils/apiErrorHandler';
import { WeatherForecast } from './weather';

// 中国天气网城市代码 (国家气象局数据)
const CITY_DB = [
  { name: '北京', code: '101010100' }, { name: '上海', code: '101020100' },
  { name: '广州', code: '101280101' }, { name: '深圳', code: '101280601' },
  { name: '杭州', code: '101210101' }, { name: '南京', code: '101190101' },
  { name: '成都', code: '101270101' }, { name: '重庆', code: '101040100' },
  { name: '武汉', code: '101200101' }, { name: '西安', code: '101110101' },
  { name: '天津', code: '101030100' }, { name: '苏州', code: '101190401' },
  { name: '长沙', code: '101250101' }, { name: '郑州', code: '101180101' },
  { name: '东莞', code: '101281601' }, { name: '青岛', code: '101120201' },
  { name: '沈阳', code: '101070101' }, { name: '宁波', code: '101210401' },
  { name: '昆明', code: '101290101' }, { name: '大连', code: '101070201' },
  { name: '厦门', code: '101230201' }, { name: '合肥', code: '101220101' },
  { name: '佛山', code: '101280301' }, { name: '福州', code: '101230101' },
  { name: '哈尔滨', code: '101050101' }, { name: '济南', code: '101120101' },
  { name: '温州', code: '101210701' }, { name: '南宁', code: '101300101' },
  { name: '长春', code: '101060101' }, { name: '泉州', code: '101230501' },
  { name: '石家庄', code: '101090101' }, { name: '贵阳', code: '101260101' },
  { name: '南昌', code: '101240101' }, { name: '无锡', code: '101190201' },
  { name: '珠海', code: '101280701' }, { name: '太原', code: '101100101' },
  { name: '兰州', code: '101160101' }, { name: '中山', code: '101281701' },
  { name: '海口', code: '101310101' }, { name: '乌鲁木齐', code: '101130101' },
];

const WEATHER_DESC = {
  '0': '晴', '1': '多云', '2': '阴', '3': '阵雨', '4': '雷阵雨',
  '5': '雷阵雨伴有冰雹', '6': '雨夹雪', '7': '小雨', '8': '中雨',
  '9': '大雨', '10': '暴雨', '11': '大暴雨', '12': '特大暴雨',
  '13': '阵雪', '14': '小雪', '15': '中雪', '16': '大雪',
  '17': '暴雪', '18': '雾', '19': '冻雨', '20': '沙尘暴',
  '21': '小到中雨', '22': '中到大雨', '23': '大到暴雨',
  '24': '暴雨到大暴雨', '25': '大暴雨到特大暴雨', '26': '小到中雪',
  '27': '中到大雪', '28': '大到暴雪', '29': '浮尘', '30': '扬沙',
  '31': '强沙尘暴', '32': '霾', '33': '浓雾', '53': 'undefined',
};

// 自定义城市存储键
const CUSTOM_CITY_KEY = 'nav_app_custom_city_v1';

// 模拟天气数据生成器
const generateMockWeather = (cityName) => {
  const weatherTypes = ['晴', '多云', '阴', '小雨', '中雨'];
  const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
  const hour = new Date().getHours();
  const baseTemp = hour > 6 && hour < 18 ? 22 + Math.floor(Math.random() * 8) : 16 + Math.floor(Math.random() * 6);
  const tempRange = 6 + Math.floor(Math.random() * 6);
  
  return {
    weatherinfo: {
      city: cityName,
      temp: baseTemp,
      WD: ['东风', '南风', '西风', '北风'][Math.floor(Math.random() * 4)],
      WS: `${Math.floor(Math.random() * 3) + 1}级`,
      SD: `${50 + Math.floor(Math.random() * 30)}%`,
      AP: baseTemp + Math.floor(Math.random() * 3) - 1,
      weather: weather,
      temp1: `${baseTemp - tempRange / 2}℃`,
      temp2: `${baseTemp + tempRange / 2}℃`
    }
  };
};

export default function Weather() {
  const [selectedCity, setSelectedCity] = useState(() => {
    // 优先加载用户自定义城市
    try {
      const custom = localStorage.getItem(CUSTOM_CITY_KEY);
      if (custom) return JSON.parse(custom);
    } catch (e) {
      console.error('Failed to load custom city:', e);
    }
    return CITY_DB[0]; // 北京
  });
  
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customCity, setCustomCity] = useState({ name: '', code: '' });
  const [useMockData, setUseMockData] = useState(false);

  // 合并内置城市和自定义城市（使用 state 来追踪自定义城市）
  const [customCityData, setCustomCityData] = useState(() => {
    try {
      const custom = localStorage.getItem(CUSTOM_CITY_KEY);
      return custom ? JSON.parse(custom) : null;
    } catch (e) {
      console.error('Failed to load custom city for list:', e);
      return null;
    }
  });

  const allCities = useMemo(() => {
    if (customCityData) {
      return [{ ...customCityData, custom: true }, ...CITY_DB];
    }
    return CITY_DB;
  }, [customCityData]);

  const filteredCities = searchText
    ? allCities.filter(c => c.name.includes(searchText))
    : allCities;

  const fetchWeather = async (code, forceMock = false) => {
    setLoading(true);
    setError(null);
    
    // 先检查缓存
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.WEATHER);
      if (cached && !forceMock) {
        const { data, forecast, timestamp, code: cachedCode, isMock } = JSON.parse(cached);
        if (cachedCode === code && Date.now() - timestamp < CACHE_CONFIG.WEATHER_DURATION) {
          setWeather(data);
          setForecast(forecast);
          setUseMockData(isMock);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Weather cache read error:', e);
    }
    
    try {
      // 如果强制使用模拟数据或者之前使用了模拟数据
      if (forceMock) {
        throw new Error('Use mock data');
      }
      
      // 使用重试机制和超时控制
      const fetchWeatherData = async () => {
        const [skRes, infoRes] = await Promise.all([
          fetchWithTimeout(`https://www.weather.com.cn/data/sk/${code}.html`, {
            headers: { 'Referer': 'https://www.weather.com.cn' }
          }, 5000),
          fetchWithTimeout(`https://www.weather.com.cn/data/cityinfo/${code}.html`, {
            headers: { 'Referer': 'https://www.weather.com.cn' }
          }, 5000),
        ]);

        if (!skRes.ok || !infoRes.ok) {
          const error = new Error(`HTTP ${skRes.status || infoRes.status}`);
          error.status = skRes.status || infoRes.status;
          throw error;
        }

        const skData = await skRes.json();
        const infoData = await infoRes.json();

        return { skData, infoData };
      };

      const { skData, infoData } = await withRetry(fetchWeatherData, 1, 1000);

      setWeather(skData.weatherinfo);
      setForecast(infoData.weatherinfo);
      setUseMockData(false);
      
      // 写入缓存
      try {
        localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify({
          data: skData.weatherinfo,
          forecast: infoData.weatherinfo,
          timestamp: Date.now(),
          code: code,
          isMock: false
        }));
      } catch (e) {
        console.warn('Weather cache write error:', e);
      }
    } catch (err) {
      console.warn('Using mock weather data:', err);
      // 使用模拟数据
      const mockSkData = generateMockWeather(selectedCity.name);
      const mockForecast = generateMockWeather(selectedCity.name);
      
      setWeather(mockSkData.weatherinfo);
      setForecast(mockForecast.weatherinfo);
      setUseMockData(true);
      
      // 缓存模拟数据
      try {
        localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify({
          data: mockSkData.weatherinfo,
          forecast: mockForecast.weatherinfo,
          timestamp: Date.now(),
          code: code,
          isMock: true
        }));
      } catch (e) {
        console.warn('Weather cache write error:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity.code);
  }, [selectedCity]);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setShowCityPicker(false);
    setSearchText('');
    
    // 如果是自定义城市，保存到 localStorage
    if (city.custom) {
      try {
        const cityData = { name: city.name, code: city.code };
        localStorage.setItem(CUSTOM_CITY_KEY, JSON.stringify(cityData));
        setCustomCityData(cityData);
      } catch (e) {
        console.error('Failed to save custom city:', e);
      }
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customCity.name && customCity.code) {
      const city = { name: customCity.name, code: customCity.code, custom: true };
      handleCitySelect(city);
      setShowCustomForm(false);
      setCustomCity({ name: '', code: '' });
    }
  };

  const clearCustomCity = () => {
    try {
      localStorage.removeItem(CUSTOM_CITY_KEY);
      setCustomCityData(null);
      setSelectedCity(CITY_DB[0]);
    } catch (e) {
      console.error('Failed to clear custom city:', e);
    }
  };

  const getWindLevel = (ws) => {
    if (typeof ws === 'string') {
      if (ws.includes('级')) return parseInt(ws);
      const s = parseFloat(ws);
      if (!isNaN(s)) ws = s;
    }
    if (typeof ws === 'number') {
      const s = ws;
      if (s < 0.3) return 0; if (s < 1.6) return 1; if (s < 3.4) return 2;
      if (s < 5.5) return 3; if (s < 8.0) return 4; if (s < 10.8) return 5;
      if (s < 13.9) return 6; return 7;
    }
    return 2; // 默认返回 2 级
  };

  const getWeatherDescription = (w) => {
    if (w === undefined || w === null) return '晴';
    if (typeof w === 'string' && w.length > 0 && w.length <= 3) return w;
    return WEATHER_DESC[String(w)] || '晴';
  };

  if (loading && !weather) {
    return (
      <div className="widget weather-widget">
        <div className="widget-header">
          <h3><Icon name="cloudSun" size={18} /> 天气</h3>
        </div>
        <div className="weather-loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="widget weather-widget">
      <div className="widget-header">
        <h3><Icon name="cloudSun" size={16} /> 天气</h3>
        <div className="city-selector">
          <button className="btn-city" onClick={() => setShowCityPicker(!showCityPicker)}>
            {selectedCity.name} {selectedCity.custom && <Icon name="star" size={12} />}
            {useMockData && <span style={{fontSize: '10px', opacity: 0.7, marginLeft: '4px'}}>模拟</span>}
          </button>
        </div>
      </div>

      {showCityPicker && (
        <div className="city-picker-dropdown">
          <input
            type="text"
            placeholder="搜索城市..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="city-search-input"
            autoFocus
          />
          <div className="city-list">
            {filteredCities.map(city => (
              <button
                key={city.code}
                className={`city-option ${city.code === selectedCity.code ? 'active' : ''}`}
                onClick={() => handleCitySelect(city)}
              >
                {city.name}
              </button>
            ))}
          </div>
          <div style={{padding: '8px 12px', borderTop: '1px solid var(--border)', marginTop: '8px'}}>
            <button 
              onClick={() => { setShowCityPicker(false); setShowCustomForm(true); }}
              style={{width: '100%', padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px'}}
            >
              + 添加自定义城市
            </button>
          </div>
        </div>
      )}

      {showCustomForm && (
        <div style={{padding: '12px', background: 'var(--bg-secondary)'}}>
          <h4 style={{margin: '0 0 12px', fontSize: '13px', color: 'var(--text-primary)'}}>添加自定义城市</h4>
          <form onSubmit={handleCustomSubmit}>
            <input
              type="text"
              placeholder="城市名称"
              value={customCity.name}
              onChange={e => setCustomCity({...customCity, name: e.target.value})}
              style={{width: '100%', marginBottom: '8px', padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)', color: 'var(--text-primary)'}}
            />
            <input
              type="text"
              placeholder="中国天气网城市代码"
              value={customCity.code}
              onChange={e => setCustomCity({...customCity, code: e.target.value})}
              style={{width: '100%', marginBottom: '8px', padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)', color: 'var(--text-primary)'}}
            />
            <div style={{display: 'flex', gap: '8px'}}>
              <button type="submit" style={{flex: 1, padding: '8px', background: 'var(--accent-500)', border: 'none', borderRadius: 'var(--radius-xs)', color: 'white', cursor: 'pointer'}}>添加</button>
              <button type="button" onClick={() => setShowCustomForm(false)} style={{padding: '8px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)', color: 'var(--text-secondary)', cursor: 'pointer'}}>取消</button>
            </div>
          </form>
        </div>
      )}

      {error && !weather && (
        <ErrorMessage 
          message={error} 
          onRetry={() => fetchWeather(selectedCity.code)}
          type="warning"
        />
      )}

      {weather && (
        <>
          <div className="weather-current">
            <div className="weather-temp-row">
              <Icon name={getWeatherIcon(getWeatherDescription(weather.weather || weather.WS))} size={40} className="weather-icon-big" />
              <span className="weather-temp">{weather.temp}°C</span>
            </div>
            <div className="weather-desc">
              {getWeatherDescription(weather.weather || weather.WS)}
            </div>
            <div className="weather-details">
              <span><Icon name="drop" size={12} /> {weather.SD || '55%'}</span>
              <span><Icon name="wind" size={12} /> {getWindLevel(weather.WS || weather.WSE)}级</span>
              <span><Icon name="thermometer" size={12} /> 体感{('AP' in weather) ? `${weather.AP}°` : `${weather.temp}°`}</span>
            </div>
          </div>

          {forecast && (
            <div className="weather-info">
              <div className="weather-temp-range">
                {forecast.temp1 ? forecast.temp1.replace('℃', '°') : (parseInt(weather.temp) - 5) + '°'} ~ {forecast.temp2 ? forecast.temp2.replace('℃', '°') : (parseInt(weather.temp) + 5) + '°'}
              </div>
            </div>
          )}

          {/* 天气预报 */}
          <WeatherForecast cityCode={selectedCity.code} cityName={selectedCity.name} />
          
          {/* 刷新按钮 */}
          <div style={{padding: '8px 12px', display: 'flex', justifyContent: 'center', gap: '8px'}}>
            <button 
              onClick={() => fetchWeather(selectedCity.code)} 
              style={{padding: '6px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'}}
            >
              <Icon name="refreshCw" size={12} /> 刷新
            </button>
            {!useMockData && (
              <button 
                onClick={() => fetchWeather(selectedCity.code, true)} 
                style={{padding: '6px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'}}
              >
                模拟数据
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
