/**
 * 农历万年历计算工具
 * 支持干支纪年、生肖、农历月日、二十四节气等计算
 * @module lunarCalendar
 */

/** @constant {string[]} TIAN_GAN - 天干数组 */
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/** @constant {string[]} DI_ZHI - 地支数组 */
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** @constant {string[]} SHENG_XIAO - 生肖数组 */
const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

/** @constant {string[]} LUNAR_MONTH_NAME - 农历月份名称数组 */
const LUNAR_MONTH_NAME = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];

/** @constant {string[]} LUNAR_DAY_NAME - 农历日期名称数组 */
const LUNAR_DAY_NAME = [
  '初一',
  '初二',
  '初三',
  '初四',
  '初五',
  '初六',
  '初七',
  '初八',
  '初九',
  '初十',
  '十一',
  '十二',
  '十三',
  '十四',
  '十五',
  '十六',
  '十七',
  '十八',
  '十九',
  '二十',
  '廿一',
  '廿二',
  '廿三',
  '廿四',
  '廿五',
  '廿六',
  '廿七',
  '廿八',
  '廿九',
  '三十',
];

/** @constant {string[]} JIE_QI - 二十四节气数组 */
const JIE_QI = [
  '小寒',
  '大寒',
  '立春',
  '雨水',
  '惊蛰',
  '春分',
  '清明',
  '谷雨',
  '立夏',
  '小满',
  '芒种',
  '夏至',
  '小暑',
  '大暑',
  '立秋',
  '处暑',
  '白露',
  '秋分',
  '寒露',
  '霜降',
  '立冬',
  '小雪',
  '大雪',
  '冬至',
];

// 农历数据表（简化版，覆盖主要年份）
const LUNAR_INFO = new Map([
  // 2024年数据
  [
    2024,
    {
      leapMonth: 2,
      data: [
        0x16d60, 0x0ada0, 0x15b50, 0x04b60, 0x0a570, 0x054d4, 0x0d260, 0x0d950, 0x16554, 0x056a0,
        0x05a10, 0x16a50,
      ],
    },
  ],
  // 2025年数据
  [
    2025,
    {
      leapMonth: 0,
      data: [
        0x05650, 0x0aa50, 0x16b58, 0x056d0, 0x04ae0, 0x04ad0, 0x0a4d0, 0x0d260, 0x0d520, 0x0daa0,
        0x16554, 0x056a0,
      ],
    },
  ],
  // 2026年数据
  [
    2026,
    {
      leapMonth: 0,
      data: [
        0x05a10, 0x15650, 0x05650, 0x1a550, 0x1ab60, 0x04b50, 0x05650, 0x056d0, 0x05560, 0x0a6a0,
        0x056d0, 0x04ae0,
      ],
    },
  ],
]);

/**
 * 获取农历年信息（干支纪年、生肖）
 * @param {number} year - 公历年份
 * @returns {Object} 农历年信息
 * @returns {string} returns.tianGan - 天干（甲、乙、丙...）
 * @returns {string} returns.diZhi - 地支（子、丑、寅...）
 * @returns {string} returns.shengXiao - 生肖（鼠、牛、虎...）
 * @returns {string} returns.ganZhi - 干支组合（如：甲辰）
 */
export function getLunarYearInfo(year) {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  return {
    tianGan: TIAN_GAN[ganIndex >= 0 ? ganIndex : ganIndex + 10],
    diZhi: DI_ZHI[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12],
    shengXiao: SHENG_XIAO[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12],
    ganZhi:
      TIAN_GAN[ganIndex >= 0 ? ganIndex : ganIndex + 10] +
      DI_ZHI[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12],
  };
}

/**
 * 将公历日期转换为农历日期
 * @param {Date} date - 公历日期对象
 * @returns {Object} 农历日期信息
 * @returns {number} returns.year - 农历年份
 * @returns {number} returns.month - 农历月份
 * @returns {number} returns.day - 农历日期
 * @returns {boolean} returns.isLeap - 是否为闰月
 * @returns {string} returns.monthName - 农历月份名称（如：正月）
 * @returns {string} returns.dayName - 农历日期名称（如：初一）
 * @returns {string} returns.fullLunar - 完整农历日期（如：正月初一）
 * @returns {string} returns.ganZhi - 干支纪年
 * @returns {string} returns.shengXiao - 生肖
 */
