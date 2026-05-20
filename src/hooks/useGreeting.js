import { useState, useEffect } from 'react';

/** @constant {Array} GREETINGS - 不同时间段的问候语配置 */
const GREETINGS = [
  { maxHour: 6, text: '夜深了 🌙' },
  { maxHour: 9, text: '早上好 🌅' },
  { maxHour: 12, text: '上午好 ☀️' },
  { maxHour: 14, text: '中午好 🌞' },
  { maxHour: 18, text: '下午好 🌤' },
  { maxHour: 24, text: '晚上好 🌆' },
];

/**
 * 根据当前时间获取对应的问候语
 * @returns {string} - 问候语文本
 */
function getGreeting() {
  const hour = new Date().getHours();
  for (const g of GREETINGS) {
    if (hour < g.maxHour) return g.text;
  }
  return '晚上好 🌆';
}

/**
 * 返回随时间变化的问候语 Hook
 * 根据当前时间自动切换问候语（每小时自动更新一次）
 * @returns {string} - 当前时间段的问候语
 * @example
 * const greeting = useGreeting(); // 返回 "上午好 ☀️"
 */
export function useGreeting() {
  const [greeting, setGreeting] = useState(getGreeting);

  useEffect(() => {
    // 到整点再检查，比每秒刷更合理
    const msToNextHour = (60 - new Date().getMinutes()) * 60 * 1000;
    const timeout = setTimeout(() => setGreeting(getGreeting()), msToNextHour);
    return () => clearTimeout(timeout);
  }, []);

  return greeting;
}
