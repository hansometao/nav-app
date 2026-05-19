import { useState, useEffect, useMemo } from 'react';
import { CACHE_CONFIG, STORAGE_KEYS } from '../config/storage';
import { Icon, getWeatherIcon } from '../utils/icons';

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

  const fetchWeather = async (code) => {
    setLoading(true);
    setError(null);
    
    // 先检查缓存
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.WEATHER);
      if (cached) {
        const { data, forecast, timestamp, code: cachedCode } = JSON.parse(cached);
        if (cachedCode === code && Date.now() - timestamp < CACHE_CONFIG.WEATHER_DURATION) {
          setWeather(data);
          setForecast(forecast);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Weather cache read error:', e);
    }
    
    try {
      // 国家气象局天气数据 (中国天气网 x 中国气象局) - 全部使用 HTTPS
      const [skRes, infoRes] = await Promise.all([
        fetch(`https://www.weather.com.cn/data/sk/${code}.html`, {
          headers: { 'Referer': 'https://www.weather.com.cn' }
        }),
        fetch(`https://www.weather.com.cn/data/cityinfo/${code}.html`, {
          headers: { 'Referer': 'https://www.weather.com.cn' }
        }),
      ]);

      if (!skRes.ok || !infoRes.ok) throw new Error('获取天气数据失败');

      const skData = await skRes.json();
      const infoData = await infoRes.json();

      setWeather(skData.weatherinfo);
      setForecast(infoData.weatherinfo);
      
      // 写入缓存
      try {
        localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify({
          data: skData.weatherinfo,
          forecast: infoData.weatherinfo,
          timestamp: Date.now(),
          code: code
        }));
      } catch (e) {
        console.warn('Weather cache write error:', e);
      }
    } catch {
      setError('获取天气失败，请重试');
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
    const s = parseFloat(ws);
    if (s < 0.3) return 0; if (s < 1.6) return 1; if (s < 3.4) return 2;
    if (s < 5.5) return 3; if (s < 8.0) return 4; if (s < 10.8) return 5;
    if (s < 13.9) return 6; return 7;
  };

  if (loading && !weather) {
    return (
      <div className="widget weather-widget">
        <div className="widget-header"><h3><Icon name="cloudSun" size={18} /> 天气 (中国气象局)</h3></div>
        <div className="weather-loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="widget weather-widget">
      <div className="widget-header">
        <h3><Icon name="cloudSun" size={18} /> 天气 (中国气象局)</h3>
        <div className="city-selector">
          <button className="btn-city" onClick={() => setShowCityPicker(!showCityPicker)}>
            {selectedCity.name} {selectedCity.custom && <Icon name="star" size={14} />} ▾
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
                {city.name} {city.custom && <Icon name="star" size={14} />}
              </button>
            ))}
          </div>
          
          {/* 自定义城市入口 */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px' }}>
            <button
              className="btn-city"
              onClick={() => setShowCustomForm(!showCustomForm)}
              style={{ width: '100%', fontSize: '11px', padding: '4px' }}
            >
              {showCustomForm ? <><Icon name="x" size={14} /> 取消</> : <><Icon name="plus" size={14} /> 添加自定义城市</>}
            </button>
            
            {showCustomForm && (
              <form onSubmit={handleCustomSubmit} style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="城市名称"
                  value={customCity.name}
                  onChange={e => setCustomCity({ ...customCity, name: e.target.value })}
                  className="city-search-input"
                  style={{ marginBottom: 0 }}
                />
                <input
                  type="text"
                  placeholder="城市代码 (如 101010100)"
                  value={customCity.code}
                  onChange={e => setCustomCity({ ...customCity, code: e.target.value })}
                  className="city-search-input"
                  style={{ marginBottom: 0 }}
                />
                <button type="submit" className="btn-sm" style={{ padding: '4px' }}>
                  保存
                </button>
                <a
                  href="http://www.weather.com.cn"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center' }}
                >
                  查询城市代码 →
                </a>
              </form>
            )}
          </div>
          
          {selectedCity.custom && (
            <button
              className="btn-text"
              onClick={clearCustomCity}
              style={{ marginTop: '8px', width: '100%', fontSize: '11px' }}
            >
              <Icon name="trash" size={14} /> 清除自定义城市
            </button>
          )}
        </div>
      )}

      {error && <div className="weather-error">{error}</div>}

      {weather && (
        <>
          <div className="weather-current">
            <div className="weather-temp-row">
              <Icon name={getWeatherIcon(weather.WS)} size={48} className="weather-icon-big" />
              <span className="weather-temp">{weather.temp}°C</span>
            </div>
            <div className="weather-desc">
              {WEATHER_DESC[weather.WS] || weather.weather || '未知'}
            </div>
            <div className="weather-details">
              <span><Icon name="drop" size={14} /> {weather.SD || 'N/A'}</span>
              <span><Icon name="wind" size={14} /> {getWindLevel(weather.WSE)}级/{weather.WD || 'N/A'}</span>
              <span><Icon name="thermometer" size={14} /> 体感 {('AP' in weather) ? `${weather.AP}°C` : `${weather.temp}°C`}</span>
            </div>
          </div>

          {forecast && (
            <div className="weather-info">
              <div className="weather-temp-range">
                <Icon name="thermometer" size={14} /> 温度范围：{forecast.temp1} ~ {forecast.temp2}
              </div>
              <div className="weather-update">
                更新时间：{weather.time || '未知'}
              </div>
            </div>
          )}

          <div className="weather-data-source">
            数据来源：中国气象局 · 国家气象中心
          </div>
        </>
      )}
    </div>
  );
}
