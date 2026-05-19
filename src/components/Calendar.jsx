import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../config/storage';

const CALENDAR_KEY = STORAGE_KEYS.CALENDAR;

const DEFAULT_EVENTS = [
  { date: '2026-06-01', title: '儿童节 🎉' },
  { date: '2026-10-01', title: '国庆节 🇨🇳' },
  { date: '2026-12-25', title: '圣诞节 🎄' },
];

// 农历相关数据
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
];

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const LUNAR_DAYS = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                   '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                   '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

// 获取农历信息
function getLunarDate(date) {
  const baseDate = new Date(1900, 0, 31);
  let offset = Math.floor((date - baseDate) / 86400000);
  let year = 1900;
  let daysInYear;
  
  while (year < 2100 && offset > 0) {
    daysInYear = getLunarYearDays(year);
    if (offset < daysInYear) break;
    offset -= daysInYear;
    year++;
  }
  
  let month = 1;
  let leap = getLeapMonth(year);
  let isLeap = false;
  let daysInMonth;
  
  while (month < 13 && offset > 0) {
    if (leap > 0 && month === leap + 1 && !isLeap) {
      month--;
      isLeap = true;
      daysInMonth = getLeapDays(year);
    } else {
      daysInMonth = getLunarMonthDays(year, month);
    }
    
    if (isLeap && month === leap + 1) isLeap = false;
    
    if (offset < daysInMonth) break;
    offset -= daysInMonth;
    month++;
  }
  
  const day = offset + 1;
  return {
    year,
    month,
    day,
    isLeap,
    yearGanZhi: getYearGanZhi(year),
    animal: ANIMALS[(year - 1900) % 12]
  };
}

function getLunarYearDays(year) {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (LUNAR_INFO[year - 1900] & i) ? 1 : 0;
  }
  return sum + getLeapDays(year);
}

function getLeapMonth(year) {
  return LUNAR_INFO[year - 1900] & 0xf;
}

function getLeapDays(year) {
  if (getLeapMonth(year)) {
    return (LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29;
  }
  return 0;
}

function getLunarMonthDays(year, month) {
  return (LUNAR_INFO[year - 1900] & (0x10000 >> month)) ? 30 : 29;
}

function getYearGanZhi(year) {
  return GAN[(year - 4) % 10] + ZHI[(year - 4) % 12];
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem(CALENDAR_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
    } catch {
      return DEFAULT_EVENTS;
    }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ date: '', title: '' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const lunarToday = getLunarDate(today);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  const dayNames = ['日','一','二','三','四','五','六'];
  const weekNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  useEffect(() => {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(events));
  }, [events]);

  const addEvent = () => {
    if (newEvent.date && newEvent.title) {
      setEvents([...events, { ...newEvent }]);
      setNewEvent({ date: '', title: '' });
      setShowAdd(false);
    }
  };

  const removeEvent = (idx) => {
    setEvents(events.filter((_, i) => i !== idx));
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <button className="btn-icon" onClick={() => setShowAdd(!showAdd)} title="添加事件">+</button>
      </div>

      {showAdd && (
        <div className="add-event-form">
          <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
          <input type="text" placeholder="事件名称" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
          <button className="btn-sm" onClick={addEvent}>添加</button>
        </div>
      )}

      {/* 当天信息卡片 - 默认显示 */}
      <div className="today-card" onClick={() => setShowCalendar(!showCalendar)}>
        <div className="today-main">
          <div className="today-date">
            <span className="today-day">{today.getDate()}</span>
            <div className="today-month-year">
              <span className="today-month">{monthNames[today.getMonth()]}</span>
              <span className="today-year">{today.getFullYear()}年</span>
            </div>
          </div>
          <div className="today-info">
            <div className="today-weekday">{weekNames[today.getDay()]}</div>
            <div className="today-lunar">
              <span>农历 {lunarToday.isLeap ? '闰' : ''}{LUNAR_MONTHS[lunarToday.month - 1]}月{LUNAR_DAYS[lunarToday.day - 1]}</span>
            </div>
            <div className="today-ganzhi">
              <span>{lunarToday.yearGanZhi}年</span>
              <span className="today-animal">【{lunarToday.animal}年】</span>
            </div>
          </div>
        </div>
        <div className="expand-hint">
          <span>{showCalendar ? '收起日历 ▲' : '查看完整日历 ▼'}</span>
        </div>
      </div>

      {/* 展开的完整日历 */}
      {showCalendar && (
        <div className="calendar-expanded">
          <div className="calendar-nav">
            <button onClick={prevMonth} className="btn-icon">‹</button>
            <span className="calendar-title">{year}年 {monthNames[month]}</span>
            <button onClick={nextMonth} className="btn-icon">›</button>
          </div>

          <div className="calendar-grid">
            {dayNames.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
            {days.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} className="calendar-day empty" />;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const dayEvents = getEventsForDay(day);
              return (
                <div key={day} className={`calendar-day ${isToday ? 'today' : ''} ${dayEvents.length ? 'has-event' : ''}`}>
                  <span className="day-num">{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="day-events">
                      {dayEvents.map((evt, ei) => (
                        <span key={ei} className="day-event-dot" title={evt.title}>●</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {events.length > 0 && (
            <div className="event-list">
              <h4>📌 事件</h4>
              {events.map((evt, i) => (
                <div key={i} className="event-item">
                  <span className="event-date">{evt.date}</span>
                  <span className="event-title">{evt.title}</span>
                  <button className="btn-icon btn-remove" onClick={() => removeEvent(i)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