export function solarToLunar(date) {
  const year = date.getFullYear();
  const lunarInfo = getLunarYearInfo(year);

  let lunarYear = year;
  let lunarMonth;
  let lunarDay;

  const springFestival = getSpringFestival(year);
  const daysFromSpring = Math.floor(
    (date.getTime() - springFestival.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysFromSpring >= 0) {
    lunarMonth = Math.floor(daysFromSpring / 30) + 1;
    lunarDay = (daysFromSpring % 30) + 1;
    if (lunarMonth > 12) {
      lunarMonth -= 12;
      lunarYear = year + 1;
    }
  } else {
    const prevSpringFestival = getSpringFestival(year - 1);
    const daysFromPrevSpring = Math.floor(
      (date.getTime() - prevSpringFestival.getTime()) / (1000 * 60 * 60 * 24)
    );
    lunarMonth = 11 + Math.floor(daysFromPrevSpring / 30);
    lunarDay = 30 - (-daysFromSpring % 30);
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
    fullLunar:
      (isLeapMonth ? '闰' : '') +
      LUNAR_MONTH_NAME[lunarMonth - 1] +
      '月' +
      LUNAR_DAY_NAME[lunarDay - 1],
    ganZhi: lunarInfo.ganZhi,
    shengXiao: lunarInfo.shengXiao,
  };
}

// 获取某年春节日期
function getSpringFestival(year) {
  // 春节一般在1月21日到2月20日之间（简化计算）
  return new Date(year, 0, 22);
}

/**
 * 获取指定日期的二十四节气
 * @param {Date} date - 公历日期对象
 * @returns {string|null} 节气名称（如：立春），如果不是节气日则返回null
 */
export function getJieQi(date) {
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
    12: { daxue: 7, dongzhi: 21 },
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

/**
 * 获取完整的农历信息（包含节气）
 * @param {Date} date - 公历日期对象
 * @returns {Object} 完整的农历信息
 * @returns {number} returns.year - 农历年份
 * @returns {number} returns.month - 农历月份
 * @returns {number} returns.day - 农历日期
 * @returns {boolean} returns.isLeap - 是否为闰月
 * @returns {string} returns.monthName - 农历月份名称
 * @returns {string} returns.dayName - 农历日期名称
 * @returns {string} returns.fullLunar - 完整农历日期
 * @returns {string} returns.yearGanZhi - 年份干支
 * @returns {string} returns.yearShengXiao - 年份生肖
 * @returns {string|null} returns.currentJieQi - 当前节气（如有）
 * @returns {string} returns.lunarDateStr - 完整农历日期字符串
 * @returns {string} returns.eraStr - 干支年份字符串（如：甲辰年）
 * @returns {string} returns.zodiacStr - 生肖字符串（如：【龙】）
 */
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
    zodiacStr: `【${yearInfo.shengXiao}】`,
  };
}

/**
 * 格式化农历日期显示
 * @param {Date} date - 公历日期对象
 * @returns {Object} 格式化后的显示文本
 * @returns {string} returns.main - 主显示文本（如：甲辰年 【龙】）
 * @returns {string} returns.sub - 副标题（如：正月初一）
 * @returns {string} returns.full - 完整显示（如：农历2024年 正月初一 · 立春）
 */
export function formatLunarDisplay(date) {
  const info = getLunarInfo(date);
  return {
    main: `${info.eraStr} ${info.zodiacStr}`,
    sub: info.fullLunar,
    full: `${info.lunarDateStr} ${info.currentJieQi ? '· ' + info.currentJieQi : ''}`,
  };
}

export default {
  getLunarYearInfo,
  solarToLunar,
  getJieQi,
  getLunarInfo,
  formatLunarDisplay,
};
