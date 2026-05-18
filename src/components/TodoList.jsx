import { useState, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'nav_app_todos';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | done

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTodos(JSON.parse(saved));
    } catch {}
  }, []);

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
    <div className="widget todo-widget">
      <div className="widget-header">
        <h3>✅ 待办事项</h3>
        <span className="todo-count">{doneCount}/{totalCount}</span>
      </div>

      <form className="todo-form" onSubmit={addTodo}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="添加新的待办事项..."
          className="todo-input"
        />
        <button type="submit" className="btn-sm">添加</button>
      </form>

      <div className="todo-filters">
        {[
          { key: 'all', label: '全部', icon: '📋' },
          { key: 'active', label: '未完成', icon: '🔄' },
          { key: 'done', label: '已完成', icon: '✅' },
        ].map(f => (
          <button
            key={f.key}
            className={`todo-filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      <div className="todo-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>{filter === 'all' ? '还没有待办事项' : filter === 'active' ? '所有任务已完成 🎉' : '暂无已完成事项'}</p>
          </div>
        ) : (
          filtered.map(todo => (
            <div key={todo.id} className={`todo-item ${todo.done ? 'done' : ''}`}>
              <label className="todo-check-label">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggle(todo.id)}
                  className="todo-checkbox"
                />
                <span className="todo-checkmark"></span>
              </label>
              <span className="todo-text" onClick={() => toggle(todo.id)}>{todo.text}</span>
              <button className="btn-icon btn-remove" onClick={() => remove(todo.id)} title="删除">×</button>
            </div>
          ))
        )}
      </div>

      {doneCount > 0 && (
        <div className="todo-footer">
          <button className="btn-text" onClick={clearDone}>清除已完成</button>
        </div>
      )}
    </div>
  );
}