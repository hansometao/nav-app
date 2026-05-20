import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { validateBookmark, sanitizeHtml } from '../utils/security';
import { getFavicon } from '../utils/favicon';

const STORAGE_KEY = 'nav_app_bookmarks_v1';
const CATEGORIES_KEY = 'nav_app_categories_v1';
const STATS_KEY = 'nav_app_bookmark_stats_v1';
const QUICK_ACCESS_KEY = 'nav_app_quick_access_v1';

const DEFAULT_CATEGORIES = [
  { name: '常用网站', icon: '🌐' },
  { name: '工作学习', icon: '💼' },
  { name: 'AI 工具', icon: '🤖' },
  { name: '娱乐生活', icon: '🎮' },
  { name: '开发工具', icon: '🛠' },
];

const DEFAULT_BOOKMARKS = [
  {
    name: 'Google',
    url: 'https://www.google.com',
    favicon: 'https://www.google.com/s2/favicons?domain=google.com&sz=64',
    category: '常用网站',
  },
  {
    name: '百度',
    url: 'https://www.baidu.com',
    favicon: 'https://www.baidu.com/favicon.ico',
    category: '常用网站',
  },
  {
    name: 'Bilibili',
    url: 'https://www.bilibili.com',
    favicon: 'https://www.bilibili.com/favicon.ico',
    category: '常用网站',
  },
  {
    name: '知乎',
    url: 'https://www.zhihu.com',
    favicon: 'https://static.zhihu.com/heifetz/favicon.ico',
    category: '常用网站',
  },
  {
    name: '微博',
    url: 'https://weibo.com',
    favicon: 'https://weibo.com/favicon.ico',
    category: '常用网站',
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com',
    favicon: 'https://youtube.com/s/desktop/favicon.ico',
    category: '常用网站',
  },
  {
    name: 'GitHub',
    url: 'https://github.com',
    favicon: 'https://github.githubassets.com/favicons/favicon.svg',
    category: '工作学习',
  },
  {
    name: '掘金',
    url: 'https://juejin.cn',
    favicon: 'https://juejin.cn/favicon.ico',
    category: '工作学习',
  },
  {
    name: 'CSDN',
    url: 'https://www.csdn.net',
    favicon: 'https://www.csdn.net/favicon.ico',
    category: '工作学习',
  },
  {
    name: 'StackOverflow',
    url: 'https://stackoverflow.com',
    favicon: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico',
    category: '工作学习',
  },
  {
    name: 'Wikipedia',
    url: 'https://en.wikipedia.org',
    favicon: 'https://en.wikipedia.org/static/favicon.ico',
    category: '工作学习',
  },
  {
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    favicon: 'https://chat.openai.com/favicon.ico',
    category: 'AI 工具',
  },
  {
    name: 'Claude',
    url: 'https://claude.ai',
    favicon: 'https://claude.ai/favicon.ico',
    category: 'AI 工具',
  },
  {
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com',
    favicon: 'https://chat.deepseek.com/favicon.ico',
    category: 'AI 工具',
  },
  {
    name: 'Kimi',
    url: 'https://kimi.moonshot.cn',
    favicon: 'https://kimi.moonshot.cn/favicon.ico',
    category: 'AI 工具',
  },
  {
    name: '通义千问',
    url: 'https://tongyi.aliyun.com',
    favicon: 'https://tongyi.aliyun.com/favicon.ico',
    category: 'AI 工具',
  },
  {
    name: '文心一言',
    url: 'https://yiyan.baidu.com',
    favicon: 'https://yiyan.baidu.com/favicon.ico',
    category: 'AI 工具',
  },
  {
    name: 'Midjourney',
    url: 'https://www.midjourney.com',
    favicon: 'https://www.midjourney.com/favicon.ico',
    category: 'AI 工具',
  },
  {
    name: 'Perplexity',
    url: 'https://www.perplexity.ai',
    favicon: 'https://www.perplexity.ai/favicon.ico',
    category: 'AI 工具',
  },
  {
    name: 'Netflix',
    url: 'https://www.netflix.com',
    favicon: 'https://www.netflix.com/favicon.ico',
    category: '娱乐生活',
  },
  {
    name: 'Spotify',
    url: 'https://open.spotify.com',
    favicon: 'https://open.spotify.com/favicon.ico',
    category: '娱乐生活',
  },
  {
    name: 'Reddit',
    url: 'https://www.reddit.com',
    favicon: 'https://www.reddit.com/favicon.ico',
    category: '娱乐生活',
  },
  {
    name: '淘宝',
    url: 'https://www.taobao.com',
    favicon: 'https://www.taobao.com/favicon.ico',
    category: '娱乐生活',
  },
  {
    name: 'Vercel',
    url: 'https://vercel.com',
    favicon: 'https://vercel.com/favicon.ico',
    category: '开发工具',
  },
  {
    name: 'Netlify',
    url: 'https://www.netlify.com',
    favicon: 'https://www.netlify.com/favicon.ico',
    category: '开发工具',
  },
  {
    name: 'CodePen',
    url: 'https://codepen.io',
    favicon: 'https://cpwebassets.codepen.io/favicon.ico',
    category: '开发工具',
  },
  {
    name: 'Replit',
    url: 'https://replit.com',
    favicon: 'https://replit.com/favicon.ico',
    category: '开发工具',
  },
];

