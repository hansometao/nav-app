import { useState, useMemo, useCallback, useEffect } from 'react';
import { validateBookmark, sanitizeHtml } from '../utils/security';
import { getFavicon } from '../utils/favicon';

const STORAGE_KEY = 'nav_app_bookmarks_v1';
const CATEGORIES_KEY = 'nav_app_categories_v1';

const DEFAULT_CATEGORIES = [
  { name: '常用网站', icon: '🌐' },
  { name: '工作学习', icon: '💼' },
  { name: 'AI 工具', icon: '🤖' },
  { name: '娱乐生活', icon: '🎮' },
  { name: '开发工具', icon: '🛠' },
];

const DEFAULT_BOOKMARKS = [
  { name: 'Google', url: 'https://www.google.com', favicon: 'https://www.google.com/s2/favicons?domain=google.com&sz=64', category: '常用网站' },
  { name: '百度', url: 'https://www.baidu.com', favicon: 'https://www.baidu.com/favicon.ico', category: '常用网站' },
  { name: 'Bilibili', url: 'https://www.bilibili.com', favicon: 'https://www.bilibili.com/favicon.ico', category: '常用网站' },
  { name: '知乎', url: 'https://www.zhihu.com', favicon: 'https://static.zhihu.com/heifetz/favicon.ico', category: '常用网站' },
  { name: '微博', url: 'https://weibo.com', favicon: 'https://weibo.com/favicon.ico', category: '常用网站' },
  { name: 'YouTube', url: 'https://youtube.com', favicon: 'https://youtube.com/s/desktop/favicon.ico', category: '常用网站' },
  { name: 'GitHub', url: 'https://github.com', favicon: 'https://github.githubassets.com/favicons/favicon.svg', category: '工作学习' },
  { name: '掘金', url: 'https://juejin.cn', favicon: 'https://juejin.cn/favicon.ico', category: '工作学习' },
  { name: 'CSDN', url: 'https://www.csdn.net', favicon: 'https://www.csdn.net/favicon.ico', category: '工作学习' },
  { name: 'StackOverflow', url: 'https://stackoverflow.com', favicon: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico', category: '工作学习' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org', favicon: 'https://en.wikipedia.org/static/favicon.ico', category: '工作学习' },
  { name: 'ChatGPT', url: 'https://chat.openai.com', favicon: 'https://chat.openai.com/favicon.ico', category: 'AI 工具' },
  { name: 'Claude', url: 'https://claude.ai', favicon: 'https://claude.ai/favicon.ico', category: 'AI 工具' },
  { name: 'DeepSeek', url: 'https://chat.deepseek.com', favicon: 'https://chat.deepseek.com/favicon.ico', category: 'AI 工具' },
  { name: 'Kimi', url: 'https://kimi.moonshot.cn', favicon: 'https://kimi.moonshot.cn/favicon.ico', category: 'AI 工具' },
  { name: '通义千问', url: 'https://tongyi.aliyun.com', favicon: 'https://tongyi.aliyun.com/favicon.ico', category: 'AI 工具' },
  { name: '文心一言', url: 'https://yiyan.baidu.com', favicon: 'https://yiyan.baidu.com/favicon.ico', category: 'AI 工具' },
  { name: 'Midjourney', url: 'https://www.midjourney.com', favicon: 'https://www.midjourney.com/favicon.ico', category: 'AI 工具' },
  { name: 'Perplexity', url: 'https://www.perplexity.ai', favicon: 'https://www.perplexity.ai/favicon.ico', category: 'AI 工具' },
  { name: 'Netflix', url: 'https://www.netflix.com', favicon: 'https://www.netflix.com/favicon.ico', category: '娱乐生活' },
  { name: 'Spotify', url: 'https://open.spotify.com', favicon: 'https://open.spotify.com/favicon.ico', category: '娱乐生活' },
  { name: 'Reddit', url: 'https://www.reddit.com', favicon: 'https://www.reddit.com/favicon.ico', category: '娱乐生活' },
  { name: '淘宝', url: 'https://www.taobao.com', favicon: 'https://www.taobao.com/favicon.ico', category: '娱乐生活' },
  { name: 'Vercel', url: 'https://vercel.com', favicon: 'https://vercel.com/favicon.ico', category: '开发工具' },
  { name: 'Netlify', url: 'https://www.netlify.com', favicon: 'https://www.netlify.com/favicon.ico', category: '开发工具' },
  { name: 'CodePen', url: 'https://codepen.io', favicon: 'https://cpwebassets.codepen.io/favicon.ico', category: '开发工具' },
  { name: 'Replit', url: 'https://replit.com', favicon: 'https://replit.com/favicon.ico', category: '开发工具' },
];

