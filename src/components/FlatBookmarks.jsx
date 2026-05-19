import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { validateBookmark, sanitizeHtml } from '../utils/security';
import { getFavicon } from '../utils/favicon';

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

  const saveCategories = useCallback((newCats) => {
    setCategories(newCats);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCats));
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
        // 更新本地存储
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
    if (!searchQuery.trim()) return bookmarks;
    const query = searchQuery.toLowerCase();
    return bookmarks.filter(bm => 
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
    return cats;
  }, [filteredBookmarks]);

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
                {items.map(bm => {
                  const visitCount = stats[bm.id]?.visits || 0;
                  return (
                    <a
                      key={bm.id}
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flat-bookmark-item"
                      onClick={() => recordVisit(bm.id)}
                      title={bm.name}
                    >
                      <div className="flat-bookmark-icon-wrapper">
                        {bm.favicon ? (
                          <img src={bm.favicon} alt="" className="flat-bookmark-favicon" />
                        ) : (
                          <span className="flat-bookmark-emoji">🌐</span>
                        )}
                      </div>
                      <div className="flat-bookmark-info">
                        <span className="flat-bookmark-name">{bm.name}</span>
                        <span className="flat-bookmark-url">{bm.url.replace(/^https?:\/\//, '').slice(0, 25)}</span>
                      </div>
                      {visitCount > 0 && (
                        <span className="flat-bookmark-visits">🔥 {visitCount}</span>
                      )}
                      <div className="flat-bookmark-actions">
                        <button 
                          className="flat-edit-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            startEdit(bm);
                          }}
                          title="编辑"
                        >✏️</button>
                        <button 
                          className="flat-delete-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeBookmark(bm.id);
                          }}
                          title="删除"
                        >🗑️</button>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
