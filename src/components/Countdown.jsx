import { useState, useEffect, useRef } from 'react';
import { STORAGE_KEYS } from '../config/storage';

const STORAGE_KEY = STORAGE_KEYS.COUNTDOWN;

const DEFAULTS = [
  { id: 1, label: '2026年结束', target: '2027-01-01T00:00:00', color: '#6c63ff' },
  { id: 2, label: '2026年春节', target: '2027-02-17T00:00:00', color: '#f87171' },
];

export default function Countdown() {
  const [countdowns, setCountdowns] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newCountdown, setNewCountdown] = useState({ label: '', target: '', color: '#6c63ff' });
  const [timeLeft, setTimeLeft] = useState({});
  const [timer, setTimer] = useState(null);
  const [customTimer, setCustomTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerLabel, setTimerLabel] = useState('');
  const timerRef = useRef(null);

  // Update countdowns every second
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const newTimeLeft = {};
      countdowns.forEach(cd => {
        const diff = new Date(cd.target) - now;
        if (diff > 0) {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          newTimeLeft[cd.id] = { d, h, m, s };
        } else {
          newTimeLeft[cd.id] = { d: 0, h: 0, m: 0, s: 0, expired: true };
        }
      });
      setTimeLeft(newTimeLeft);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [countdowns]);

  // 持久化倒计时列表
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(countdowns));
  }, [countdowns]);

  // 组件卸载时清理计时器定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const addCountdown = () => {
    if (newCountdown.label && newCountdown.target) {
      setCountdowns([...countdowns, { ...newCountdown, id: Date.now() }]);
      setNewCountdown({ label: '', target: '', color: '#6c63ff' });
      setShowAdd(false);
    }
  };

  const removeCountdown = (id) => {
    setCountdowns(countdowns.filter(cd => cd.id !== id));
  };

  const startTimer = () => {
    if (customTimer <= 0) return;
    setTimerRunning(true);
    setTimer(customTimer * 60);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimer(0);
  };

  const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="widget countdown-widget">
      <div className="widget-header">
        <h3>⏱ 倒计时</h3>
        <button className="btn-icon" onClick={() => setShowAdd(!showAdd)} title="添加倒计时">+</button>
      </div>

      {showAdd && (
        <div className="add-event-form">
          <input type="text" placeholder="名称" value={newCountdown.label} onChange={e => setNewCountdown({...newCountdown, label: e.target.value})} />
          <input type="datetime-local" value={newCountdown.target} onChange={e => setNewCountdown({...newCountdown, target: e.target.value})} />
          <div className="color-picker-row">
            <label>颜色：</label>
            <input type="color" value={newCountdown.color} onChange={e => setNewCountdown({...newCountdown, color: e.target.value})} />
          </div>
          <button className="btn-sm" onClick={addCountdown}>添加</button>
        </div>
      )}

      <div className="countdown-list">
        {countdowns.map(cd => {
          const tl = timeLeft[cd.id];
          if (!tl) return null;
          return (
            <div key={cd.id} className="countdown-item" style={{ borderLeftColor: cd.color }}>
              <div className="countdown-label">
                {cd.label}
                <button className="btn-icon btn-remove" onClick={() => removeCountdown(cd.id)}>×</button>
              </div>
              {tl.expired ? (
                <div className="countdown-expired">🎉 时间到！</div>
              ) : (
                <div className="countdown-time">
                  <span className="cd-num">{tl.d}<small>天</small></span>
                  <span className="cd-sep">:</span>
                  <span className="cd-num">{String(tl.h).padStart(2, '0')}<small>时</small></span>
                  <span className="cd-sep">:</span>
                  <span className="cd-num">{String(tl.m).padStart(2, '0')}<small>分</small></span>
                  <span className="cd-sep">:</span>
                  <span className="cd-num cd-sec">{String(tl.s).padStart(2, '0')}<small>秒</small></span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="timer-section">
        <h4>⏲ 计时器</h4>
        <div className="timer-controls">
          <input
            type="number"
            min="1"
            max="999"
            value={customTimer || ''}
            onChange={e => setCustomTimer(Number(e.target.value))}
            placeholder="分钟"
            disabled={timerRunning}
            className="timer-input"
          />
          {!timerRunning ? (
            <button className="btn-sm btn-success" onClick={startTimer}>开始</button>
          ) : (
            <button className="btn-sm btn-danger" onClick={stopTimer}>停止</button>
          )}
        </div>
        {timerRunning && (
          <div className="timer-display">{formatTimer(timer)}</div>
        )}
      </div>
    </div>
  );
}