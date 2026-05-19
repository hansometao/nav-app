import { useState, useRef } from 'react';
import { Icon } from '../utils/icons';

const STORAGE_KEY = 'nav_app_memos';
const COLORS = ['#ffd700', '#ff6b6b', '#69db7c', '#74c0fc', '#da77f2', '#ff922b', '#20c997', '#748ffc'];

export default function Memo() {
  const [memos, setMemos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load memos:', e);
      return [];
    }
  });
  
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const titleRef = useRef(null);

  const save = (list) => {
    setMemos(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setColor(COLORS[0]);
    setEditingId(null);
    setShowAdd(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const entry = {
      title: title.trim(),
      content: content.trim(),
      color,
      updatedAt: Date.now(),
    };

    if (editingId !== null) {
      save(memos.map(m => m.id === editingId ? { ...m, ...entry } : m));
    } else {
      save([{ id: Date.now(), ...entry, createdAt: Date.now() }, ...memos]);
    }
    resetForm();
  };

  const startEdit = (memo) => {
    setTitle(memo.title);
    setContent(memo.content);
    setColor(memo.color);
    setEditingId(memo.id);
    setShowAdd(true);
    setTimeout(() => titleRef.current?.focus(), 100);
  };

  const removeMemo = (id) => {
    if (confirm('确认删除此便签？')) {
      save(memos.filter(m => m.id !== id));
    }
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="widget memo-widget">
      <div className="widget-header">
        <h3><Icon name="fileText" size={18} /> 备忘录</h3>
        <span className="memo-count">{memos.length} 条</span>
        <button className="btn-icon" onClick={() => { resetForm(); setShowAdd(!showAdd); }} title="新建便签">
          {showAdd ? <Icon name="x" size={16} /> : <Icon name="plus" size={16} />}
        </button>
      </div>

      {showAdd && (
        <form className="memo-form" onSubmit={handleSubmit}>
          <input
            ref={titleRef}
            type="text"
            placeholder="标题（可选）"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="memo-title-input"
          />
          <textarea
            placeholder="写点什么..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="memo-content-input"
            rows={4}
          />
          <div className="memo-color-picker">
            <span>颜色：</span>
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                className={`color-dot ${color === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <div className="memo-form-actions">
            <button type="submit" className="btn-sm">
              {editingId !== null ? '保存修改' : '添加便签'}
            </button>
            <button type="button" className="btn-sm btn-cancel" onClick={resetForm}>取消</button>
          </div>
        </form>
      )}

      <div className="memo-list">
        {memos.length === 0 ? (
          <div className="empty-state">
            <p>还没有便签，点击 + 添加</p>
          </div>
        ) : (
          <div className="memo-grid">
            {memos.map(memo => (
              <div key={memo.id} className="memo-card" style={{ borderTopColor: memo.color }}>
                <div className="memo-card-header">
                  <span className="memo-card-color" style={{ background: memo.color }}></span>
                  <span className="memo-card-title">
                    {memo.title || '无标题'}
                  </span>
                  <span className="memo-card-time">{formatDate(memo.updatedAt)}</span>
                </div>
                {memo.content && (
                  <div className="memo-card-content">{memo.content}</div>
                )}
                <div className="memo-card-actions">
                  <button className="bm-action-btn" onClick={() => startEdit(memo)} title="编辑"><Icon name="edit" size={14} /></button>
                  <button className="bm-action-btn" onClick={() => removeMemo(memo.id)} title="删除"><Icon name="trash" size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}