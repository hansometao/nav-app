import { useState, useMemo, useCallback, useEffect } from 'react';
import { validateBookmark, sanitizeHtml, getFavicon } from '../utils';
import { useDebounce } from '../hooks';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_BOOKMARKS,
  ICON_OPTIONS,
  ICON_SVGS,
  STORAGE_KEYS,
} from '../constants';

// 图标组件
const Icon = ({ iconName, className, size = 16 }) => {
  const svgHtml = ICON_SVGS[iconName] || ICON_SVGS.folder;
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{
        __html: svgHtml
          .replace(/width="20"/, `width="${size}"`)
          .replace(/height="20"/, `height="${size}"`),
      }}
    />
  );
};

const BookmarkItem = ({ bm, stats, onEdit, onDelete, onVisit, updateFavicon }) => {
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
            onError={() => {
              getFavicon(bm.url).then(newFavicon => {
                setFaviconUrl(newFavicon);
                updateFavicon(bm.id, newFavicon);
              });
            }}
          />
        ) : (
          <Icon iconName="bookmark" size={20} />
        )}
      </div>
      <div className="flat-bookmark-info">
        <span className="flat-bookmark-name">{bm.name}</span>
      </div>
      {visitCount > 0 && <span className="flat-bookmark-visits">🔥 {visitCount}</span>}
      <div className={`flat-bookmark-actions ${isHovered ? 'visible' : ''}`}>
        <button
          className="flat-edit-btn"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(bm);
          }}
          title="编辑"
          aria-label="编辑书签"
        >
          <Icon iconName="settings" size={14} />
        </button>
        <button
          className="flat-delete-btn"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(bm.id);
          }}
          title="删除"
          aria-label="删除书签"
        >
          <Icon iconName="trash" size={14} />
        </button>
      </div>
    </a>
  );
};

const EmptyState = ({ onAdd }) => (
  <div className="flat-empty-state">
    <div className="empty-icon">
      <Icon iconName="bookmark" size={48} />
    </div>
    <h3>暂无书签</h3>
    <p>点击下方按钮添加你的第一个网址书签</p>
    <button className="flat-add-btn" onClick={onAdd}>
      <Icon iconName="plus" size={16} /> 添加网址
    </button>
  </div>
);

