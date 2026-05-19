import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { validateBookmark, sanitizeHtml } from '../utils/security';
import { getFavicon } from '../utils/favicon';
import { useDebounce } from '../hooks/useDebounce';

const STORAGE_KEY = 'nav_app_bookmarks_v1';
const CATEGORIES_KEY = 'nav_app_categories_v1';
const STATS_KEY = 'nav_app_bookmark_stats_v1';

const DEFAULT_CATEGORIES = [
  { name: '常用网站', icon: '🌐' },
  { name: '工作学习', icon: '💼' },
  { name: 'AI 工具', icon: '🤖' },
  { name: '娱乐生活', icon: '🎮' },
  { name: '开发工具', icon: '🛠' },
];

const DEFAULT_BOOKMARKS = [
  { name: 'Google', url: 'https://www.google.com', favicon: '', category: '常用网站' },
  { name: '百度', url: 'https://www.baidu.com', favicon: '', category: '常用网站' },
  { name: 'Bilibili', url: 'https://www.bilibili.com', favicon: '', category: '常用网站' },
  { name: '知乎', url: 'https://www.zhihu.com', favicon: '', category: '常用网站' },
  { name: '微博', url: 'https://weibo.com', favicon: '', category: '常用网站' },
  { name: 'YouTube', url: 'https://youtube.com', favicon: '', category: '常用网站' },
  { name: 'GitHub', url: 'https://github.com', favicon: '', category: '工作学习' },
  { name: '掘金', url: 'https://juejin.cn', favicon: '', category: '工作学习' },
  { name: 'CSDN', url: 'https://www.csdn.net', favicon: '', category: '工作学习' },
  { name: 'StackOverflow', url: 'https://stackoverflow.com', favicon: '', category: '工作学习' },
  { name: 'ChatGPT', url: 'https://chat.openai.com', favicon: '', category: 'AI 工具' },
  { name: 'Claude', url: 'https://claude.ai', favicon: '', category: 'AI 工具' },
  { name: 'DeepSeek', url: 'https://chat.deepseek.com', favicon: '', category: 'AI 工具' },
  { name: 'Kimi', url: 'https://kimi.moonshot.cn', favicon: '', category: 'AI 工具' },
  { name: 'Netflix', url: 'https://www.netflix.com', favicon: '', category: '娱乐生活' },
  { name: 'Spotify', url: 'https://open.spotify.com', favicon: '', category: '娱乐生活' },
  { name: '淘宝', url: 'https://www.taobao.com', favicon: '', category: '娱乐生活' },
  { name: 'Vercel', url: 'https://vercel.com', favicon: '', category: '开发工具' },
  { name: 'Netlify', url: 'https://www.netlify.com', favicon: '', category: '开发工具' },
  { name: 'CodePen', url: 'https://codepen.io', favicon: '', category: '开发工具' },
];

const ICON_OPTIONS = ['📁', '🌐', '💼', '🤖', '🎮', '🛠', '📚', '🎵', '🛒', '✈️', '🏠', '📷', '🔧', '🎓', '❤️', '🔖', '⭐', '💻', '📱', '📺'];

// 单个书签项组件
function BookmarkItem({ bm, stats, onEdit, onDelete, onVisit, updateFavicon }) {
  const [faviconUrl, setFaviconUrl] = useState(bm.favicon);
  const [isHovered, setIsHovered] = useState(false);
  const visitCount = stats[bm.id]?.visits || 0;

  useEffect(() => {
    if (!bm.favicon) {
      getFavicon(bm.url).then(favicon => {
        setFaviconUrl(favicon);
        updateFavicon(bm.id, favicon);
      });
    }
  }, [bm.url, bm.id, bm.favicon, updateFavicon]);

  return (
    <a
      key={bm.id}
      href={bm.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flat-bookmark-item"
      onClick={() => onVisit(bm.id)}
      title={bm.name}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flat-bookmark-icon-wrapper">
        {faviconUrl ? (
          <img 
            src={faviconUrl} 
            alt="" 
            className="flat-bookmark-favicon"
            onError={(e) => {
              getFavicon(bm.url).then(newFavicon => {
                setFaviconUrl(newFavicon);
                updateFavicon(bm.id, newFavicon);
              });
            }}
          />
        ) : (
          <span className="flat-bookmark-placeholder-icon">🔗</span>
        )}
      </div>
      <div className="flat-bookmark-info">
        <span className="flat-bookmark-name">{bm.name}</span>
      </div>
      {visitCount > 0 && (
        <span className="flat-bookmark-visits">🔥 {visitCount}</span>
      )}
      <div className={`flat-bookmark-actions ${isHovered ? 'visible' : ''}`}>
        <button 
          className="flat-edit-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(bm);
          }}
          title="编辑"
          aria-label="编辑书签"
        >✏️</button>
        <button 
          className="flat-delete-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(bm.id);
          }}
          title="删除"
          aria-label="删除书签"
        >🗑️</button>
      </div>
    </a>
  );
}

