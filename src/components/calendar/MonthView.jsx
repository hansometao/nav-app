import { getLunarInfo } from '../../utils/lunarCalendar';

const DAY_NAMES = ['日','一','二','三','四','五','六'];
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
  '12-25': { name: '圣诞节', type: 'festival' }
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
  '12-30': { name: '除夕', type: 'lunar' }
};

export default function MonthView({ 
  year, 
  month, 
  today, 
  selectedDate,
  events,
  onSelectDate 
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getHolidayInfo = (day) => {
    const monthDay = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return HOLIDAYS[monthDay] || null;
  };

  const getLunarHoliday = (lunarInfo) => {
    if (!lunarInfo) return null;
    const lunarMonthDay = `${String(lunarInfo.month).padStart(2, '0')}-${String(lunarInfo.day).padStart(2, '0')}`;
    return LUNAR_HOLIDAYS[lunarMonthDay] || null;
  };

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const getWeekNumber = (day) => {
    const date = new Date(year, month, day);
    const startOfYear = new Date(year, 0, 1);
    const daysDiff = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor((daysDiff + startOfYear.getDay() + 1) / 7);
  };

  return (
    <>
      <div className="calendar-legend">
        <span className="legend-item">
          <span className="holiday-dot"></span>节日
        </span>
        <span className="legend-item">
          <span className="lunar-holiday-dot"></span>农历节
        </span>
        <span className="legend-item">
          <span className="event-dot"></span>事件
        </span>
        <span className="legend-item">
          <span className="jieqi-dot"></span>节气
        </span>
      </div>

      <div className="calendar-grid">
        <div className="week-header">周</div>
        {DAY_NAMES.map(d => (
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
          const lunar = getLunarInfo(new Date(year, month, day));
          const lunarHoliday = getLunarHoliday(lunar);
          const weekNum = getWeekNumber(day);
          const isWeekend = (firstDay + i) % 7 === 0 || (firstDay + i) % 7 === 6;
          
          return (
            <div 
              key={day} 
              className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayEvents.length ? 'has-event' : ''} ${isWeekend ? 'weekend' : ''}`}
              onClick={() => onSelectDate(day)}
            >
              {i % 7 === 0 && <span className="week-number">{weekNum}</span>}
              <span className="day-num">{day}</span>
              {lunar && <span className="lunar-day">{lunar.dayName}</span>}
              {holiday && <span className={`holiday-badge holiday-${holiday.type}`}>{holiday.name}</span>}
              {lunarHoliday && <span className="holiday-badge holiday-lunar">{lunarHoliday.name}</span>}
              {lunar?.currentJieQi && <span className="jieqi-badge-small">{lunar.currentJieQi}</span>}
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
    </>
  );
}
