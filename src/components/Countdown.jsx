import { useState, useEffect, useRef } from 'react';
import { STORAGE_KEYS } from '../config/storage';
import { Icon } from '../utils/icons';

const STORAGE_KEY = STORAGE_KEYS.COUNTDOWN;

const PRESET_QUICK = [
  { label: '下班', hour: 18, minute: 0 },
  { label: '午休', hour: 12, minute: 0 },
  { label: '晚饭', hour: 19, minute: 0 },
  { label: '睡觉', hour: 23, minute: 0 },
];

const DEFAULTS = [
  { id: 1, label: '2026年结束', type: 'once', target: '2027-01-01T00:00:00', color: '#6c63ff' },
  { id: 2, label: '2026年春节', type: 'once', target: '2027-02-17T00:00:00', color: '#f87171' },
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
  const [countdownType, setCountdownType] = useState('once');
  const [newCountdown, setNewCountdown] = useState({ 
    label: '', 
    date: '', 
    time: '12:00', 
    hour: 12, 
    minute: 0, 
    color: '#6c63ff' 
  });
  const [timeLeft, setTimeLeft] = useState({});
  const [timer, setTimer] = useState(null);
  const [customTimer, setCustomTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const newTimeLeft = {};
      countdowns.forEach(cd => {
        let targetDate;
        if (cd.type === 'daily') {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), cd.hour, cd.minute, 0);
          if (today <= now) {
            today.setDate(today.getDate() + 1);
          }
          targetDate = today;
        } else {
          targetDate = new Date(cd.target);
        }
        
        const diff = targetDate - now;
        if (diff > 0) {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          newTimeLeft[cd.id] = { d, h, m, s, totalHours: diff / (1000 * 60 * 60) };
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(countdowns));
  }, [countdowns]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const addCountdown = () => {
    if (!newCountdown.label) {
      alert('请输入名称');
      return;
    }
    
    if (countdownType === 'once') {
      if (!newCountdown.date) {
        alert('请选择日期');
        return;
      }
      const target = `${newCountdown.date}T${newCountdown.time || '00:00'}:00`;
      setCountdowns([...countdowns, { 
        ...newCountdown, 
        type: 'once', 
        target, 
        id: Date.now() 
      }]);
    } else {
      setCountdowns([...countdowns, { 
        ...newCountdown, 
        type: 'daily', 
        id: Date.now() 
      }]);
    }
    
    setNewCountdown({ label: '', date: '', time: '12:00', hour: 12, minute: 0, color: '#6c63ff' });
    setShowAdd(false);
  };

  const removeCountdown = (id) => {
    setCountdowns(countdowns.filter(cd => cd.id !== id));
  };

  const applyPreset = (preset) => {
    setNewCountdown(prev => ({
      ...prev,
      hour: preset.hour,
      minute: preset.minute,
      label: prev.label || preset.label
    }));
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

  const getCountdownClass = (totalHours) => {
    if (totalHours < 1) return 'cd-urgent';
    if (totalHours < 6) return 'cd-warning';
    return '';
  };

  const renderTimeDisplay = (tl, cd) => {
    const showDays = tl.d > 0;
    const urgentClass = getCountdownClass(tl.totalHours);
    
    if (showDays) {
      return (
        <div className="countdown-time">
          <span className="cd-num">{tl.d}<small>天</small></span>
          <span className="cd-sep">:</span>
          <span className="cd-num">{String(tl.h).padStart(2, '0')}<small>时</small></span>
          <span className="cd-sep">:</span>
          <span className="cd-num">{String(tl.m).padStart(2, '0')}<small>分</small></span>
          <span className="cd-sep">:</span>
          <span className="cd-num cd-sec">{String(tl.s).padStart(2, '0')}<small>秒</small></span>
        </div>
      );
    }
    
    return (
      <div className={`countdown-time ${urgentClass}`}>
        <span className="cd-num">{String(tl.h).padStart(2, '0')}<small>时</small></span>
        <span className="cd-sep">:</span>
        <span className="cd-num">{String(tl.m).padStart(2, '0')}<small>分</small></span>
        <span className="cd-sep">:</span>
        <span className="cd-num cd-sec">{String(tl.s).padStart(2, '0')}<small>秒</small></span>
      </div>
    );
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="widget countdown-widget">
      <div className="widget-header">
        <h3><Icon name="clock" size={18} /> 倒计时</h3>
        <button className="btn-icon" onClick={() => setShowAdd(!showAdd)} title="添加倒计时"><Icon name="plus" size={16} /></button>
      </div>

      {showAdd && (
        <div className="add-event-form countdown-add-form">
          <div className="countdown-type-tabs">
            <button 
              className={`type-tab ${countdownType === 'once' ? 'active' : ''}`}
              onClick={() => setCountdownType('once')}
            >
              一次性
            </button>
            <button 
              className={`type-tab ${countdownType === 'daily' ? 'active' : ''}`}
              onClick={() => setCountdownType('daily')}
            >
              每日循环
            </button>
          </div>
          
          <input 
            type="text" 
            placeholder="名称" 
            value={newCountdown.label} 
            onChange={e => setNewCountdown({...newCountdown, label: e.target.value})} 
          />
          
          {countdownType === 'once' ? (
            <>
              <input 
                type="date" 
                min={today}
                value={newCountdown.date} 
                onChange={e => setNewCountdown({...newCountdown, date: e.target.value})} 
              />
              <input 
                type="time" 
                value={newCountdown.time} 
                onChange={e => setNewCountdown({...newCountdown, time: e.target.value})} 
              />
            </>
          ) : (
            <>
              <div className="quick-presets">
                <span className="preset-label">快捷预设：</span>
                {PRESET_QUICK.map(preset => (
                  <button 
                    key={preset.label}
                    className="preset-btn"
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="time-inputs-row">
                <div className="time-input-group">
                  <label>时</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="23" 
                    value={newCountdown.hour} 
                    onChange={e => setNewCountdown({...newCountdown, hour: Number(e.target.value)})} 
                  />
                </div>
                <div className="time-input-group">
                  <label>分</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="59" 
                    value={newCountdown.minute} 
                    onChange={e => setNewCountdown({...newCountdown, minute: Number(e.target.value)})} 
                  />
                </div>
              </div>
              <div className="selected-time-preview">
                设定时间：{String(newCountdown.hour).padStart(2, '0')}:{String(newCountdown.minute).padStart(2, '0')}
              </div>
            </>
          )}
          
          <div className="color-picker-row">
            <label>颜色：</label>
            <input 
              type="color" 
              value={newCountdown.color} 
              onChange={e => setNewCountdown({...newCountdown, color: e.target.value})} 
            />
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
                {cd.type === 'daily' && <span className="daily-badge"><Icon name="refreshCw" size={12} /></span>}
                {cd.label}
                <button className="btn-icon btn-remove" onClick={() => removeCountdown(cd.id)}><Icon name="x" size={14} /></button>
              </div>
              {tl.expired ? (
                <div className="countdown-expired">时间到！</div>
              ) : (
                renderTimeDisplay(tl, cd)
              )}
            </div>
          );
        })}
      </div>

      <div className="timer-section">
        <h4><Icon name="clock" size={16} /> 计时器</h4>
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