// 空状态组件
function EmptyState({ onAdd }) {
  return (
    <div className="flat-empty-state">
      <div className="empty-icon">📭</div>
      <h3>暂无书签</h3>
      <p>点击下方按钮添加你的第一个网址书签</p>
      <button className="flat-add-btn" onClick={onAdd}>＋ 添加网址</button>
    </div>
  );
}

// 分类管理组件
function CategoryManager({ categories, onAdd, onDelete, onEdit }) {
  const [showForm, setShowForm] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', icon: '📁' });
  const [editingCat, setEditingCat] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    
    if (editingCat) {
      onEdit(editingCat, newCat);
    } else {
      onAdd(newCat);
    }
    setShowForm(false);
    setNewCat({ name: '', icon: '📁' });
    setEditingCat(null);
  };

  const startEdit = (cat) => {
    setNewCat(cat);
    setEditingCat(cat.name);
    setShowForm(true);
  };

  return (
    <div className="flat-category-manager">
      <button className="flat-manage-cats-btn" onClick={() => setShowForm(!showForm)}>
        📁 {showForm ? '收起' : '管理分类'}
      </button>
      
      {showForm && (
        <div className="flat-category-form">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="分类名称"
              value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              required
            />
            <div className="flat-icon-picker">
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  className={`icon-option ${newCat.icon === icon ? 'active' : ''}`}
                  onClick={() => setNewCat({ ...newCat, icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
            <div className="flat-form-buttons">
              <button type="submit" className="flat-save-btn">
                {editingCat ? '保存' : '添加'}
              </button>
              <button type="button" className="flat-cancel-btn" onClick={() => {
                setShowForm(false);
                setEditingCat(null);
                setNewCat({ name: '', icon: '📁' });
              }}>取消</button>
            </div>
          </form>
        </div>
      )}

      {categories.length > 0 && (
        <div className="flat-category-list">
          {categories.map(cat => (
            <div key={cat.name} className="flat-category-item">
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-name">{cat.name}</span>
              <div className="cat-actions">
                <button className="cat-edit" onClick={() => startEdit(cat)} title="编辑">✏️</button>
                <button 
                  className="cat-delete" 
                  onClick={() => onDelete(cat.name)} 
                  title="删除"
                  disabled={categories.length <= 1}
                >🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FlatBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        const defaultData = DEFAULT_BOOKMARKS.map((bm, i) => ({ 
          ...bm, 
          id: Date.now() + i,
          createdAt: Date.now()
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return defaultData;
      }
      return JSON.parse(saved);
    } catch (e) {
      return DEFAULT_BOOKMARKS.map((bm, i) => ({ 
        ...bm, 
        id: Date.now() + i,
        createdAt: Date.now()
      }));
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

  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', url: '', favicon: '', category: '常用网站' });
  const [previewFavicon, setPreviewFavicon] = useState(null);
  const [faviconLoading, setFaviconLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); // default, visits, name
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const recordVisit = useCallback((bookmarkId) => {
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

  const saveBookmarks = useCallback((newList) => {
    setBookmarks(newList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  }, []);

  const updateFavicon = useCallback((bookmarkId, favicon) => {
    setBookmarks(prev => prev.map(b => b.id === bookmarkId ? { ...b, favicon } : b));
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const bookmarks = JSON.parse(saved);
        const updated = bookmarks.map(b => b.id === bookmarkId ? { ...b, favicon } : b);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to update favicon:', e);
    }
  }, []);

  const saveCategories = useCallback((newCats) => {
    setCategories(newCats);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCats));
  }, []);

  const addCategory = useCallback((cat) => {
    const newCat = { name: sanitizeHtml(cat.name), icon: cat.icon };
    if (!categories.find(c => c.name === newCat.name)) {
      saveCategories([...categories, newCat]);
    }
  }, [categories, saveCategories]);

  const deleteCategory = useCallback((catName) => {
    if (categories.length <= 1) return;
    saveCategories(categories.filter(c => c.name !== catName));
    // 将该分类下的书签移到第一个分类
    const newDefaultCat = categories[0].name === catName ? categories[1].name : categories[0].name;
    saveBookmarks(bookmarks.map(b => 
      b.category === catName ? { ...b, category: newDefaultCat } : b
    ));
  }, [categories, bookmarks, saveCategories, saveBookmarks]);

  const editCategory = useCallback((oldName, newCat) => {
    const updatedCats = categories.map(c => 
      c.name === oldName ? { name: sanitizeHtml(newCat.name), icon: newCat.icon } : c
    );
    saveCategories(updatedCats);
    // 更新书签中的分类名称
    saveBookmarks(bookmarks.map(b => 
      b.category === oldName ? { ...b, category: sanitizeHtml(newCat.name) } : b
    ));
  }, [categories, bookmarks, saveCategories, saveBookmarks]);

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

  const handleSubmit = (e) => {
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
      saveBookmarks(bookmarks.map(b => b.id === editId ? { ...b, ...entry } : b));
    } else {
      saveBookmarks([...bookmarks, { id: Date.now(), ...entry, createdAt: Date.now() }]);
    }
    resetForm();
  };

  const startEdit = (bm) => {
    setForm({ name: bm.name, url: bm.url, favicon: bm.favicon || '', category: bm.category });
    setPreviewFavicon(bm.favicon || null);
    setEditId(bm.id);
    setShowAdd(true);
  };

  const removeBookmark = (id) => {
    if (confirm('确认删除此书签？')) {
      saveBookmarks(bookmarks.filter(b => b.id !== id));
    }
  };

  const [favicons, setFavicons] = useState({});

  useEffect(() => {
    const loadFavicons = async () => {
      const newFavicons = {};
      for (const bm of bookmarks) {
        if (!bm.favicon) {
          try {
            const favicon = await getFavicon(bm.url);
            newFavicons[bm.id] = favicon;
          } catch (e) {
            // 忽略错误
          }
        }
      }
      if (Object.keys(newFavicons).length > 0) {
        setFavicons(newFavicons);
        const updatedBookmarks = bookmarks.map(bm => {
          if (newFavicons[bm.id] && !bm.favicon) {
            return { ...bm, favicon: newFavicons[bm.id] };
          }
          return bm;
        });
        saveBookmarks(updatedBookmarks);
      }
    };
    loadFavicons();
  }, []);

  const filteredBookmarks = useMemo(() => {
    let result = bookmarks;
    
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(bm => 
        bm.name.toLowerCase().includes(query) || 
        bm.url.toLowerCase().includes(query) ||
        bm.category.toLowerCase().includes(query)
      );
    }

    // 排序
    if (sortBy === 'visits') {
      result = [...result].sort((a, b) => (stats[b.id]?.visits || 0) - (stats[a.id]?.visits || 0));
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    }

    return result;
  }, [bookmarks, searchQuery, sortBy, stats]);

  const groupedBookmarks = useMemo(() => {
    const cats = {};
    filteredBookmarks.forEach(bm => {
      const cat = bm.category || '默认';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(bm);
    });
    return cats;
  }, [filteredBookmarks]);

  // 获取热门书签（访问次数最多的5个）
  const hotBookmarks = useMemo(() => {
    return [...bookmarks]
      .sort((a, b) => (stats[b.id]?.visits || 0) - (stats[a.id]?.visits || 0))
      .slice(0, 5);
  }, [bookmarks, stats]);

  return (
    <div className="flat-bookmarks">
      <div className="flat-bookmarks-header">
        <h2 className="flat-bookmarks-title">🔖 网址导航</h2>
        <div className="flat-bookmarks-actions">
          <div className="flat-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="搜索网址..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flat-search-input"
            />
          </div>
          <select className="flat-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">默认排序</option>
            <option value="visits">热门优先</option>
            <option value="name">名称排序</option>
          </select>
          <button className="flat-add-btn" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? '✕ 取消' : '＋ 添加网址'}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="flat-add-panel">
          <form onSubmit={handleSubmit} className="flat-add-form">
            <input
              type="text"
              placeholder="网站名称"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="网址 (https://...)"
              value={form.url}
              onChange={e => setForm({...form, url: e.target.value})}
              required
            />
            <select
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>
            {form.url && (
              <div className="flat-favicon-preview">
                {faviconLoading ? <span>加载中...</span> : 
                 previewFavicon ? <img src={previewFavicon} alt="" /> : 
                 <span>自动获取图标</span>}
              </div>
            )}
            <div className="flat-form-buttons">
              <button type="submit" className="flat-save-btn">
                {editId !== null ? '保存' : '添加'}
              </button>
              <button type="button" className="flat-cancel-btn" onClick={resetForm}>取消</button>
            </div>
          </form>
        </div>
      )}

      {/* 热门书签快捷入口 */}
      {hotBookmarks.length > 0 && !searchQuery && (
        <div className="flat-hot-section">
          <h3 className="flat-hot-title">🔥 热门访问</h3>
          <div className="flat-hot-list">
            {hotBookmarks.map((bm, index) => (
              <BookmarkItem
                key={bm.id}
                bm={bm}
                stats={stats}
                onEdit={startEdit}
                onDelete={removeBookmark}
                onVisit={recordVisit}
                updateFavicon={updateFavicon}
              />
            ))}
          </div>
        </div>
      )}

      {filteredBookmarks.length === 0 ? (
        <EmptyState onAdd={() => setShowAdd(true)} />
      ) : (
        <>
          <div className="flat-bookmarks-grid">
            {categories.map(cat => {
              const items = groupedBookmarks[cat.name] || [];
              if (items.length === 0) return null;
              
              return (
                <div key={cat.name} className="flat-category-section">
                  <h3 className="flat-category-title">
                    <span className="flat-category-icon">{cat.icon}</span>
                    {cat.name}
                    <span className="flat-category-count">({items.length})</span>
                  </h3>
                  <div className="flat-category-items">
                    {items.map(bm => (
                      <BookmarkItem
                        key={bm.id}
                        bm={bm}
                        stats={stats}
                        onEdit={startEdit}
                        onDelete={removeBookmark}
                        onVisit={recordVisit}
                        updateFavicon={updateFavicon}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <CategoryManager
        categories={categories}
        onAdd={addCategory}
        onDelete={deleteCategory}
        onEdit={editCategory}
      />
    </div>
  );
}
