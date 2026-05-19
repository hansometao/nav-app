import { useState, useEffect } from 'react';

const EVENT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6'
];

const REPEAT_OPTIONS = [
  { value: 'none', label: '不重复' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'yearly', label: '每年' }
];

export default function EditableEventForm({ 
  event = null, 
  defaultDate = '',
  onSave, 
  onCancel,
  onDelete = null
}) {
  const isEditing = !!event;
  
  const [formData, setFormData] = useState({
    date: defaultDate,
    title: '',
    color: EVENT_COLORS[0],
    time: '09:00',
    repeat: 'none',
    description: ''
  });

  // 当编辑事件时，填充表单数据
  useEffect(() => {
    if (event) {
      setFormData({
        date: event.date || defaultDate,
        title: event.title || '',
        color: event.color || EVENT_COLORS[0],
        time: event.time || '09:00',
        repeat: event.repeat || 'none',
        description: event.description || ''
      });
    } else {
      setFormData({
        date: defaultDate,
        title: '',
        color: EVENT_COLORS[0],
        time: '09:00',
        repeat: 'none',
        description: ''
      });
    }
  }, [event, defaultDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.date && formData.title.trim()) {
      const eventData = {
        ...formData,
        id: event?.id || Date.now(),
        title: formData.title.trim()
      };
      onSave(eventData);
    }
  };

  const handleDelete = () => {
    if (event && onDelete && confirm('确定要删除这个事件吗？')) {
      onDelete(event.id);
    }
  };

  return (
    <div className="calendar-event-form" onClick={(e) => e.stopPropagation()}>
      <h4 className="form-title">{isEditing ? '编辑事件' : '添加事件'}</h4>
      
      <div className="form-group">
        <label>日期：</label>
        <input 
          type="date" 
          value={formData.date} 
          onChange={e => setFormData({...formData, date: e.target.value})}
          required
        />
      </div>
      
      <div className="form-group">
        <label>时间：</label>
        <input 
          type="time" 
          value={formData.time} 
          onChange={e => setFormData({...formData, time: e.target.value})}
        />
      </div>
      
      <div className="form-group">
        <label>标题：</label>
        <input 
          type="text" 
          placeholder="事件名称" 
          value={formData.title} 
          onChange={e => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>
      
      <div className="form-group">
        <label>备注：</label>
        <textarea 
          placeholder="添加备注（可选）" 
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})}
          rows={2}
        />
      </div>
      
      <div className="form-group">
        <label>重复：</label>
        <select 
          value={formData.repeat} 
          onChange={e => setFormData({...formData, repeat: e.target.value})}
        >
          {REPEAT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label>颜色：</label>
        <div className="color-picker">
          {EVENT_COLORS.map(color => (
            <button
              key={color}
              type="button"
              className={`color-btn ${formData.color === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({...formData, color})}
            />
          ))}
        </div>
      </div>
      
      <div className="form-actions">
        {isEditing && onDelete && (
          <button 
            type="button" 
            className="btn-sm btn-danger" 
            onClick={handleDelete}
          >
            删除
          </button>
        )}
        <div className="form-actions-right">
          <button type="button" className="btn-sm btn-cancel" onClick={onCancel}>
            取消
          </button>
          <button type="submit" className="btn-sm btn-primary" onClick={handleSubmit}>
            {isEditing ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </div>
  );
}
