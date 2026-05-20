import { useState, useMemo } from 'react';
import { Icon } from '../utils/icons';
import { getLunarInfo, getLunarYearInfo } from '../utils/lunarCalendar';

const CALENDAR_KEY = 'nav_app_calendar';

const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑',
  '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至',
];

const HOLIDAYS = {
  '01-01': { name: '元旦', type: 'national' },
  '02-14': { name: '情人节', type: 'festival' },
  '03-08': { name: '妇女节', type: 'festival' },
  '03-12': { name: '植树节', type: 'festival' },
  '04-01': { name: '愚人节', type: 'festival' },
  '05-01': { name: '劳动节', type: 'national' },
  '05-04': { name: '青年节', type: 'festival' },
  '06-01': { name: '儿童节', type: 'national' },
  '07-01': { name: '建党节', type: 'festival' },
  '08-01': { name: '建军节', type: 'festival' },
  '09-10': { name: '教师节', type: 'festival' },
  '10-01': { name: '国庆节', type: 'national' },
  '12-25': { name: '圣诞节', type: 'festival' },
};

const LUNAR_HOLIDAYS = {
  '01-01': { name: '春节', type: 'lunar' },
  '01-15': { name: '元宵节', type: 'lunar' },
  '05-05': { name: '端午节', type: 'lunar' },
  '07-07': { name: '七夕节', type: 'lunar' },
  '08-15': { name: '中秋节', type: 'lunar' },
  '09-09': { name: '重阳节', type: 'lunar' },
  '12-08': { name: '腊八节', type: 'lunar' },
  '12-23': { name: '小年', type: 'lunar' },
  '12-30': { name: '除夕', type: 'lunar' },
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

const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

export default function CalendarPopup({ onClose }) {
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
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month');
  const [newEvent, setNewEvent] = useState({
    date: '',
    title: '',
    color: EVENT_COLORS[0],
    time: '09:00',
    repeat: 'none',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const todayInfo = getLunarInfo(today);
  const yearInfo = getLunarYearInfo(year);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevYear = () => setCurrentDate(new Date(year - 1, month, 1));
  const nextYear = () => setCurrentDate(new Date(year + 1, month, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const getLunarForDate = day => getLunarInfo(new Date(year, month, day));

  const getHolidayInfo = day => {
    const monthDay = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return HOLIDAYS[monthDay] || null;
  };

  const getLunarHoliday = lunarInfo => {
    if (!lunarInfo) return null;
    const lunarMonthDay = `${String(lunarInfo.month).padStart(2, '0')}-${String(lunarInfo.day).padStart(2, '0')}`;
    return LUNAR_HOLIDAYS[lunarMonthDay] || null;
  };

  const getEventsForDay = day => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const addEvent = () => {
    if (newEvent.date && newEvent.title) {
      setEvents([...events, { ...newEvent, id: Date.now() }]);
      setNewEvent({ date: '', title: '', color: EVENT_COLORS[0], time: '09:00', repeat: 'none' });
      setShowAdd(false);
    }
  };

  const removeEvent = id => setEvents(events.filter(e => e.id !== id));

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectedLunarInfo = selectedDate
    ? getLunarInfo(new Date(year, month, selectedDate))
    : getLunarInfo(today);

  const monthsGrid = useMemo(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthDays = new Date(year, i + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, i, 1).getDay();
      const monthDaysArray = [];
      for (let j = 0; j < firstDayOfMonth; j++) monthDaysArray.push(null);
      for (let j = 1; j <= monthDays; j++) monthDaysArray.push(j);
      months.push({ index: i, name: monthNames[i], days: monthDaysArray });
    }
    return months;
  }, [year]);

  return (
    <div className="calendar-popup-overlay" onClick={onClose}>
      <div className="calendar-popup" onClick={e => e.stopPropagation()}>
        <div className="calendar-popup-header">
          <h2>📅 日历</h2>
          <button className="btn-icon" onClick={onClose} aria-label="关闭">
            <Icon name="x" size={20} />
          </button>
        </div>

        {showAdd && (
          <div className="calendar-popup-add-form">
            <div className="add-form-row">
              <div className="form-group">
                <label>日期：</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>时间：</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>标题：</label>
              <input
                type="text"
                placeholder="事件名称"
                value={newEvent.title}
                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
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
                    onClick={() => setNewEvent({ ...newEvent, color })}
                  />
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={addEvent}>添加</button>
              <button className="btn-secondary" onClick={() => setShowAdd(false)}>取消</button>
            </div>
          </div>
        )}

        <div className="calendar-popup-content">
          <div className="calendar-popup-toolbar">
            <button className="btn-icon" onClick={() => setShowAdd(!showAdd)} title="添加事件">
              <Icon name="plus" size={18} />
            </button>
            <div className="view-toggle">
              <button
                className={`btn-sm ${viewMode === 'month' ? 'active' : ''}`}
                onClick={() => setViewMode('month')}
              >
                月
              </button>
              <button
                className={`btn-sm ${viewMode === 'year' ? 'active' : ''}`}
                onClick={() => setViewMode('year')}
              >
                年
              </button>
            </div>
            <button className="btn-sm" onClick={goToToday} title="今天">
              今天
            </button>
          </div>

          {viewMode === 'month' && (
            <>
              <div className="calendar-nav">
                <button className="btn-icon" onClick={prevYear} title="上一年">
                  <Icon name="chevronLeft" size={14} /><Icon name="chevronLeft" size={14} />
                </button>
                <button className="btn-icon" onClick={prevMonth} title="上月">
                  <Icon name="chevronLeft" size={16} />
                </button>
                <span className="calendar-title">{year}年 {monthNames[month]}</span>
                <button className="btn-icon" onClick={nextMonth} title="下月">
                  <Icon name="chevronRight" size={16} />
                </button>
                <button className="btn-icon" onClick={nextYear} title="下一年">
                  <Icon name="chevronRight" size={14} /><Icon name="chevronRight" size={14} />
                </button>
              </div>

              <div className="calendar-legend">
                <span className="legend-item"><span className="holiday-dot"></span>节日</span>
                <span className="legend-item"><span className="lunar-holiday-dot"></span>农历节</span>
                <span className="legend-item"><span className="event-dot"></span>事件</span>
                <span className="legend-item"><span className="jieqi-dot"></span>节气</span>
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
                  const isSelected = selectedDate === day;
                  const dayEvents = getEventsForDay(day);
                  const holiday = getHolidayInfo(day);
                  const lunar = getLunarForDate(day);
                  const lunarHoliday = getLunarHoliday(lunar);
                  const isWeekend = i % 7 === 0 || i % 7 === 6;

                  return (
                    <div
                      key={day}
                      className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayEvents.length ? 'has-event' : ''} ${isWeekend ? 'weekend' : ''}`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <span className="day-num">{day}</span>
                      {lunar && <span className="lunar-day">{lunar.dayName}</span>}
                      {holiday && (
                        <span className={`holiday-badge holiday-${holiday.type}`}>{holiday.name}</span>
                      )}
                      {lunarHoliday && (
                        <span className="holiday-badge holiday-lunar">{lunarHoliday.name}</span>
                      )}
                      {lunar?.currentJieQi && (
                        <span className="jieqi-badge-small">{lunar.currentJieQi}</span>
                      )}
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
                          {dayEvents.length > 2 && <span className="more-events">+{dayEvents.length - 2}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="selected-date-detail">
                  <div className="detail-header">
                    <span className="detail-date">{year}年{month + 1}月{selectedDate}日</span>
                    <button className="btn-icon" onClick={() => setSelectedDate(null)}>
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                  <div className="detail-lunar">
                    {selectedLunarInfo.isLeap && <span className="leap-badge">闰月</span>}
                    {selectedLunarInfo.fullLunar} · {yearInfo.shengXiao}年
                  </div>
                  <div className="detail-events">
                    {getEventsForDay(selectedDate).length > 0 ? (
                      <div className="event-list">
                        <span className="event-label">日程：</span>
                        {getEventsForDay(selectedDate).map((evt, i) => (
                          <div key={i} className="event-item" style={{ borderLeftColor: evt.color }}>
                            <span className="event-time">{evt.time}</span>
                            <span className="event-title">{evt.title}</span>
                            <button className="btn-icon btn-remove" onClick={() => removeEvent(evt.id)}>
                              <Icon name="trash" size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="no-event">当日无日程</span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {viewMode === 'year' && (
            <>
              <div className="calendar-nav">
                <button className="btn-icon" onClick={prevYear} title="上一年">
                  <Icon name="chevronLeft" size={16} />
                </button>
                <span className="calendar-title">{year}年</span>
                <button className="btn-icon" onClick={nextYear} title="下一年">
                  <Icon name="chevronRight" size={16} />
                </button>
              </div>

              <div className="year-grid">
                {monthsGrid.map(monthData => (
                  <div key={monthData.index} className="year-month">
                    <div className="month-name">{monthData.name}</div>
                    <div className="month-grid">
                      {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                        <div key={d} className="month-day-header">{d}</div>
                      ))}
                      {monthData.days.map((day, i) => (
                        <div
                          key={i}
                          className={`month-day ${day === null ? 'empty' : ''} ${day === today.getDate() && monthData.index === today.getMonth() && year === today.getFullYear() ? 'today' : ''}`}
                          onClick={() => {
                            if (day) {
                              setCurrentDate(new Date(year, monthData.index, day));
                              setViewMode('month');
                            }
                          }}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
