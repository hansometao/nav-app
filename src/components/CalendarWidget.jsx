import { useState } from 'react';
import { getLunarInfo, getLunarYearInfo } from '../utils/lunarCalendar';
import { getHolidayInfo } from './CalendarPopup';
import CalendarPopup from './CalendarPopup';

const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default function CalendarWidget() {
  const [showPopup, setShowPopup] = useState(false);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  const weekday = today.getDay();
  const todayInfo = getLunarInfo(today);
  const yearInfo = getLunarYearInfo(year);
  const holiday = getHolidayInfo(month, day);

  return (
    <>
      <div 
        className="calendar-widget-card" 
        onClick={() => setShowPopup(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setShowPopup(true);
          }
        }}
      >
        <div className="calendar-widget-header">
          <span className="calendar-widget-icon">📅</span>
          <span className="calendar-widget-title">日历</span>
        </div>
        
        <div className="calendar-widget-content">
          <div className="today-date-display">
            <div className="today-date-main">
              <span className="today-date-number">{day}</span>
              <div className="today-date-info">
                <span className="today-month-name">{monthNames[month]}</span>
                <span className="today-weekday-name">{weekNames[weekday]}</span>
              </div>
            </div>
          </div>

          <div className="today-details">
            <div className="detail-row">
              <span className="detail-label">农历</span>
              <span className="detail-value">
                {todayInfo.isLeap && <span className="leap-badge-small">闰</span>}
                {todayInfo.monthName} {todayInfo.dayName}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">年份</span>
              <span className="detail-value">
                {yearInfo.tianGan}{yearInfo.diZhi}年 ({yearInfo.shengXiao})
              </span>
            </div>

            {todayInfo.currentJieQi && (
              <div className="detail-row">
                <span className="detail-label">节气</span>
                <span className="detail-value jieqi-value">{todayInfo.currentJieQi}</span>
              </div>
            )}

            {holiday && (
              <div className="detail-row">
                <span className="detail-label">节日</span>
                <span className={`detail-value holiday-value ${holiday.type}`}>
                  {holiday.name}
                </span>
              </div>
            )}
          </div>

          <div className="calendar-widget-hint">
            点击查看完整日历 →
          </div>
        </div>
      </div>

      {showPopup && <CalendarPopup onClose={() => setShowPopup(false)} />}
    </>
  );
}
