import { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';

const WEEK_DAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

const TimeContext = createContext(null);

export function TimeProvider({ children }) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const value = useMemo(() => ({ currentTime, setCurrentTime }), [currentTime]);

  return <TimeContext.Provider value={value}>{children}</TimeContext.Provider>;
}

export function useTime() {
  const context = useContext(TimeContext);

  const currentTime = context?.currentTime || new Date();

  const formatTime = useCallback(
    date => {
      const d = date || currentTime;
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      return `${h}:${m}:${s}`;
    },
    [currentTime]
  );

  const formatDate = useCallback(
    date => {
      const d = date || currentTime;
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const w = WEEK_DAYS[d.getDay()];
      return `${y}年${mo}月${day}日 ${w}`;
    },
    [currentTime]
  );

  return { currentTime, formatTime, formatDate };
}
