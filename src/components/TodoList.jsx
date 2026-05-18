import { useState, useMemo } from 'react';

const STORAGE_KEY = 'nav_app_todos';

export default function TodoList() {
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load todos:', e);
      return [];
    }
  });
  
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');

  const save = (list) => {
    setTodos(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const addTodo = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    save([...todos, { id: Date.now(), text, done: false, createdAt: Date.now() }]);
    setInput('');
  };

  const toggle = (id) => {
    save(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const remove = (id) => {
    save(todos.filter(t => t.id !== id));
  };

  const clearDone = () => {
    save(todos.filter(t => !t.done));
  };

  const filtered = useMemo(() => todos.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  }), [todos, filter]);

  const doneCount = useMemo(() => todos.filter(t => t.done).length, [todos]);
  const totalCount = todos.length;

  return (
    <div className="widget todo-widget" role="region" aria-label="待办事项">
      <div className="widget-header">
        <h3>✅ 待办事项</h3>
        <span className="todo-count" aria-label={`已完成 ${doneCount} 项，共 ${totalCount} 项`}>
          {doneCount}/{totalCount}
        </span>
      </div>

      <form className="todo-form" onSubmit={addTodo} role="form" aria-label="添加待办">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="添加新的待办事项..."
          className="todo-input"
          aria-label="待办事项内容"
        />
        <button type="submit" className="btn-sm" aria-label="添加待办">添加</button>
      </form>

      <div className="todo-filters" role="tablist" aria-label="筛选">
        {[
          { key: 'all', label: '全部', icon: '📋' },
          { key: 'active', label: '未完成', icon: '🔄' },
          { key: 'done', label: '已完成', icon: '✅' },
        ].map(f => (
          <button
            key={f.key}
            className={`todo-filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
            role="tab"
            aria-selected={filter === f.key}
            aria-controls="todo-list"
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      <div className="todo-list" id="todo-list" role="tabpanel" aria-label="待办列表">
        {filtered.length === 0 ? (
          <div className="empty-state" role="status">
            <p>{filter === 'all' ? '还没有待办事项' : filter === 'active' ? '所有任务已完成 🎉' : '暂无已完成事项'}</p>
          </div>
        ) : (
          filtered.map(todo => (
            <div key={todo.id} className={`todo-item ${todo.done ? 'done' : ''}`} role="listitem">
              <label className="todo-check-label">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggle(todo.id)}
                  className="todo-checkbox"
                  aria-label={`${todo.done ? '标记为未完成' : '标记为已完成'}：${todo.text}`}
                />
                <span className="todo-checkmark" aria-hidden="true"></span>
              </label>
              <span 
                className="todo-text" 
                onClick={() => toggle(todo.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggle(todo.id)}
              >
                {todo.text}
              </span>
              <button 
                className="btn-icon btn-remove" 
                onClick={() => remove(todo.id)} 
                title="删除"
                aria-label={`删除待办：${todo.text}`}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {doneCount > 0 && (
        <div className="todo-footer">
          <button className="btn-text" onClick={clearDone} aria-label="清除所有已完成的待办事项">
            清除已完成
          </button>
        </div>
      )}
    </div>
  );
}