const CategoryManager = ({ categories, onAdd, onDelete, onEdit, bookmarksCount }) => {
  const [showForm, setShowForm] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', icon: ICON_OPTIONS[0] });
  const [editingCat, setEditingCat] = useState(null);
  const [showAllIcons, setShowAllIcons] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    if (!newCat.name.trim()) return;

    if (editingCat) {
      onEdit(editingCat, { name: newCat.name, icon: newCat.icon.iconName });
    } else {
      onAdd({ name: newCat.name, icon: newCat.icon.iconName });
    }
    setShowForm(false);
    setNewCat({ name: '', icon: ICON_OPTIONS[0] });
    setEditingCat(null);
    setShowAllIcons(false);
  };

  const startEdit = cat => {
    const existingIcon = ICON_OPTIONS.find(opt => opt.iconName === cat.icon) || ICON_OPTIONS[0];
    setNewCat({
      name: cat.name,
      icon: existingIcon,
    });
    setEditingCat(cat.name);
    setShowForm(true);
  };

  const visibleIcons = showAllIcons ? ICON_OPTIONS : ICON_OPTIONS.slice(0, 12);

  return (
    <div className="flat-category-manager">
      <div className="flat-category-manager-header">
        <div className="manager-title-row">
          <span className="manager-icon">
            <Icon iconName="folder" size={18} />
          </span>
          <span className="manager-title">分类管理</span>
          <span className="category-total-count">{categories.length} 个分类</span>
        </div>
        <button
          className={`flat-manage-cats-btn ${showForm ? 'active' : ''}`}
          onClick={() => setShowForm(!showForm)}
          title={showForm ? '收起表单' : '添加分类'}
          aria-label={showForm ? '收起表单' : '添加分类'}
        >
          {showForm ? <Icon iconName="x" size={18} /> : <Icon iconName="plus" size={18} />}
        </button>
      </div>

      {showForm && (
        <div className="flat-category-form">
          <form onSubmit={handleSubmit}>
            <div className="form-row-group">
              <div className="form-field">
                <label className="field-label">分类名称</label>
                <input
                  type="text"
                  placeholder="输入分类名称"
                  value={newCat.name}
                  onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-field">
                <label className="field-label">选择图标</label>
                <div className="icon-selector-wrapper">
                  <div className="icon-preview-display">
                    <span className="preview-icon">
                      <Icon iconName={newCat.icon.iconName} size={20} />
                    </span>
                    <span className="preview-icon-label">{newCat.icon.label}</span>
                  </div>
                  <div className="icon-picker-grid">
                    {visibleIcons.map(opt => (
                      <button
                        key={opt.iconName}
                        type="button"
                        className={`icon-option-item ${newCat.icon.iconName === opt.iconName ? 'active' : ''}`}
                        onClick={() => setNewCat({ ...newCat, icon: opt })}
                        title={opt.label}
                      >
                        <Icon iconName={opt.iconName} size={20} />
                      </button>
                    ))}
                    {!showAllIcons && ICON_OPTIONS.length > 12 && (
                      <button
                        type="button"
                        className="icon-show-more"
                        onClick={() => setShowAllIcons(true)}
                        title="显示更多"
                      >
                        <span>▼</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flat-form-buttons">
              <button type="submit" className="flat-save-btn">
                <Icon iconName="check" size={14} />
                {editingCat ? '保存' : '添加'}
              </button>
              <button
                type="button"
                className="flat-cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingCat(null);
                  setNewCat({ name: '', icon: ICON_OPTIONS[0] });
                  setShowAllIcons(false);
                }}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {categories.length > 0 && (
        <div className="flat-category-grid">
          {categories.map(cat => {
            const catBookmarks = bookmarksCount[cat.name] || 0;
            const catIcon = ICON_OPTIONS.find(opt => opt.iconName === cat.icon) || ICON_OPTIONS[0];
            return (
              <div key={cat.name} className="category-card">
                <div className="category-card-header">
                  <span className="category-card-icon">
                    <Icon iconName={catIcon.iconName} size={20} />
                  </span>
                  <div className="category-card-info">
                    <span className="category-card-name">{cat.name}</span>
                    <span className="category-card-count">{catBookmarks} 个书签</span>
                  </div>
                </div>
                <div className="category-card-actions">
                  <button
                    className="category-action-btn edit"
                    onClick={() => startEdit(cat)}
                    title="编辑分类"
                  >
                    <Icon iconName="settings" size={14} />
                  </button>
                  <button
                    className="category-action-btn delete"
                    onClick={() => onDelete(cat.name)}
                    title="删除分类"
                    disabled={categories.length <= 1}
                  >
                    <Icon iconName="trash" size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function FlatBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (!saved) {
        const defaultData = DEFAULT_BOOKMARKS.map((bm, i) => ({
          ...bm,
          id: Date.now() + i,
          createdAt: Date.now(),
        }));
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(defaultData));
        return defaultData;
      }
      return JSON.parse(saved);
    } catch {
      return DEFAULT_BOOKMARKS.map((bm, i) => ({
        ...bm,
        id: Date.now() + i,
        createdAt: Date.now(),
      }));
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const savedCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (savedCats) {
        return JSON.parse(savedCats);
      }
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    url: '',
    favicon: '',
    category: categories[0]?.name || '常用网站',
  });
  const [previewFavicon, setPreviewFavicon] = useState(null);
  const [faviconLoading, setFaviconLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const recordVisit = useCallback(bookmarkId => {
    setStats(prev => {
      const newStats = { ...prev };
      if (!newStats[bookmarkId]) {
        newStats[bookmarkId] = { visits: 0, lastVisit: 0 };
      }
      newStats[bookmarkId].visits += 1;
      newStats[bookmarkId].lastVisit = Date.now();
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
      return newStats;
    });
  }, []);

  const saveBookmarks = useCallback(newList => {
    setBookmarks(newList);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(newList));
  }, []);

  const updateFavicon = useCallback((bookmarkId, favicon) => {
    setBookmarks(prev => prev.map(b => (b.id === bookmarkId ? { ...b, favicon } : b)));
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (saved) {
        const bookmarks = JSON.parse(saved);
        const updated = bookmarks.map(b => (b.id === bookmarkId ? { ...b, favicon } : b));
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to update favicon:', e);
    }
  }, []);

  const saveCategories = useCallback(newCats => {
    setCategories(newCats);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCats));
  }, []);

  const addCategory = useCallback(
    cat => {
      const newCat = { name: sanitizeHtml(cat.name), icon: cat.icon };
      if (!categories.find(c => c.name === newCat.name)) {
        saveCategories([...categories, newCat]);
      }
    },
    [categories, saveCategories]
  );

  const deleteCategory = useCallback(
    catName => {
      if (categories.length <= 1) return;
      saveCategories(categories.filter(c => c.name !== catName));
      const newDefaultCat =
        categories[0].name === catName ? categories[1].name : categories[0].name;
      saveBookmarks(
        bookmarks.map(b => (b.category === catName ? { ...b, category: newDefaultCat } : b))
      );
    },
    [categories, bookmarks, saveCategories, saveBookmarks]
  );

  const editCategory = useCallback(
    (oldName, newCat) => {
      const updatedCats = categories.map(c =>
        c.name === oldName ? { name: sanitizeHtml(newCat.name), icon: newCat.icon } : c
      );
      saveCategories(updatedCats);
      saveBookmarks(
        bookmarks.map(b =>
          b.category === oldName ? { ...b, category: sanitizeHtml(newCat.name) } : b
        )
      );
    },
    [categories, bookmarks, saveCategories, saveBookmarks]
  );

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
      saveBookmarks([...bookmarks, { id: Date.now(), ...entry, createdAt: Date.now() }]);
    }
    resetForm();
  };

  const startEdit = bm => {
    setForm({ name: bm.name, url: bm.url, favicon: bm.favicon || '', category: bm.category });
    setPreviewFavicon(bm.favicon || null);
    setEditId(bm.id);
    setShowAdd(true);
  };

  const removeBookmark = id => {
    if (confirm('确认删除此书签？')) {
      saveBookmarks(bookmarks.filter(b => b.id !== id));
    }
  };

  const filteredBookmarks = useMemo(() => {
    let result = bookmarks;

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        bm =>
          bm.name.toLowerCase().includes(query) ||
          bm.url.toLowerCase().includes(query) ||
          bm.category.toLowerCase().includes(query)
      );
    }

    if (sortBy === 'visits') {
      result = [...result].sort((a, b) => (stats[b.id]?.visits || 0) - (stats[a.id]?.visits || 0));
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    }

    return result;
  }, [bookmarks, debouncedSearchQuery, sortBy, stats]);

  const groupedBookmarks = useMemo(() => {
    const cats = {};
    filteredBookmarks.forEach(bm => {
      const cat = bm.category || '默认';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(bm);
    });
    return cats;
  }, [filteredBookmarks]);

  const bookmarksCountByCategory = useMemo(() => {
    const counts = {};
    bookmarks.forEach(bm => {
      const cat = bm.category || '默认';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [bookmarks]);

  const hotBookmarks = useMemo(() => {
    return [...bookmarks]
      .sort((a, b) => (stats[b.id]?.visits || 0) - (stats[a.id]?.visits || 0))
      .slice(0, 5);
  }, [bookmarks, stats]);

  return (
    <div className="flat-bookmarks">
      <div className="flat-bookmarks-header">
        <div className="flat-bookmarks-title-row">
          <h2 className="flat-bookmarks-title">
            <Icon iconName="bookmark" size={20} /> 网址导航
          </h2>
          <span className="flat-bookmarks-count">共 {bookmarks.length} 个书签</span>
        </div>
        <div className="flat-bookmarks-actions">
          <div className="flat-search-box">
            <span className="search-icon">
              <Icon iconName="search" size={16} />
            </span>
            <input
              type="text"
              placeholder="搜索网址..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flat-search-input"
            />
          </div>
          <select
            className="flat-sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="default">默认排序</option>
            <option value="visits">热门优先</option>
            <option value="name">名称排序</option>
          </select>
          <button className="flat-add-btn" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? (
              <>
                <Icon iconName="x" size={16} /> 取消
              </>
            ) : (
              <>
                <Icon iconName="plus" size={16} /> 添加网址
              </>
            )}
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
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="网址 (https://...)"
              value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
              required
            />
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {form.url && (
              <div className="flat-favicon-preview">
                {faviconLoading ? (
                  <span>加载中...</span>
                ) : previewFavicon ? (
                  <img src={previewFavicon} alt="" />
                ) : (
                  <span>自动获取图标</span>
                )}
              </div>
            )}
            <div className="flat-form-buttons">
              <button type="submit" className="flat-save-btn">
                {editId !== null ? '保存' : '添加'}
              </button>
              <button type="button" className="flat-cancel-btn" onClick={resetForm}>
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {hotBookmarks.length > 0 && !searchQuery && (
        <div className="flat-hot-section">
          <h3 className="flat-hot-title">🔥 热门访问</h3>
          <div className="flat-hot-list">
            {hotBookmarks.map(bm => (
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
        <div className="flat-bookmarks-vertical">
          {categories.map(cat => {
            const items = groupedBookmarks[cat.name] || [];
            if (items.length === 0 && searchQuery) return null;

            const catIcon = ICON_OPTIONS.find(opt => opt.iconName === cat.icon) || ICON_OPTIONS[0];

            return (
              <div key={cat.name} className="flat-category-section">
                <div className="flat-category-header">
                  <span className="flat-category-icon">
                    <Icon iconName={catIcon.iconName} size={20} />
                  </span>
                  <span className="flat-category-name">{cat.name}</span>
                  <span className="flat-category-count">({items.length})</span>
                </div>
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
      )}

      <CategoryManager
        categories={categories}
        onAdd={addCategory}
        onDelete={deleteCategory}
        onEdit={editCategory}
        bookmarksCount={bookmarksCountByCategory}
      />
    </div>
  );
}