const ICON_OPTIONS = [
  '📁',
  '🌐',
  '💼',
  '🤖',
  '🎮',
  '🛠',
  '📚',
  '🎵',
  '🛒',
  '✈️',
  '🏠',
  '📷',
  '🔧',
  '🎓',
  '❤️',
  '🔖',
  '⭐',
  '💻',
  '📱',
  '📺',
  '🌙',
  '🌊',
  '📖',
  '🎨',
  '🎬',
];

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        const defaultData = DEFAULT_BOOKMARKS.map((bm, i) => ({
          ...bm,
          id: Date.now() + i,
          createdAt: Date.now(),
          order: i,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return defaultData;
      }
      return JSON.parse(saved);
    } catch (e) {
      const defaultData = DEFAULT_BOOKMARKS.map((bm, i) => ({
        ...bm,
        id: Date.now() + i,
        createdAt: Date.now(),
        order: i,
      }));
      return defaultData;
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const savedCats = localStorage.getItem(CATEGORIES_KEY);
      if (savedCats) {
        return JSON.parse(savedCats);
      }
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  });

  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [quickAccess, setQuickAccess] = useState(() => {
    try {
      const saved = localStorage.getItem(QUICK_ACCESS_KEY);
      if (saved) return JSON.parse(saved);
      const defaultIds = bookmarks.slice(0, 6).map(b => b.id);
      localStorage.setItem(QUICK_ACCESS_KEY, JSON.stringify(defaultIds));
      return defaultIds;
    } catch {
      return [];
    }
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', url: '', favicon: '', category: '常用网站' });
  const [previewFavicon, setPreviewFavicon] = useState(null);
  const [faviconLoading, setFaviconLoading] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📁');
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  const [selectedBookmarks, setSelectedBookmarks] = useState(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [rightClickMenu, setRightClickMenu] = useState(null);
  const [sortMode, setSortMode] = useState('name');
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('nav_app_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const draggedRef = useRef(null);
  const menuRef = useRef(null);

  const recordVisit = useCallback(bookmarkId => {
    setStats(prev => {
      const newStats = { ...prev };
      if (!newStats[bookmarkId]) {
        newStats[bookmarkId] = { visits: 0, lastVisit: 0 };
      }
      newStats[bookmarkId].visits += 1;
      newStats[bookmarkId].lastVisit = Date.now();
      localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
      return newStats;
    });
  }, []);

  const saveBookmarks = useCallback(newList => {
    setBookmarks(newList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  }, []);

  const saveCategories = useCallback(newCats => {
    setCategories(newCats);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCats));
  }, []);

  const saveQuickAccess = useCallback(newList => {
    setQuickAccess(newList);
    localStorage.setItem(QUICK_ACCESS_KEY, JSON.stringify(newList));
  }, []);

  const resetForm = () => {
    setForm({ name: '', url: '', favicon: '', category: categories[0]?.name || '常用网站' });
    setPreviewFavicon(null);
    setEditId(null);
    setShowAdd(false);
  };

  useEffect(() => {
    if (form.url && form.url.includes('.')) {
      setFaviconLoading(true);
      getFavicon(form.url).then(favicon => {
        setPreviewFavicon(favicon);
        setFaviconLoading(false);
      });
    } else {
      setPreviewFavicon(null);
    }
  }, [form.url]);

  const handleSubmit = e => {
    e.preventDefault();
    const validated = validateBookmark({
      name: form.name,
      url: form.url,
      category: form.category,
    });
    if (!validated) {
      alert('请输入有效的网址和名称');
      return;
    }

    const faviconToSave = previewFavicon || '';

    const entry = {
      ...validated,
      favicon: faviconToSave,
      name: sanitizeHtml(validated.name),
      category: sanitizeHtml(validated.category),
    };

    if (editId !== null) {
      saveBookmarks(bookmarks.map(b => (b.id === editId ? { ...b, ...entry } : b)));
    } else {
      saveBookmarks([
        ...bookmarks,
        { id: Date.now(), ...entry, createdAt: Date.now(), order: bookmarks.length },
      ]);
    }
    resetForm();
  };

  const startEdit = bm => {
    setForm({ name: bm.name, url: bm.url, favicon: bm.favicon || '', category: bm.category });
    setPreviewFavicon(bm.favicon || null);
    setEditId(bm.id);
    setShowAdd(true);
    setRightClickMenu(null);
  };

  const removeBookmark = id => {
    if (confirm('确认删除此书签？')) {
      saveBookmarks(bookmarks.filter(b => b.id !== id));
      setSelectedBookmarks(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      saveQuickAccess(quickAccess.filter(qid => qid !== id));
      setRightClickMenu(null);
    }
  };

  const toggleQuickAccess = id => {
    if (quickAccess.includes(id)) {
      saveQuickAccess(quickAccess.filter(qid => qid !== id));
    } else if (quickAccess.length < 8) {
      saveQuickAccess([...quickAccess, id]);
    }
    setRightClickMenu(null);
  };

  const addCategory = () => {
    if (newCategory.trim() && !categories.find(c => c.name === newCategory.trim())) {
      const newCat = { name: newCategory.trim(), icon: newCategoryIcon };
      saveCategories([...categories, newCat]);
      setNewCategory('');
      setNewCategoryIcon('📁');
      setForm({ ...form, category: newCat.name });
    }
  };

  const updateCategoryIcon = (catName, newIcon) => {
    const newCats = categories.map(c => (c.name === catName ? { ...c, icon: newIcon } : c));
    saveCategories(newCats);
  };

  const editCategory = (oldName, newName) => {
    if (!newName.trim() || oldName === newName) {
      setEditingCategory(null);
      return;
    }
    const newCats = categories.map(c => (c.name === oldName ? { ...c, name: newName } : c));
    saveCategories(newCats);
    const updatedBookmarks = bookmarks.map(b =>
      b.category === oldName ? { ...b, category: newName } : b
    );
    saveBookmarks(updatedBookmarks);
    setEditingCategory(null);
  };

  const deleteCategory = catName => {
    const hasBookmarks = bookmarks.some(b => b.category === catName);
    if (hasBookmarks) {
      alert('请先删除或移动该分类下的书签');
      return;
    }
    if (catName === '常用网站') {
      alert('默认分类不能删除');
      return;
    }
    if (confirm(`确认删除分类"${catName}"？`)) {
      saveCategories(categories.filter(c => c.name !== catName));
    }
  };

  const toggleCategoryCollapse = catName => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catName)) {
        next.delete(catName);
      } else {
        next.add(catName);
      }
      return next;
    });
  };

  const toggleBookmarkSelection = id => {
    setSelectedBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllInCategory = (catName, items) => {
    const allIds = items.map(item => item.id);
    setSelectedBookmarks(prev => {
      const next = new Set(prev);
      const allSelected = allIds.every(id => next.has(id));
      if (allSelected) {
        allIds.forEach(id => next.delete(id));
      } else {
        allIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const batchDelete = () => {
    if (selectedBookmarks.size === 0) return;
    if (confirm(`确认删除选中的 ${selectedBookmarks.size} 个书签？`)) {
      saveBookmarks(bookmarks.filter(b => !selectedBookmarks.has(b.id)));
      saveQuickAccess(quickAccess.filter(qid => !selectedBookmarks.has(qid)));
      setSelectedBookmarks(new Set());
      setBatchMode(false);
    }
  };

  const moveSelectedToCategory = targetCategory => {
    if (selectedBookmarks.size === 0) return;
    saveBookmarks(
      bookmarks.map(b => (selectedBookmarks.has(b.id) ? { ...b, category: targetCategory } : b))
    );
    setSelectedBookmarks(new Set());
    setShowMoveMenu(null);
  };

  const handleRightClick = (e, bookmark) => {
    e.preventDefault();
    setRightClickMenu({
      x: e.clientX,
      y: e.clientY,
      bookmark,
    });
  };

  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setRightClickMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDragStart = (e, bookmark) => {
    draggedRef.current = bookmark;
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = e => {
    e.target.style.opacity = '1';
    draggedRef.current = null;
    setDragOverId(null);
  };

  const handleDragOver = (e, bookmark) => {
    e.preventDefault();
    if (draggedRef.current && draggedRef.current.id !== bookmark.id) {
      setDragOverId(bookmark.id);
    }
  };

  const handleDrop = (e, targetBookmark) => {
    e.preventDefault();
    if (!draggedRef.current || draggedRef.current.id === targetBookmark.id) return;

    const draggedItem = draggedRef.current;
    const targetItem = targetBookmark;

    saveBookmarks(
      bookmarks.map(b => {
        if (b.id === draggedItem.id) {
          return { ...b, category: targetItem.category };
        }
        return b;
      })
    );

    setDragOverId(null);
    draggedRef.current = null;
  };

  const addToSearchHistory = query => {
    if (query.trim().length < 2) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(q => q !== query);
      const newHistory = [query, ...filtered].slice(0, 10);
      localStorage.setItem('nav_app_search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('nav_app_search_history');
  };

  const quickAccessBookmarks = useMemo(() => {
    return quickAccess.map(id => bookmarks.find(b => b.id === id)).filter(Boolean);
  }, [bookmarks, quickAccess]);

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks;
    const query = searchQuery.toLowerCase();
    return bookmarks.filter(
      bm =>
        bm.name.toLowerCase().includes(query) ||
        bm.url.toLowerCase().includes(query) ||
        bm.category.toLowerCase().includes(query)
    );
  }, [bookmarks, searchQuery]);

  const groupedBookmarks = useMemo(() => {
    const cats = {};
    filteredBookmarks.forEach(bm => {
      const cat = bm.category || '默认';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(bm);
    });

    Object.keys(cats).forEach(cat => {
      if (sortMode === 'visits') {
        cats[cat].sort((a, b) => (stats[b.id]?.visits || 0) - (stats[a.id]?.visits || 0));
      } else if (sortMode === 'name') {
        cats[cat].sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortMode === 'date') {
        cats[cat].sort((a, b) => b.createdAt - a.createdAt);
      }
    });

    return cats;
  }, [filteredBookmarks, stats, sortMode]);

  const sortedCategories = useMemo(() => {
    return categories.filter(cat => groupedBookmarks[cat.name]?.length > 0 || !searchQuery);
  }, [categories, groupedBookmarks, searchQuery]);

  return (
    <div className="widget bookmarks-widget">
      <div className="widget-header">
        <h3>🔖 自定义书签</h3>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="btn-icon"
            onClick={() =>
              setSortMode(sortMode === 'name' ? 'visits' : sortMode === 'visits' ? 'date' : 'name')
            }
            title="排序方式"
          >
            {sortMode === 'name' ? '📝' : sortMode === 'visits' ? '🔥' : '📅'}
          </button>
          <button
            className="btn-icon"
            onClick={() => setBatchMode(!batchMode)}
            title={batchMode ? '退出批量模式' : '批量选择'}
            style={{ background: batchMode ? 'var(--accent-soft)' : undefined }}
          >
            ☑️
          </button>
          <button
            className="btn-icon"
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            title="管理分类"
          >
            📁
          </button>
          <button
            className="btn-icon"
            onClick={() => {
              resetForm();
              setShowAdd(!showAdd);
            }}
            title="添加书签"
          >
            {showAdd ? '✕' : '+'}
          </button>
        </div>
      </div>

      {quickAccessBookmarks.length > 0 && (
        <div className="quick-access-bar">
          <span className="quick-access-label">⭐ 常用</span>
          <div className="quick-access-list">
            {quickAccessBookmarks.map(bm => (
              <a
                key={bm.id}
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="quick-access-item"
                onClick={() => recordVisit(bm.id)}
                title={bm.name}
              >
                {bm.favicon ? (
                  <img src={bm.favicon} alt="" className="quick-favicon" />
                ) : (
                  <span className="quick-icon">🌐</span>
                )}
                <span className="quick-name">{bm.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="bookmark-search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="搜索书签..."
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            if (e.target.value) {
              addToSearchHistory(e.target.value);
            }
          }}
          className="bookmark-search-input"
          aria-label="搜索书签"
        />
        {searchQuery && (
          <button
            className="search-clear-btn"
            onClick={() => setSearchQuery('')}
            aria-label="清除搜索"
          >
            ✕
          </button>
        )}
      </div>

      {searchHistory.length > 0 && searchQuery === '' && (
        <div className="search-history">
          <span className="history-label">搜索历史:</span>
          {searchHistory.slice(0, 5).map((q, i) => (
            <button key={i} className="history-item" onClick={() => setSearchQuery(q)}>
              {q}
            </button>
          ))}
          <button className="history-clear-btn" onClick={clearSearchHistory}>
            清除
          </button>
        </div>
      )}

      {batchMode && selectedBookmarks.size > 0 && (
        <div className="batch-action-bar">
          <span className="batch-count">已选择 {selectedBookmarks.size} 个</span>
          <div className="batch-actions">
            <div className="move-dropdown">
              <button
                className="batch-btn move-btn"
                onClick={() => setShowMoveMenu(showMoveMenu ? null : 'batch')}
              >
                移动到 📂
              </button>
              {showMoveMenu === 'batch' && (
                <div className="move-menu">
                  {categories.map(cat => (
                    <button
                      key={cat.name}
                      className="move-menu-item"
                      onClick={() => moveSelectedToCategory(cat.name)}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="batch-btn delete-btn" onClick={batchDelete}>
              删除 🗑
            </button>
          </div>
        </div>
      )}

      {showCategoryManager && (
        <div className="category-manager">
          <h4 className="category-manager-title">📋 管理分类</h4>

          <div className="category-add-form">
            <div className="category-add-row">
              <select
                value={newCategoryIcon}
                onChange={e => setNewCategoryIcon(e.target.value)}
                className="icon-select"
              >
                {ICON_OPTIONS.map(ic => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="新分类名称"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="category-name-input"
                onKeyDown={e => e.key === 'Enter' && addCategory()}
              />
              <button className="btn-sm" onClick={addCategory}>
                添加
              </button>
            </div>
          </div>

          <div className="category-list">
            {categories.map(cat => {
              const count = bookmarks.filter(b => b.category === cat.name).length;
              return (
                <div key={cat.name} className="category-manager-item">
                  <div className="category-manager-info">
                    <select
                      value={cat.icon}
                      onChange={e => updateCategoryIcon(cat.name, e.target.value)}
                      className="icon-select-small"
                    >
                      {ICON_OPTIONS.map(ic => (
                        <option key={ic} value={ic}>
                          {ic}
                        </option>
                      ))}
                    </select>
                    {editingCategory === cat.name ? (
                      <input
                        type="text"
                        defaultValue={cat.name}
                        autoFocus
                        className="category-edit-input-inline"
                        onKeyDown={e => {
                          if (e.key === 'Enter') editCategory(cat.name, e.target.value);
                          if (e.key === 'Escape') setEditingCategory(null);
                        }}
                        onBlur={e => editCategory(cat.name, e.target.value)}
                      />
                    ) : (
                      <span
                        className="category-manager-name"
                        onClick={() => setEditingCategory(cat.name)}
                      >
                        {cat.name} <span className="category-count">({count})</span>
                      </span>
                    )}
                  </div>
                  {cat.name !== '常用网站' && (
                    <button
                      className="btn-text delete-category-btn"
                      onClick={() => deleteCategory(cat.name)}
                    >
                      🗑
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAdd && (
        <form className="add-bookmark-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="名称"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="网址 (例：https://example.com)"
            value={form.url}
            onChange={e => setForm({ ...form, url: e.target.value })}
            required
          />

          {form.url && (
            <div className="favicon-preview-box">
              <span className="favicon-preview-label">图标预览:</span>
              {faviconLoading ? (
                <div className="favicon-preview-loading">加载中...</div>
              ) : previewFavicon ? (
                <img src={previewFavicon} alt="favicon" className="favicon-preview-img" />
              ) : (
                <div className="favicon-preview-placeholder">输入网址后自动获取</div>
              )}
            </div>
          )}

          <div className="bookmark-form-row">
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="cat-input"
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="bookmark-form-actions">
            <button type="submit" className="btn-sm">
              {editId !== null ? '保存' : '添加'}
            </button>
            <button type="button" className="btn-sm btn-cancel" onClick={resetForm}>
              取消
            </button>
          </div>
        </form>
      )}

      {bookmarks.length === 0 ? (
        <div className="empty-state">
          <p>还没有书签，点击 + 添加</p>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="empty-state">
          <p>没有找到匹配的书签</p>
        </div>
      ) : (
        <div className="bookmark-categories-scrollable">
          {sortedCategories.map(cat => {
            const catInfo = categories.find(c => c.name === cat.name) || {
              name: cat.name,
              icon: '📁',
            };
            const items = groupedBookmarks[cat.name] || [];
            if (items.length === 0 && searchQuery) return null;

            const isCollapsed = collapsedCategories.has(cat.name);
            const allSelected =
              items.length > 0 && items.every(item => selectedBookmarks.has(item.id));

            return (
              <div key={cat.name} className="bookmark-category">
                <div className="category-header">
                  {batchMode && (
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => selectAllInCategory(cat.name, items)}
                      className="category-checkbox"
                      aria-label={`选择${cat.name}分类下的所有书签`}
                    />
                  )}
                  <button
                    className="category-collapse-btn"
                    onClick={() => toggleCategoryCollapse(cat.name)}
                    aria-expanded={!isCollapsed}
                    aria-label={isCollapsed ? '展开' : '折叠'}
                  >
                    {isCollapsed ? '▶' : '▼'}
                  </button>
                  <h4 className="category-title">
                    <span className="cat-icon">{catInfo.icon}</span>
                    {catInfo.name} <span className="cat-count">({items.length})</span>
                  </h4>
                  {!batchMode && (
                    <div className="category-actions">
                      {cat.name !== '常用网站' && (
                        <>
                          <button
                            className="cat-action-btn"
                            onClick={() => setEditingCategory(cat.name)}
                            title="编辑分类"
                          >
                            ✏️
                          </button>
                          <button
                            className="cat-action-btn cat-delete"
                            onClick={() => deleteCategory(cat.name)}
                            title="删除分类"
                          >
                            🗑
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="bookmark-grid">
                    {items.map(bm => {
                      const isQuickAccess = quickAccess.includes(bm.id);
                      const visitCount = stats[bm.id]?.visits || 0;
                      return (
                        <div
                          key={bm.id}
                          className={`bookmark-item ${dragOverId === bm.id ? 'drag-over' : ''} ${isQuickAccess ? 'is-quick-access' : ''}`}
                          draggable={!batchMode}
                          onDragStart={e => handleDragStart(e, bm)}
                          onDragEnd={handleDragEnd}
                          onDragOver={e => handleDragOver(e, bm)}
                          onDrop={e => handleDrop(e, bm)}
                          onContextMenu={e => handleRightClick(e, bm)}
                        >
                          {batchMode && (
                            <input
                              type="checkbox"
                              checked={selectedBookmarks.has(bm.id)}
                              onChange={() => toggleBookmarkSelection(bm.id)}
                              className="bookmark-checkbox"
                              aria-label={`选择书签：${bm.name}`}
                            />
                          )}
                          <a
                            href={bm.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bookmark-link"
                            onClick={() => recordVisit(bm.id)}
                          >
                            {bm.favicon ? (
                              <img
                                src={bm.favicon}
                                alt=""
                                className="bm-favicon"
                                onError={e => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="bm-icon">{bm.icon || '🌐'}</span>
                            )}
                            <span className="bm-name">{bm.name}</span>
                            {visitCount > 0 && <span className="bm-visits">🔥 {visitCount}</span>}
                          </a>
                          {!batchMode && (
                            <div className="bookmark-actions">
                              {!isQuickAccess && quickAccess.length < 8 && (
                                <button
                                  className="bm-action-btn bm-pin-btn"
                                  onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleQuickAccess(bm.id);
                                  }}
                                  title="添加到常用"
                                >
                                  ⭐
                                </button>
                              )}
                              <button
                                className="bm-action-btn"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  startEdit(bm);
                                }}
                                title="编辑"
                              >
                                ✏️
                              </button>
                              <button
                                className="bm-action-btn"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeBookmark(bm.id);
                                }}
                                title="删除"
                              >
                                🗑
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {rightClickMenu && (
        <div
          ref={menuRef}
          className="right-click-menu"
          style={{
            position: 'fixed',
            left: rightClickMenu.x,
            top: rightClickMenu.y,
            zIndex: 1000,
          }}
        >
          <button
            className="menu-item"
            onClick={() => window.open(rightClickMenu.bookmark.url, '_blank')}
          >
            🔗 在新标签页打开
          </button>
          <button
            className="menu-item"
            onClick={() => toggleQuickAccess(rightClickMenu.bookmark.id)}
          >
            {quickAccess.includes(rightClickMenu.bookmark.id) ? '❌ 从常用移除' : '⭐ 添加到常用'}
          </button>
          <button className="menu-item" onClick={() => startEdit(rightClickMenu.bookmark)}>
            ✏️ 编辑
          </button>
          <div className="menu-divider" />
          <button
            className="menu-item menu-danger"
            onClick={() => removeBookmark(rightClickMenu.bookmark.id)}
          >
            🗑 删除
          </button>
        </div>
      )}
    </div>
  );
}
