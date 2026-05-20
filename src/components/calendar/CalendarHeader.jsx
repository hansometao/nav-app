import { Icon } from '../../utils/icons';

const MONTH_NAMES = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
];

export default function CalendarHeader({
  year,
  month,
  viewMode,
  onPrevMonth,
  onNextMonth,
  onPrevYear,
  onNextYear,
  onToggleView,
  onGoToToday,
}) {
  return (
    <div className="calendar-actions-bar">
      <div className="view-toggle">
        <button
          className={`btn-sm ${viewMode === 'month' ? 'active' : ''}`}
          onClick={() => onToggleView('month')}
        >
          月
        </button>
        <button
          className={`btn-sm ${viewMode === 'year' ? 'active' : ''}`}
          onClick={() => onToggleView('year')}
        >
          年
        </button>
      </div>

      {viewMode === 'month' ? (
        <div className="calendar-nav">
          <button onClick={onPrevYear} className="btn-icon" title="上一年">
            <Icon name="chevronLeft" size={14} />
            <Icon name="chevronLeft" size={14} />
          </button>
          <button onClick={onPrevMonth} className="btn-icon" title="上月">
            <Icon name="chevronLeft" size={16} />
          </button>
          <span className="calendar-title">
            {year}年 {MONTH_NAMES[month]}
          </span>
          <button onClick={onNextMonth} className="btn-icon" title="下月">
            <Icon name="chevronRight" size={16} />
          </button>
          <button onClick={onNextYear} className="btn-icon" title="下一年">
            <Icon name="chevronRight" size={14} />
            <Icon name="chevronRight" size={14} />
          </button>
        </div>
      ) : (
        <div className="calendar-nav">
          <button onClick={onPrevYear} className="btn-icon" title="上一年">
            <Icon name="chevronLeft" size={16} />
          </button>
          <span className="calendar-title">{year}年</span>
          <button onClick={onNextYear} className="btn-icon" title="下一年">
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
      )}

      <button className="btn-sm" onClick={onGoToToday} title="今天">
        今天
      </button>
    </div>
  );
}
