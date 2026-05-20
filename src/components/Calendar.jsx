import { useState } from 'react';
import { getLunarInfo, getLunarYearInfo } from '../utils/lunarCalendar';
import CalendarPopup from './CalendarPopup';

const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

export default function Calendar() {
  const [showPopup, setShowPopup] = useState(false);
  const today = new Date();
  const year = today.getFullYear();
  const todayInfo = getLunarInfo(today);
  const yearInfo = getLunarYearInfo(year);

  return (
    <>
      <div className="widget calendar-widget" onClick={() => setShowPopup(true)}>
        <div className="widget-header">
          <h3>📅 日历</h3>
        </div>
        
        <div className="today-card">
          <div className="today-main">
            <div className="today-date">
              <span className="today-day">{today.getDate()}</span>
              <span className="today-month">{monthNames[today.getMonth()]}</span>
            </div>
            <div className="today-info">
              <div className="today-lunar">
                <span className="lunar-era">
                  {yearInfo.tianGan}
                  {yearInfo.diZhi}年
                </span>
                <span className="lunar-zodiac">{yearInfo.shengXiao}年</span>
              </div>
              <div className="today-date-full">
                {todayInfo.isLeap && <span className="leap-badge">闰月</span>}
                {todayInfo.fullLunar}
              </div>
              {todayInfo.currentJieQi && (
                <span className="jieqi-badge">{todayInfo.currentJieQi}</span>
              )}
            </div>
          </div>
          <div className="expand-hint">
            <span>点击查看完整日历</span>
            <span>→</span>
          </div>
        </div>
      </div>

      {showPopup && <CalendarPopup onClose={() => setShowPopup(false)} />}
    </>
  );
}
