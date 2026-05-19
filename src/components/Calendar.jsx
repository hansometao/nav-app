import { useState, useEffect, useMemo } from 'react';
import { STORAGE_KEYS } from '../config/storage';
import { Icon } from '../utils/icons';

const CALENDAR_KEY = STORAGE_KEYS.CALENDAR;

// 农历转换数据
const LUNAR_INFO = [
  [0, 2, 9, 21912], [0, 0, 11, 22176], [0, 5, 30, 5384], [0, 0, 30, 18576],
  [0, 0, 29, 1056], [0, 0, 23, 111872], [0, 0, 11, 1112], [0, 5, 28, 60096],
  [0, 0, 13, 31752], [0, 0, 22, 55600], [0, 0, 8, 109376], [0, 5, 27, 4688],
  [0, 0, 17, 12208], [0, 5, 6, 121504], [0, 0, 26, 27216], [0, 0, 13, 55888],
  [0, 0, 2, 11248], [0, 0, 20, 27376], [0, 5, 9, 120864], [0, 0, 28, 52976],
  [0, 0, 16, 46416], [0, 5, 4, 22144], [0, 0, 24, 21912], [0, 0, 13, 11272],
];

const LUNAR_DAYS = ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const LUNAR_MONTHS = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

const HOLIDAYS = {
  '01-01': '元旦',
  '02-14': '情人节',
  '03-08': '妇女节',
  '03-12': '植树节',
  '04-01': '愚人节',
  '05-01': '劳动节',
  '05-04': '青年节',
  '06-01': '儿童节',
  '07-01': '建党节',
  '08-01': '建军节',
  '09-10': '教师节',
  '10-01': '国庆节',
  '12-25': '圣诞节',
};

const EVENT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6',
];

