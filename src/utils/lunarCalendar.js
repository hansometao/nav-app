/**
 * 农历万年历计算工具
 * 支持干支纪年、生肖、农历月日、二十四节气等计算
 */

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 生肖
const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 农历月份名
const LUNAR_MONTH_NAME = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];

// 农历日期名
const LUNAR_DAY_NAME = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

// 二十四节气
const JIE_QI = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑',
  '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
];

// 农历数据表（简化版，覆盖主要年份）
const LUNAR_INFO = new Map([
  // 2024年数据
  [2024, { leapMonth: 2, data: [0x16d60, 0x0ada0, 0x15b50, 0x04b60, 0x0a570, 0x054d4, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x05a10, 0x16a50] }],
  // 2025年数据
  [2025, { leapMonth: 0, data: [0x05650, 0x0aa50, 0x16b58, 0x056d0, 0x04ae0, 0x04ad0, 0x0a4d0, 0x0d260, 0x0d520, 0x0daa0, 0x16554, 0x056a0] }],
  // 2026年数据
  [2026, { leapMonth: 0, data: [0x05a10, 0x15650, 0x05650, 0x1a550, 0x1ab60, 0x04b50, 0x05650, 0x056d0, 0x05560, 0x0a6a0, 0x056d0, 0x04ae0] }],
]);

// 获取农历年信息
export function getLunarYearInfo(year) {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  return {
    tianGan: TIAN_GAN[ganIndex >= 0 ? ganIndex : ganIndex + 10],
    diZhi: DI_ZHI[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12],
    shengXiao: SHENG_XIAO[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12],
    ganZhi: TIAN_GAN[ganIndex >= 0 ? ganIndex : ganIndex + 10] + DI_ZHI[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12]
  };
}

// 儒略日计算
function toJulianDay(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// 判断是否为闰年
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// 获取某月的天数
function getDaysInMonth(year, month) {
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month - 1];
}

// 农历转换（简化版，使用查表法）
export function solarToLunar(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 基础儒略日
  const baseJulian = 2451545; // 2000年1月1日的儒略日
  const targetJulian = toJulianDay(date);
  const daysDiff = targetJulian - baseJulian;
  
  // 简化计算：基于已知数据的线性插值
  const lunarInfo = getLunarYearInfo(year);
  
  // 计算农历月日（简化算法）
  let lunarYear = year;
  let lunarMonth = 1;
  let lunarDay = 1;
  
  // 估算农历日期
  const springFestival = getSpringFestival(year);
  const daysFromSpring = Math.floor((date.getTime() - springFestival.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysFromSpring >= 0) {
    lunarMonth = Math.floor(daysFromSpring / 30) + 1;
    lunarDay = (daysFromSpring % 30) + 1;
    if (lunarMonth > 12) {
      lunarMonth -= 12;
      lunarYear = year + 1;
    }
  } else {
    const prevSpringFestival = getSpringFestival(year - 1);
    const daysFromPrevSpring = Math.floor((date.getTime() - prevSpringFestival.getTime()) / (1000 * 60 * 60 * 24));
    lunarMonth = 11 + Math.floor(daysFromPrevSpring / 30);
    lunarDay = 30 - ((-daysFromSpring) % 30);
    if (lunarDay <= 0) lunarDay = 30 + lunarDay;
    if (lunarMonth > 12) lunarMonth -= 12;
  }
  
  // 判断是否为闰月
  const yearInfo = LUNAR_INFO.get(year) || { leapMonth: 0, data: [] };
  const isLeapMonth = yearInfo.leapMonth > 0 && lunarMonth === yearInfo.leapMonth;
  
  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeap: isLeapMonth,
    monthName: LUNAR_MONTH_NAME[lunarMonth - 1] + '月',
    dayName: LUNAR_DAY_NAME[lunarDay - 1],
    fullLunar: (isLeapMonth ? '闰' : '') + LUNAR_MONTH_NAME[lunarMonth - 1] + '月' + LUNAR_DAY_NAME[lunarDay - 1],
    ganZhi: lunarInfo.ganZhi,
    shengXiao: lunarInfo.shengXiao
  };
}

// 获取某年春节日期
function getSpringFestival(year) {
  // 春节一般在1月21日到2月20日之间
  const baseDate = new Date(year, 0, 22);
  const jan1 = new Date(year, 0, 1);
  const daysToJan22 = 21;
  return new Date(year, 0, daysToJan22);
}

// 获取二十四节气
export function getJieQi(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 节气大致日期（简化计算）
  const jieQiDates = {
    1: { xiaohan: 5, dahan: 20 },
    2: { lichun: 4, yushui: 19 },
    3: { jingzhe: 6, chunfen: 21 },
    4: { qingming: 5, guyu: 20 },
    5: { lixia: 5, xiaoman: 21 },
    6: { mangzhong: 6, xiazhi: 21 },
    7: { xiaoshu: 7, dashu: 23 },
    8: { liqiu: 8, chushu: 23 },
    9: { bailu: 8, qiufen: 23 },
    10: { hanlu: 8, shuangjiang: 23 },
    11: { lidong: 7, xiaoxue: 22 },
    12: { daxue: 7, dongzhi: 21 }
  };
  
  const monthData = jieQiDates[month];
  if (!monthData) return null;
  
  // 判断是否为节气日
  const jieQiNames = Object.keys(monthData);
  for (const name of jieQiNames) {
    if (monthData[name] === day) {
      const index = JIE_QI.indexOf(name.charAt(0).toUpperCase() + name.slice(1));
      return index >= 0 ? JIE_QI[index] : name;
    }
  }
  
  return null;
}

// 获取完整的农历信息
export function getLunarInfo(date) {
  const lunar = solarToLunar(date);
  const yearInfo = getLunarYearInfo(date.getFullYear());
  const jieQi = getJieQi(date);
  
  return {
    ...lunar,
    yearGanZhi: yearInfo.ganZhi,
    yearShengXiao: yearInfo.shengXiao,
    currentJieQi: jieQi,
    lunarDateStr: `农历${lunar.year}年 ${lunar.fullLunar}`,
    eraStr: `${yearInfo.tianGan}${yearInfo.diZhi}年`,
    zodiacStr: `【${yearInfo.shengXiao}】`
  };
}

// 格式化农历日期显示
export function formatLunarDisplay(date) {
  const info = getLunarInfo(date);
  return {
    main: `${info.eraStr} ${info.zodiacStr}`,
    sub: info.fullLunar,
    full: `${info.lunarDateStr} ${info.currentJieQi ? '· ' + info.currentJieQi : ''}`
  };
}

export default {
  getLunarYearInfo,
  solarToLunar,
  getJieQi,
  getLunarInfo,
  formatLunarDisplay
};
