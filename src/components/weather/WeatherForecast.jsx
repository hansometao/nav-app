import { useState, useEffect } from 'react';
import { Icon, getWeatherIcon } from '../../utils/icons';
import ErrorMessage from '../ErrorMessage';
import { fetchWithTimeout, getErrorMessage, withRetry } from '../../utils/apiErrorHandler';

export default function WeatherForecast({ cityCode, cityName }) {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchForecast = async () => {
    if (!cityCode) return;

    setLoading(true);
    setError(null);

    try {
      // 使用中国天气网的预报接口
      const fetchData = async () => {
        const response = await fetchWithTimeout(
          `https://d1.weather.com.cn/calendar_new/${cityCode.slice(0, 2)}/${cityCode}.html`,
          {},
          10000
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const text = await response.text();
        // 解析返回的数据（这是一个 JSONP 格式的数据）
        const match = text.match(/var observe24h_data = (\[.*?\]);/);
        if (match) {
          return JSON.parse(match[1]);
        }
        return [];
      };

      const data = await withRetry(fetchData, 2, 1500);

      // 处理数据，获取未来5天
      const processedForecast = data.slice(0, 5).map((day, index) => ({
        date:
          day.date ||
          new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dayName: getDayName(index),
        tempHigh: day.hmax || '--',
        tempLow: day.hmin || '--',
        weather: day.hgl || '晴',
        wind: day.hwd || '微风',
        windLevel: day.hwl || '1级',
      }));

      setForecast(processedForecast);
    } catch (err) {
      console.error('Forecast fetch error:', err);
      // 使用模拟数据作为 fallback
      setForecast(generateMockForecast());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [cityCode]);

  const getDayName = index => {
    const days = ['今天', '明天', '后天'];
    if (index < 3) return days[index];
    const date = new Date();
    date.setDate(date.getDate() + index);
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekDays[date.getDay()];
  };

  const generateMockForecast = () => {
    const weatherTypes = [
      { name: '晴', icon: 'sun' },
      { name: '多云', icon: 'cloud' },
      { name: '阴', icon: 'cloud' },
      { name: '小雨', icon: 'cloudRain' },
      { name: '中雨', icon: 'cloudRain' },
    ];

    return Array.from({ length: 5 }, (_, i) => {
      const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      const baseTemp = 20 + Math.floor(Math.random() * 10) - 5;
      return {
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dayName: getDayName(i),
        tempHigh: baseTemp + 5,
        tempLow: baseTemp - 3,
        weather: weather.name,
        icon: weather.icon,
        wind: ['微风', '东风', '南风', '北风'][Math.floor(Math.random() * 4)],
        windLevel: `${Math.floor(Math.random() * 3) + 1}级`,
      };
    });
  };

  if (loading) {
    return (
      <div className="weather-forecast loading">
        <div className="forecast-loading">加载预报中...</div>
      </div>
    );
  }

  if (error && forecast.length === 0) {
    return <ErrorMessage message={error} onRetry={fetchForecast} type="warning" />;
  }

  return (
    <div className="weather-forecast">
      <div className="forecast-header">
        <Icon name="calendar" size={16} />
        <span>未来5天预报</span>
      </div>
      <div className="forecast-list">
        {forecast.map((day, index) => (
          <div key={day.date} className="forecast-item">
            <div className="forecast-day">{day.dayName}</div>
            <div className="forecast-date">{day.date.slice(5)}</div>
            <div className="forecast-weather">
              <Icon name={getWeatherIcon(day.weather)} size={20} />
              <span>{day.weather}</span>
            </div>
            <div className="forecast-temp">
              <span className="temp-high">{day.tempHigh}°</span>
              <span className="temp-divider">/</span>
              <span className="temp-low">{day.tempLow}°</span>
            </div>
            <div className="forecast-wind">
              {day.wind} {day.windLevel}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