const DEFAULT_EVENTS = [
  { date: '2026-06-01', title: '儿童节', color: '#ef4444', time: '09:00' },
  { date: '2026-10-01', title: '国庆节', color: '#ef4444', time: '00:00' },
  { date: '2026-12-25', title: '圣诞节', color: '#22c55e', time: '00:00' },
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem(CALENDAR_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
    } catch {
      return DEFAULT_EVENTS;
    }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(null);
  const [newEvent, setNewEvent] = useState({ 
    date: '', 
    title: '', 
    color: EVENT_COLORS[0],
    time: '09:00',
    repeat: 'none',
  });
  const [viewMode, setViewMode] = useState('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const monthNames = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  const dayNames = ['日','一','二','三','四','五','六'];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // 农历计算
  const getLunarDate = (date) => {
    const lunarYear = 2026;
    const offset = Math.floor((date - new Date(lunarYear, 0, 29)) / (24 * 60 * 60 * 1000));
    if (offset < 0 || offset >= LUNAR_INFO.length) return null;
    
    const lunarData = LUNAR_INFO[offset];
    const lunarDay = lunarData[1];
    const lunarMonth = lunarData[0];
    const zodiacIndex = (lunarYear - 4) % 12;
    
    return {
      day: LUNAR_DAYS[lunarDay - 1] || '初' + (lunarDay < 10 ? LUNAR_DAYS[lunarDay] : LUNAR_DAYS[lunarDay % 10]),
      month: LUNAR_MONTHS[lunarMonth] || '',
      zodiac: ZODIAC[zodiacIndex],
    };
  };

  const getHolidays = (day) => {
    const monthDay = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return HOLIDAYS[monthDay] || null;
  };

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  useEffect(() => {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(events));
  }, [events]);

  const addEvent = () => {
    if (newEvent.date && newEvent.title) {
      setEvents([...events, { ...newEvent, id: Date.now() }]);
      setNewEvent({ date: '', title: '', color: EVENT_COLORS[0], time: '09:00', repeat: 'none' });
      setShowAdd(false);
    }
  };

  const removeEvent = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const editEvent = (id, updates) => {
    setEvents(events.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  // 获取本周的日期
  const getWeekDates = () => {
    const weekStart = new Date(year, month, today.getDate() - today.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  return (
    <div className="widget calendar-widget">
      <div className="widget-header">
        <h3><Icon name="calendar" size={18} /> 日历</h3>
        <div className="calendar-actions">
          <button className="btn-sm" onClick={goToToday} title="今天">
            今天
          </button>
          <button className="btn-icon" onClick={() => setShowAdd(!showAdd)} title="添加事件">
            <Icon name="plus" size={16} />
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="calendar-add-form">
          <div className="form-group">
            <label>日期：</label>
            <input 
              type="date" 
              value={newEvent.date} 
              onChange={e => setNewEvent({...newEvent, date: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>时间：</label>
            <input 
              type="time" 
              value={newEvent.time} 
              onChange={e => setNewEvent({...newEvent, time: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>标题：</label>
            <input 
              type="text" 
              placeholder="事件名称" 
              value={newEvent.title} 
              onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>颜色：</label>
            <div className="color-picker">
              {EVENT_COLORS.map(color => (
                <button
                  key={color}
                  className={`color-btn ${newEvent.color === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewEvent({...newEvent, color})}
                />
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-sm" onClick={addEvent}>添加</button>
            <button className="btn-sm btn-cancel" onClick={() => setShowAdd(false)}>取消</button>
          </div>
        </div>
      )}

      <div className="calendar-nav">
        <button onClick={prevMonth} className="btn-icon">
          <Icon name="chevronLeft" size={16} />
        </button>
        <span className="calendar-title">{year}年 {monthNames[month]}</span>
        <button onClick={nextMonth} className="btn-icon">
          <Icon name="chevronRight" size={16} />
        </button>
      </div>

      <div className="calendar-legend">
        <span className="legend-item">
          <span className="holiday-dot"></span>节日
        </span>
        <span className="legend-item">
          <span className="event-dot"></span>事件
        </span>
      </div>

      <div className="calendar-grid">
        {dayNames.map(d => (
          <div key={d} className="calendar-day-header">
            <span>{d}</span>
          </div>
        ))}
        {days.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="calendar-day empty" />;
          
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const dayEvents = getEventsForDay(day);
          const holiday = getHolidays(day);
          const lunar = getLunarDate(new Date(year, month, day));
          
          return (
            <div 
              key={day} 
              className={`calendar-day ${isToday ? 'today' : ''} ${dayEvents.length ? 'has-event' : ''}`}
              onClick={() => dayEvents.length > 0 && setShowEventDetail({ day, events: dayEvents })}
            >
              <span className="day-num">{day}</span>
              {lunar && <span className="lunar-day">{lunar.day}</span>}
              {holiday && <span className="holiday-badge">{holiday}</span>}
              {dayEvents.length > 0 && (
                <div className="day-events">
                  {dayEvents.slice(0, 2).map((evt, ei) => (
                    <span 
                      key={ei} 
                      className="day-event-dot" 
                      style={{ backgroundColor: evt.color }}
                      title={evt.title}
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="more-events">+{dayEvents.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showEventDetail && (
        <div className="event-detail-overlay" onClick={() => setShowEventDetail(null)}>
          <div className="event-detail" onClick={e => e.stopPropagation()}>
            <div className="event-detail-header">
              <h4>{year}年{month + 1}月{showEventDetail.day}日</h4>
              <button className="btn-icon" onClick={() => setShowEventDetail(null)}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="event-detail-list">
              {showEventDetail.events.map((evt, i) => (
                <div key={i} className="event-detail-item" style={{ borderLeftColor: evt.color }}>
                  <div className="event-detail-time">{evt.time || '全天'}</div>
                  <div className="event-detail-title">{evt.title}</div>
                  <div className="event-detail-actions">
                    <button className="btn-sm" onClick={() => removeEvent(evt.id)}>
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