export default function Bookmarks() {
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
      const defaultData = DEFAULT_BOOKMARKS.map((bm, i) => ({ 
        ...bm, 
        id: Date.now() + i,
        createdAt: Date.now() 
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
  
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', url: '', favicon: '', category: '常用网站' });
  const [previewFavicon, setPreviewFavicon] = useState(null);
  const [faviconLoading, setFaviconLoading] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

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

  const addCategory = () => {
    if (newCategory.trim() && !categories.find(c => c.name === newCategory.trim())) {
      const newCat = { name: newCategory.trim(), icon: '📁' };
      saveCategories([...categories, newCat]);
      setNewCategory('');
      setForm({ ...form, category: newCat.name });
    }
  };
  
  const updateCategoryIcon = (catName, newIcon) => {
    const newCats = categories.map(c => 
      c.name === catName ? { ...c, icon: newIcon } : c
    );
    saveCategories(newCats);
  };

  const editCategory = (oldName, newName) => {
    if (!newName.trim() || oldName === newName) {
      setEditingCategory(null);
      return;
    }
    const newCats = categories.map(c => 
      c.name === oldName ? { ...c, name: newName } : c
    );
    saveCategories(newCats);
    const updatedBookmarks = bookmarks.map(b => 
      b.category === oldName ? { ...b, category: newName } : b
    );
    saveBookmarks(updatedBookmarks);
    setEditingCategory(null);
  };

  const deleteCategory = (catName) => {
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

  const groupedBookmarks = useMemo(() => {
    const cats = {};
    bookmarks.forEach(bm => {
      const cat = bm.category || '默认';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(bm);
    });
    return cats;
  }, [bookmarks]);

  const ICON_PICKER = ['🔖', '⭐', '💻', '📱', '🎮', '📺', '📚', '🎵', '🛒', '✈️', '🏠', '📷', '🔧', '💼', '🎓', '❤️', '🌐', '🐙', '🤖', '🧠', '🔍', '🌙', '🌊', '📖', '🎨', '🔎', '🎬', '▲', '◈', '✒️'];

  return (
    <div className="widget bookmarks-widget">
      <div className="widget-header">
        <h3>🔖 自定义书签</h3>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            className="btn-icon" 
            onClick={() => setShowCategoryManager(!showCategoryManager)} 
            title="管理分类"
          >
            📁
          </button>
          <button className="btn-icon" onClick={() => { resetForm(); setShowAdd(!showAdd); }} title="添加书签">
            {showAdd ? '✕' : '+'}
          </button>
        </div>
      </div>

      {showCategoryManager && (
        <div className="category-manager" style={{ 
          marginBottom: '12px', 
          padding: '10px', 
          background: 'rgba(255,255,255,0.02)', 
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)'
        }}>
          <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>管理分类</h4>
          
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="新分类名称"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="city-search-input"
              style={{ flex: 1, marginBottom: 0, padding: '4px 8px', fontSize: '12px' }}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
            />
            <button className="btn-sm" onClick={addCategory} style={{ padding: '4px 10px' }}>添加</button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {categories.map(cat => (
              <div 
                key={cat.name} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  padding: '3px 8px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}
              >
                <select
                  value={cat.icon}
                  onChange={e => updateCategoryIcon(cat.name, e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: '0 2px'
                  }}
                >
                  {['📁', '🌐', '💼', '🤖', '🎮', '🛠', '📚', '🎵', '🛒', '✈️', '🏠', '📷', '🔧', '🎓', '❤️'].map(ic => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </select>
                {editingCategory === cat.name ? (
                  <input
                    type="text"
                    defaultValue={cat.name}
                    autoFocus
                    className="category-edit-input-inline"
                    style={{ width: '60px', padding: '2px 4px', fontSize: '11px', marginBottom: 0, background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)' }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') editCategory(cat.name, e.target.value);
                      if (e.key === 'Escape') setEditingCategory(null);
                    }}
                    onBlur={e => editCategory(cat.name, e.target.value)}
                  />
                ) : (
                  <span style={{ cursor: 'pointer' }} onClick={() => setEditingCategory(cat.name)}>{cat.name}</span>
                )}
                {cat.name !== '常用网站' && (
                  <button 
                    className="btn-text" 
                    onClick={() => deleteCategory(cat.name)}
                    style={{ fontSize: '10px', padding: '0 2px', color: 'var(--danger)' }}
                  >
                    🗑
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAdd && (
        <form className="add-bookmark-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="名称"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="网址 (例：https://example.com)"
            value={form.url}
            onChange={e => setForm({...form, url: e.target.value})}
            required
          />
          
          {form.url && (
            <div className="favicon-preview-box">
              <span className="favicon-preview-label">图标预览：</span>
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
              onChange={e => setForm({...form, category: e.target.value})}
              className="cat-input"
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 8px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
                flex: 1
              }}
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          <div className="bookmark-form-actions">
            <button type="submit" className="btn-sm">
              {editId !== null ? '保存' : '添加'}
            </button>
            <button type="button" className="btn-sm btn-cancel" onClick={resetForm}>取消</button>
          </div>
        </form>
      )}

      {bookmarks.length === 0 ? (
        <div className="empty-state">
          <p>还没有书签，点击 + 添加</p>
        </div>
      ) : (
        <div className="bookmark-categories-scrollable">
          {Object.entries(groupedBookmarks).map(([cat, items]) => {
            const catInfo = categories.find(c => c.name === cat) || { name: cat, icon: '📁' };
            return (
              <div key={cat} className="bookmark-category">
                <div className="category-header">
                  <h4 className="category-title">
                    <span className="cat-icon">{catInfo.icon}</span>
                    {catInfo.name} <span className="cat-count">({items.length})</span>
                  </h4>
                  {editingCategory === cat ? (
                    <input
                      type="text"
                      defaultValue={catInfo.name}
                      autoFocus
                      className="category-edit-input"
                      onKeyDown={e => {
                        if (e.key === 'Enter') editCategory(cat, e.target.value);
                        if (e.key === 'Escape') setEditingCategory(null);
                      }}
                      onBlur={e => editCategory(cat, e.target.value)}
                    />
                  ) : (
                    <div className="category-actions">
                      {cat !== '常用网站' && (
                        <>
                          <button 
                            className="cat-action-btn" 
                            onClick={() => setEditingCategory(cat)}
                            title="编辑分类"
                          >
                            ✏️
                          </button>
                          <button 
                            className="cat-action-btn cat-delete" 
                            onClick={() => deleteCategory(cat)}
                            title="删除分类"
                          >
                            🗑
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="bookmark-grid">
                  {items.map(bm => (
                    <div key={bm.id} className="bookmark-item" title={bm.url}>
                      <a href={bm.url} target="_blank" rel="noopener noreferrer" className="bookmark-link">
                        {bm.favicon ? (
                          <img src={bm.favicon} alt="" className="bm-favicon" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <span className="bm-icon">{bm.icon || '🌐'}</span>
                        )}
                        <span className="bm-name">{bm.name}</span>
                      </a>
                      <div className="bookmark-actions">
                        <button className="bm-action-btn" onClick={() => startEdit(bm)} title="编辑">✏️</button>
                        <button className="bm-action-btn" onClick={() => removeBookmark(bm.id)} title="删除">🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
