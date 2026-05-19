import { useState } from 'react';

const EVENT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6'
];

export default function EventForm({ onAdd, onCancel }) {
  const [newEvent, setNewEvent] = useState({ 
    date: '', 
    title: '', 
    color: EVENT_COLORS[0],
    time: '09:00',
    repeat: 'none'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newEvent.date && newEvent.title) {
      onAdd({ ...newEvent, id: Date.now() });
      setNewEvent({ date: '', title: '', color: EVENT_COLORS[0], time: '09:00', repeat: 'none' });
    }
  };

  return (
    <div className="calendar-add-form" onClick={(e) => e.stopPropagation()}>
      <div className="form-group">
        <label>日期：</label>
        <input 
          type="date" 
          value={newEvent.date} 
          onChange={e => setNewEvent({...newEvent, date: e.target.value})} 
        />
      </div>
      <div className="form-group">
        <label>时间：</label>
        <input 
          type="time" 
          value={newEvent.time} 
          onChange={e => setNewEvent({...newEvent, time: e.target.value})} 
        />
      </div>
      <div className="form-group">
        <label>标题：</label>
        <input 
          type="text" 
          placeholder="事件名称" 
          value={newEvent.title} 
          onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
        />
      </div>
      <div className="form-group">
        <label>颜色：</label>
        <div className="color-picker">
          {EVENT_COLORS.map(color => (
            <button
              key={color}
              className={`color-btn ${newEvent.color === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setNewEvent({...newEvent, color})}
            />
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-sm" onClick={handleSubmit}>添加</button>
        <button className="btn-sm btn-cancel" onClick={onCancel}>取消</button>
      </div>
    </div>
  );
}
