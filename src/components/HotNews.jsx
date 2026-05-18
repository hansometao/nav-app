import { useState, useEffect, useCallback, useRef } from 'react';
import { STORAGE_KEYS, CACHE_CONFIG } from '../config/storage';

// 平台配置
const PLATFORMS = [
  { key: 'bilibili', name: 'B 站', icon: '📺', color: '#00a1d6' },
  { key: 'weibo',    name: '微博', icon: '🔴', color: '#e6162d' },
  { key: 'xiaohongshu', name: '小红书', icon: '📕', color: '#ff2442' },
];

// 各平台分类
const PLATFORM_CATEGORIES = {
  bilibili: [
    { key: 'all',   name: '全站', icon: '🔥', rid: 0 },
    { key: 'anime', name: '番剧', icon: '🎬', rid: 1 },
    { key: 'game',  name: '游戏', icon: '🎮', rid: 4 },
    { key: 'tech',  name: '科技', icon: '💻', rid: 36 },
    { key: 'music', name: '音乐', icon: '🎵', rid: 3 },
    { key: 'movie', name: '影视', icon: '🎥', rid: 181 },
  ],
  weibo: [
    { key: 'search', name: '热搜', icon: '🔥', type: 'search' },
    { key: 'realtime', name: '实时', icon: '⚡', type: 'realtime' },
    { key: 'entertainment', name: '娱乐', icon: '🎭', type: 'ent' },
    { key: 'social', name: '社会', icon: '📰', type: 'social' },
  ],
  xiaohongshu: [
    { key: 'hot', name: '热榜', icon: '🔥', type: 'hot' },
    { key: 'fashion', name: '时尚', icon: '👗', type: 'fashion' },
    { key: 'food', name: '美食', icon: '🍜', type: 'food' },
    { key: 'travel', name: '旅行', icon: '✈️', type: 'travel' },
  ],
};

// 小红书 API 备用方案（当官方 API 失败时使用）
const XHS_FALLBACK_SOURCES = [
  'https://www.xiaohongshu.com/api/sns/v1/note/hot/search',
  'https://www.xiaohongshu.com/api/sns/v1/note/hot/list',
];

function formatCount(n) {
  if (!n && n !== 0) return '';
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿';
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  if (n >= 1000) return (n / 1000).toFixed(1) + '千';
  return String(n);
}

function formatTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * 带重试机制的 fetch
 * @param {string} url - 请求 URL
 * @param {Object} options - fetch 选项
 * @param {number} retries - 重试次数
 */
async function fetchWithRetry(url, options = {}, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (i === retries) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      if (i === retries) throw e;
      await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
    }
  }
}

