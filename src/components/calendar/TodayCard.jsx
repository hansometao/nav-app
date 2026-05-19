import { Icon } from '../../utils/icons';
import { getLunarInfo, getLunarYearInfo } from '../../utils/lunarCalendar';

const MONTH_NAMES = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];

export default function TodayCard({ today, onToggle, isExpanded }) {
  const todayInfo = getLunarInfo(today);
  const yearInfo = getLunarYearInfo(today.getFullYear());

  return (
    <div className="today-card" onClick={onToggle}>
      <div className="today-main">
        <div className="today-date">
          <span className="today-day">{today.getDate()}</span>
          <span className="today-month">{MONTH_NAMES[today.getMonth()]}</span>
        </div>
        <div className="today-info">
          <div className="today-lunar">
            <span className="lunar-era">{yearInfo.tianGan}{yearInfo.diZhi}年</span>
            <span className="lunar-zodiac">{yearInfo.shengXiao}年</span>
          </div>
          <div className="today-date-full">
            {todayInfo.isLeap && <span className="leap-badge">闰月</span>}
            {todayInfo.fullLunar}
          </div>
          {todayInfo.currentJieQi && <span className="jieqi-badge">{todayInfo.currentJieQi}</span>}
        </div>
      </div>
      <div className="expand-hint">
        <Icon name={isExpanded ? "chevronUp" : "chevronDown"} size={18} />
        <span>{isExpanded ? "收起日历" : "查看日历"}</span>
      </div>
    </div>
  );
}
