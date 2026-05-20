import { useState } from 'react';
import { getLunarInfo, getLunarYearInfo } from '../utils/lunarCalendar';
import { getHolidayInfo } from './CalendarPopup';
import CalendarPopup from './CalendarPopup';

const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default function Calendar() {
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
      <div className="widget calendar-widget" onClick={() => setShowPopup(true)}>
        <div className="today-display">
          <div className="today-header">
            <div className="today-date-block">
              <div className="today-date-primary">
                <span className="today-day">{day}</span>
                <span className="today-date-detail">
                  <span className="today-month">{monthNames[month]}</span>
                  <span className="today-weekday">{weekNames[weekday]}</span>
                </span>
              </div>
            </div>
            <div className="today-year-info">
              <span className="year-gan-zhi">{yearInfo.tianGan}{yearInfo.diZhi}年</span>
              <span className="year-sheng-xiao">({yearInfo.shengXiao})</span>
            </div>
          </div>

          <div className="today-lunar-section">
            <div className="lunar-date-row">
              <span className="lunar-main">
                {todayInfo.isLeap && <span className="leap-indicator">闰</span>}
                {todayInfo.monthName} {todayInfo.dayName}
              </span>
              {todayInfo.currentJieQi && (
                <span className="jieqi-tag">{todayInfo.currentJieQi}</span>
              )}
            </div>
            {holiday && (
              <div className="holiday-row">
                <span className={`holiday-tag ${holiday.type}`}>{holiday.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPopup && <CalendarPopup onClose={() => setShowPopup(false)} />}
    </>
  );
}
