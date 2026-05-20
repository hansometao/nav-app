import { useState, useMemo, useEffect } from 'react';
import { Icon } from '../utils/icons';

const STORAGE_KEY = 'nav_app_todos';

const CATEGORIES = [
  { id: 'all', label: '全部', color: '#6c63ff' },
  { id: 'work', label: '工作', color: '#f87171' },
  { id: 'life', label: '生活', color: '#34d399' },
  { id: 'study', label: '学习', color: '#60a5fa' },
  { id: 'other', label: '其他', color: '#a78bfa' },
];

const PRIORITIES = [
  { id: 'high', label: '高', color: '#ef4444', icon: 'alertCircle' },
  { id: 'medium', label: '中', color: '#f59e0b', icon: 'minus' },
  { id: 'low', label: '低', color: '#6b7280', icon: 'arrowDown' },
];

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
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const save = list => {
    setTodos(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const addTodo = e => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const newTodo = {
      id: Date.now(),
      text,
      done: false,
      createdAt: Date.now(),
      category: category,
      priority: priority,
      dueDate: dueDate || null,
    };

    save([...todos, newTodo]);
    setInput('');
    setDueDate('');
    setShowAddForm(false);
  };

  const toggle = id => {
    save(todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const remove = id => {
    save(todos.filter(t => t.id !== id));
  };

  const editTodo = (id, newText) => {
    save(todos.map(t => (t.id === id ? { ...t, text: newText } : t)));
  };

  const clearDone = () => {
    save(todos.filter(t => !t.done));
  };

  const selectAll = () => {
    const allDone = todos.every(t => t.done);
    save(todos.map(t => ({ ...t, done: !allDone })));
  };

  const filtered = useMemo(() => {
    let result = todos;

    // 分类筛选
    if (category !== 'all') {
      result = result.filter(t => t.category === category);
    }

    // 状态筛选
    if (filter === 'active') {
      result = result.filter(t => !t.done);
    } else if (filter === 'done') {
      result = result.filter(t => t.done);
    } else if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(t => t.dueDate === today);
    } else if (filter === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(t => !t.done && t.dueDate && t.dueDate < today);
    }

    // 排序
    result = [...result].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else {
        return b.createdAt - a.createdAt;
      }
    });

    return result;
  }, [todos, category, filter, sortBy]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: todos.length,
      done: todos.filter(t => t.done).length,
      active: todos.filter(t => !t.done).length,
      today: todos.filter(t => t.dueDate === today).length,
      overdue: todos.filter(t => !t.done && t.dueDate && t.dueDate < today).length,
    };
  }, [todos]);

  const getPriorityIcon = priorityId => {
    const p = PRIORITIES.find(p => p.id === priorityId);
    return p ? p.icon : 'minus';
  };

  const getPriorityColor = priorityId => {
    const p = PRIORITIES.find(p => p.id === priorityId);
    return p ? p.color : '#6b7280';
  };

  const formatDueDate = dateStr => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate.getTime() === today.getTime()) {
      return '今天';
    } else if (targetDate.getTime() === tomorrow.getTime()) {
      return '明天';
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  const isOverdue = dateStr => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  };

  return (
    <div className="widget todo-widget" role="region" aria-label="待办事项">
      <div className="widget-header">
        <h3>
          <Icon name="checkCircle" size={18} /> 待办事项
        </h3>
        <div className="todo-stats">
          <span className="stat-badge">{stats.active} 待办</span>
          {stats.overdue > 0 && (
            <span className="stat-badge stat-overdue">{stats.overdue} 过期</span>
          )}
        </div>
      </div>

      <div className="todo-categories">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`category-btn ${category === cat.id ? 'active' : ''}`}
            onClick={() => setCategory(cat.id)}
            style={{ '--cat-color': cat.color }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <form className="todo-form" onSubmit={addTodo}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="添加新任务... (回车添加)"
          className="todo-input"
        />
        <button
          type="button"
          className="btn-icon btn-expand"
          onClick={() => setShowAddForm(!showAddForm)}
          title="展开高级选项"
        >
          <Icon name={showAddForm ? 'chevronUp' : 'plus'} size={16} />
        </button>
      </form>

      {showAddForm && (
        <div className="todo-add-form">
          <div className="form-row">
            <label>优先级：</label>
            <div className="priority-selector">
              {PRIORITIES.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`priority-btn ${priority === p.id ? 'active' : ''}`}
                  onClick={() => setPriority(p.id)}
                  style={{ '--priority-color': p.color }}
                >
                  <Icon name={p.icon} size={14} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="form-row">
            <label>截止日期：</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="date-input"
            />
          </div>
          <button type="submit" className="btn-sm btn-full" onClick={addTodo}>
            <Icon name="check" size={14} /> 添加任务
          </button>
        </div>
      )}

      <div className="todo-controls">
        <div className="todo-filters" role="tablist">
          {[
            { key: 'all', label: '全部' },
            { key: 'active', label: '未完成' },
            { key: 'done', label: '已完成' },
            { key: 'today', label: '今日' },
            { key: 'overdue', label: '过期' },
          ].map(f => (
            <button
              key={f.key}
              className={`todo-filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="sort-select-wrapper">
          <Icon name="sort" size={14} />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
            <option value="created">按创建时间</option>
            <option value="priority">按优先级</option>
            <option value="dueDate">按截止日期</option>
          </select>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="todo-actions-bar">
          <button className="btn-text btn-sm" onClick={selectAll}>
            <Icon name="checkSquare" size={14} />
            {todos.every(t => t.done) ? '取消全选' : '全选'}
          </button>
          {stats.done > 0 && (
            <button className="btn-text btn-sm btn-danger" onClick={clearDone}>
              <Icon name="trash" size={14} /> 清除已完成
            </button>
          )}
        </div>
      )}

      <div className="todo-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Icon name="inbox" size={48} />
            <p>{stats.total === 0 ? '还没有任务，添加一个吧' : '没有符合条件任务'}</p>
          </div>
        ) : (
          filtered.map(todo => (
            <div
              key={todo.id}
              className={`todo-item ${todo.done ? 'done' : ''} ${isOverdue(todo.dueDate) ? 'overdue' : ''}`}
            >
              <label className="todo-check-label">
                <input type="checkbox" checked={todo.done} onChange={() => toggle(todo.id)} />
                <span className="todo-checkmark"></span>
              </label>

              <div className="todo-content">
                <span className="todo-text">{todo.text}</span>
                <div className="todo-meta">
                  <span className="priority-tag" style={{ color: getPriorityColor(todo.priority) }}>
                    <Icon name={getPriorityIcon(todo.priority)} size={12} />
                  </span>
                  {todo.dueDate && (
                    <span
                      className={`due-date ${isOverdue(todo.dueDate) && !todo.done ? 'overdue' : ''}`}
                    >
                      <Icon name="calendar" size={12} />
                      {formatDueDate(todo.dueDate)}
                    </span>
                  )}
                </div>
              </div>

              <button
                className="btn-icon btn-remove"
                onClick={() => remove(todo.id)}
                title="删除任务"
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
