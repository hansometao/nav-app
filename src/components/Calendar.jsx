import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../config/storage';
import { Icon } from '../utils/icons';

const CALENDAR_KEY = STORAGE_KEYS.CALENDAR;

const DEFAULT_EVENTS = [
  { date: '2026-06-01', title: '儿童节' },
  { date: '2026-10-01', title: '国庆节' },
  { date: '2026-12-25', title: '圣诞节' },
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
  const [newEvent, setNewEvent] = useState({ date: '', title: '' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const monthNames = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  const dayNames = ['日','一','二','三','四','五','六'];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  // 持久化日历事件
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
    <div className="widget calendar-widget">
      <div className="widget-header">
        <h3><Icon name="calendar" size={18} /> 日历</h3>
        <button className="btn-icon" onClick={() => setShowAdd(!showAdd)} title="添加事件"><Icon name="plus" size={16} /></button>
      </div>

      {showAdd && (
        <div className="add-event-form">
          <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
          <input type="text" placeholder="事件名称" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
          <button className="btn-sm" onClick={addEvent}>添加</button>
        </div>
      )}

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
          <h4><Icon name="target" size={14} /> 事件</h4>
          {events.map((evt, i) => (
            <div key={i} className="event-item">
              <span className="event-date">{evt.date}</span>
              <span className="event-title">{evt.title}</span>
              <button className="btn-icon btn-remove" onClick={() => removeEvent(i)}><Icon name="x" size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}