export default function HotNews() {
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [category, setCategory] = useState(PLATFORM_CATEGORIES.bilibili[0]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [xhsUnavailable, setXhsUnavailable] = useState(false);
  
  // 防止重复请求
  const abortControllerRef = useRef(null);

  // 切换平台时重置分类
  const handlePlatformChange = useCallback((p) => {
    setPlatform(p);
    setCategory(PLATFORM_CATEGORIES[p.key][0]);
    // 如果是小红书且已知不可用，自动切换到 B 站
    if (p.key === 'xiaohongshu' && xhsUnavailable) {
      setError('小红书热榜暂时不可用，已切换到 B 站');
      setTimeout(() => {
        setPlatform(PLATFORMS[0]);
        setCategory(PLATFORM_CATEGORIES.bilibili[0]);
      }, 1000);
    }
  }, [xhsUnavailable]);

  const fetchNews = useCallback(async (plat, cat) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const cacheKey = `${STORAGE_KEYS.HOTNEWS}_${plat.key}_${cat.key}`;
    
    // 读缓存
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const { data, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp < CACHE_CONFIG.NEWS_DURATION) {
          setItems(data);
          setLastUpdate(timestamp);
          setLoading(false);
          return;
        }
      }
    } catch { /* ignore */ }

    try {
      let list = [];

      if (plat.key === 'bilibili') {
        const res = await fetchWithRetry(
          `https://api.bilibili.com/x/web-interface/ranking/v2?rid=${cat.rid}&type=all`,
          { 
            headers: { Referer: 'https://www.bilibili.com' },
            signal: abortControllerRef.current.signal
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message || '未知错误');
        list = json.data.list.slice(0, 20).map((item) => ({
          id: item.aid,
          title: item.title,
          url: `https://www.bilibili.com/video/${item.bvid || `av${item.aid}`}`,
          heat: item.play || 0,
          author: item.owner?.name || '',
        }));

      } else if (plat.key === 'weibo') {
        const res = await fetchWithRetry(
          'https://weibo.com/ajax/side/hotSearch',
          { signal: abortControllerRef.current.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.ok) throw new Error('微博 API 错误');
        
        const data = json.data;
        let rawData = [];
        
        if (cat.type === 'search') {
          rawData = data.hotSearch || [];
        } else if (cat.type === 'realtime') {
          rawData = data.realtime || [];
        } else if (cat.type === 'ent') {
          rawData = data.list_entertainment || [];
        } else if (cat.type === 'social') {
          rawData = data.list_society || [];
        }
        
        list = rawData.slice(0, 20).map((item) => ({
          id: item.word || item.word_scheme,
          title: item.word_scheme || item.word,
          url: `https://s.weibo.com/weibo?q=${encodeURIComponent(item.word_scheme || item.word)}`,
          heat: item.num || item.hot_value || 0,
          author: item.flag_desc || '',
        }));

      } else if (plat.key === 'xiaohongshu') {
        // 小红书：尝试多个 API 端点
        let success = false;
        
        // 先尝试主 API
        try {
          const res = await fetchWithRetry(
            'https://www.xiaohongshu.com/api/sns/v1/note/hot/search',
            { signal: abortControllerRef.current.signal }
          );
          if (res.ok) {
            const json = await res.json();
            if (json.data?.items?.length > 0) {
              list = json.data.items.slice(0, 20).map((item) => ({
                id: item.id,
                title: item.title || item.display_title,
                url: `https://www.xiaohongshu.com/explore/${item.id}`,
                heat: item.heat_score || item.interact_count || 0,
                author: item.user?.nickname || '',
              }));
              success = true;
              setXhsUnavailable(false);
            }
          }
        } catch (e) {
          console.warn('小红书主 API 失败:', e.message);
        }
        
        // 主 API 失败，尝试备用 API
        if (!success) {
          for (const fallbackUrl of XHS_FALLBACK_SOURCES) {
            try {
              const res = await fetchWithRetry(fallbackUrl, {
                signal: abortControllerRef.current.signal
              });
              if (res.ok) {
                const json = await res.json();
                const items = json.data?.items || json.data || [];
                if (items.length > 0) {
                  list = items.slice(0, 20).map((item) => ({
                    id: item.id || item.note_id,
                    title: item.title || item.display_title,
                    url: `https://www.xiaohongshu.com/explore/${item.id || item.note_id}`,
                    heat: item.heat_score || item.interact_count || 0,
                    author: item.user?.nickname || '',
                  }));
                  success = true;
                  setXhsUnavailable(false);
                  break;
                }
              }
            } catch (e) {
              console.warn(`小红书备用 API 失败 (${fallbackUrl}):`, e.message);
            }
          }
        }
        
        // 所有 API 都失败
        if (!success) {
          setXhsUnavailable(true);
          throw new Error('小红书热榜暂时不可用');
        }
      }

      setItems(list);
      setLastUpdate(Date.now());

      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: list,
          timestamp: Date.now(),
        }));
      } catch { /* quota exceeded */ }

    } catch (e) {
      if (e.name === 'AbortError') {
        console.log('请求已取消');
        return;
      }
      console.error('热榜获取失败:', e);
      setError(e.message || '获取热榜失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(platform, category);
    
    // 组件卸载时取消请求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [platform, category, fetchNews]);

  const categories = PLATFORM_CATEGORIES[platform.key];

  return (
    <div className="widget hotnews-widget">
      <div className="widget-header">
        <h3>🔥 热榜资讯</h3>
        <span className="hotnews-update">
          {lastUpdate ? `更新于 ${formatTime(lastUpdate)}` : ''}
        </span>
        <button
          className="btn-icon"
          onClick={() => fetchNews(platform, category)}
          title="刷新"
          disabled={loading}
        >
          🔄
        </button>
      </div>

      {/* 平台标签 */}
      <div className="hotnews-platforms">
        {PLATFORMS.map((p) => (
          <button
            key={p.key}
            className={`hotnews-platform ${p.key === platform.key ? 'active' : ''}`}
            onClick={() => handlePlatformChange(p)}
            style={{ '--platform-color': p.color }}
            disabled={p.key === 'xiaohongshu' && xhsUnavailable}
          >
            {p.icon} {p.name}
            {p.key === 'xiaohongshu' && xhsUnavailable && ' ⚠️'}
          </button>
        ))}
      </div>

      {/* 分类标签 */}
      <div className="hotnews-tabs">
        {categories.map((c) => (
          <button
            key={c.key}
            className={`hotnews-tab ${c.key === category.key ? 'active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {loading && items.length === 0 && (
        <div className="hotnews-loading">加载中...</div>
      )}

      {error && (
        <div className="hotnews-error">
          <span>{error}</span>
          <button className="btn-text" onClick={() => fetchNews(platform, category)}>重试</button>
          {xhsUnavailable && (
            <button 
              className="btn-text" 
              onClick={() => {
                setPlatform(PLATFORMS[0]);
                setCategory(PLATFORM_CATEGORIES.bilibili[0]);
              }}
            >
              切换到 B 站
            </button>
          )}
        </div>
      )}

      {items.length > 0 && (
        <div className="hotnews-list">
          {items.map((item, idx) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hotnews-item"
              title={`${item.title}${item.author ? ` — ${item.author}` : ''}`}
            >
              <span className={`hotnews-rank ${idx < 3 ? `rank-${idx + 1}` : ''}`}>
                {idx + 1}
              </span>
              <span className="hotnews-title">{item.title}</span>
              {item.heat !== undefined && (
                <span className="hotnews-heat">{formatCount(item.heat)}</span>
              )}
            </a>
          ))}
          <div className="hotnews-source">
            数据来源：{platform.name}
          </div>
        </div>
      )}
    </div>
  );
}
