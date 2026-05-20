import { memo } from 'react';
import { getLunarInfo } from '../utils/lunarCalendar';
import './LunarCalendar.css';

const LunarCalendar = memo(function LunarCalendar({ date }) {
  if (!date) return null;

  const info = getLunarInfo(date);

  return (
    <div className="lunar-calendar-strip">
      <div className="lunar-info">
        <span className="lunar-era">{info.eraStr}</span>
        <span className="lunar-zodiac">{info.zodiacStr}</span>
        <span className="lunar-divider">·</span>
        <span className="lunar-date">{info.fullLunar}</span>
        {info.currentJieQi && (
          <>
            <span className="lunar-divider">·</span>
            <span className="lunar-jieqi">{info.currentJieQi}</span>
          </>
        )}
      </div>
    </div>
  );
});

export default LunarCalendar;
