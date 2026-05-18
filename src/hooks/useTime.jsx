import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const WEEK_DAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

// 创建时间上下文，避免多个组件各自创建 setInterval
const TimeContext = createContext(null);

/**
 * 时间提供者组件 - 包裹在应用根节点
 * 每秒更新一次时间，所有子组件共享同一个时间源
 */
export function TimeProvider({ children }) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <TimeContext.Provider value={currentTime}>
      {children}
    </TimeContext.Provider>
  );
}

/**
 * 返回当前时间和格式化函数。
 * 从 TimeContext 读取时间，避免重复的 setInterval。
 */
export function useTime() {
  const currentTime = useContext(TimeContext);
  
  // 如果不在 TimeProvider 内，退化到独立模式
  if (!currentTime) {
    const [localTime, setLocalTime] = useState(() => new Date());
    useEffect(() => {
      const timer = setInterval(() => setLocalTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);
    return useTimeInternal(localTime);
  }
  
  return useTimeInternal(currentTime);
}

/**
 * 内部时间格式化逻辑
 */
function useTimeInternal(currentTime) {
  const formatTime = useCallback((date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, []);

  const formatDate = useCallback((date) => {
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const w = WEEK_DAYS[date.getDay()];
    return `${y}年${mo}月${d}日 ${w}`;
  }, []);

  return { currentTime, formatTime, formatDate };
}
