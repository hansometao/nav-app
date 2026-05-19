import { useState, useEffect, useCallback, useRef } from 'react';
import { STORAGE_KEYS, CACHE_CONFIG } from '../config/storage';
import { Icon } from '../utils/icons';

// 平台配置
const PLATFORMS = [
  { key: 'zhihu', name: '知乎', color: '#0084ff' },
  { key: 'bilibili', name: 'B站', color: '#00a1d6' },
  { key: 'weibo', name: '微博', color: '#e6162d' },
  { key: 'douyin', name: '抖音', color: '#000000' },
  { key: 'toutiao', name: '头条', color: '#d81e06' },
];

// 热榜数据（模拟数据，可替换为真实API）
const MOCK_DATA = {
  zhihu: [
    { id: '1', title: '如何看待人工智能的未来发展趋势', heat: 852000, url: 'https://www.zhihu.com' },
    { id: '2', title: '2024年最值得关注的技术领域有哪些', heat: 689000, url: 'https://www.zhihu.com' },
    { id: '3', title: '深度学习在医疗影像中的应用进展', heat: 542000, url: 'https://www.zhihu.com' },
    { id: '4', title: '推荐系统算法的最新研究成果', heat: 421000, url: 'https://www.zhihu.com' },
    { id: '5', title: '大语言模型在教育领域的应用场景', heat: 398000, url: 'https://www.zhihu.com' },
    { id: '6', title: '计算机视觉在自动驾驶中的突破', heat: 365000, url: 'https://www.zhihu.com' },
    { id: '7', title: '边缘计算技术的发展现状', heat: 312000, url: 'https://www.zhihu.com' },
    { id: '8', title: '量子计算在密码学中的应用', heat: 289000, url: 'https://www.zhihu.com' },
    { id: '9', title: 'Web3.0技术的发展前景分析', heat: 276000, url: 'https://www.zhihu.com' },
    { id: '10', title: '5G+AI的融合应用场景', heat: 245000, url: 'https://www.zhihu.com' },
  ],
  bilibili: [
    { id: '1', title: '【技术解析】最新的前端框架对比', heat: 1250000, url: 'https://www.bilibili.com' },
    { id: '2', title: '从零开始学编程：Python入门教程', heat: 980000, url: 'https://www.bilibili.com' },
    { id: '3', title: '2024年程序员必备技能清单', heat: 870000, url: 'https://www.bilibili.com' },
    { id: '4', title: 'Git版本控制完整教程', heat: 760000, url: 'https://www.bilibili.com' },
    { id: '5', title: '微服务架构实战演练', heat: 650000, url: 'https://www.bilibili.com' },
    { id: '6', title: 'Docker容器化部署指南', heat: 540000, url: 'https://www.bilibili.com' },
    { id: '7', title: 'React vs Vue深度对比', heat: 480000, url: 'https://www.bilibili.com' },
    { id: '8', title: '数据库设计最佳实践', heat: 420000, url: 'https://www.bilibili.com' },
    { id: '9', title: '算法面试通关秘籍', heat: 390000, url: 'https://www.bilibili.com' },
    { id: '10', title: 'DevOps工程化实践', heat: 350000, url: 'https://www.bilibili.com' },
  ],
  weibo: [
    { id: '1', title: '科技前沿：AI大模型新突破', heat: 2340000, url: 'https://weibo.com' },
    { id: '2', title: '2024全球科技峰会即将召开', heat: 1890000, url: 'https://weibo.com' },
    { id: '3', title: '国产芯片技术取得新进展', heat: 1560000, url: 'https://weibo.com' },
    { id: '4', title: '新能源汽车销量创新高', heat: 1450000, url: 'https://weibo.com' },
    { id: '5', title: '数字经济发展报告发布', heat: 1230000, url: 'https://weibo.com' },
    { id: '6', title: '人工智能伦理规范出台', heat: 980000, url: 'https://weibo.com' },
    { id: '7', title: '云计算市场竞争格局', heat: 870000, url: 'https://weibo.com' },
    { id: '8', title: '网络安全最新动态', heat: 760000, url: 'https://weibo.com' },
    { id: '9', title: '5G应用场景加速落地', heat: 650000, url: 'https://weibo.com' },
    { id: '10', title: '科技创新企业排名', heat: 540000, url: 'https://weibo.com' },
  ],
  douyin: [
    { id: '1', title: '短视频创作技巧分享', heat: 3560000, url: 'https://www.douyin.com' },
    { id: '2', title: 'AI绘画制作教程', heat: 2890000, url: 'https://www.douyin.com' },
    { id: '3', title: '直播电商运营干货', heat: 2450000, url: 'https://www.douyin.com' },
    { id: '4', title: '内容创作爆款秘籍', heat: 2120000, url: 'https://www.douyin.com' },
    { id: '5', title: '数字人虚拟主播技术', heat: 1870000, url: 'https://www.douyin.com' },
    { id: '6', title: '视频剪辑高效工具', heat: 1540000, url: 'https://www.douyin.com' },
    { id: '7', title: '抖音SEO优化指南', heat: 1320000, url: 'https://www.douyin.com' },
    { id: '8', title: '短视频数据分析方法', heat: 1180000, url: 'https://www.douyin.com' },
    { id: '9', title: '直播带货技巧分享', heat: 1050000, url: 'https://www.douyin.com' },
    { id: '10', title: '抖音小店经营心得', heat: 920000, url: 'https://www.douyin.com' },
  ],
  toutiao: [
    { id: '1', title: '科技快讯：最新行业动态', heat: 1670000, url: 'https://www.toutiao.com' },
    { id: '2', title: '人工智能应用案例精选', heat: 1450000, url: 'https://www.toutiao.com' },
    { id: '3', title: '创业投资风向解读', heat: 1230000, url: 'https://www.toutiao.com' },
    { id: '4', title: '科技政策分析报告', heat: 1080000, url: 'https://www.toutiao.com' },
    { id: '5', title: '产品设计方法论分享', heat: 950000, url: 'https://www.toutiao.com' },
    { id: '6', title: '用户增长实战经验', heat: 830000, url: 'https://www.toutiao.com' },
    { id: '7', title: '数据化运营技巧', heat: 720000, url: 'https://www.toutiao.com' },
    { id: '8', title: '内容运营心法', heat: 650000, url: 'https://www.toutiao.com' },
    { id: '9', title: '流量变现新模式', heat: 580000, url: 'https://www.toutiao.com' },
    { id: '10', title: '品牌营销新思路', heat: 510000, url: 'https://www.toutiao.com' },
  ],
};

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

// 使用公共API获取真实数据
async function fetchRealData(platform) {
  try {
    // 尝试使用免费的公开API
    let url, data;
    
    switch(platform) {
      case 'zhihu':
        // 尝试知乎热榜API
        try {
          const res = await fetch('https://api.oioweb.cn/api/zhihu/hot');
          if (res.ok) {
            const json = await res.json();
            if (json.result && json.result.length > 0) {
              return json.result.map((item, idx) => ({
                id: item.id || idx,
                title: item.title,
                heat: item.hot || item.heat || Math.floor(Math.random() * 500000) + 100000,
                url: item.url || 'https://www.zhihu.com',
              }));
            }
          }
        } catch (e) {
          console.log('知乎API获取失败，使用备用数据');
        }
        break;
        
      case 'bilibili':
        try {
          const res = await fetch('https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all');
          if (res.ok) {
            const json = await res.json();
            if (json.code === 0 && json.data && json.data.list) {
              return json.data.list.slice(0, 20).map(item => ({
                id: item.aid,
                title: item.title,
                url: `https://www.bilibili.com/video/${item.bvid || `av${item.aid}`}`,
                heat: item.play || item.stat?.view || Math.floor(Math.random() * 500000) + 100000,
              }));
            }
          }
        } catch (e) {
          console.log('B站API获取失败，使用备用数据');
        }
        break;
        
      case 'weibo':
        try {
          const res = await fetch('https://api.oioweb.cn/api/weibo/hot');
          if (res.ok) {
            const json = await res.json();
            if (json.result && json.result.length > 0) {
              return json.result.map((item, idx) => ({
                id: item.id || idx,
                title: item.title || item.word,
                heat: item.hot || item.num || Math.floor(Math.random() * 500000) + 100000,
                url: item.url || 'https://s.weibo.com/top/summary',
              }));
            }
          }
        } catch (e) {
          console.log('微博API获取失败，使用备用数据');
        }
        break;
        
      default:
        // 通用处理
        break;
    }
    
    return null; // 返回null表示使用备用数据
  } catch (error) {
    console.log(`${platform} API获取失败:`, error);
    return null;
  }
}

export default function HotNews() {
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  
  const abortControllerRef = useRef(null);

  const fetchNews = useCallback(async (plat) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const cacheKey = `${STORAGE_KEYS.HOTNEWS}_${plat.key}`;
    
    // 读缓存
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const { data, timestamp, isMock } = JSON.parse(raw);
        if (Date.now() - timestamp < CACHE_CONFIG.NEWS_DURATION) {
          setItems(data);
          setLastUpdate(timestamp);
          setUseMockData(isMock || false);
          setLoading(false);
          return;
        }
      }
    } catch { /* ignore */ }

    try {
      let list = null;
      let isMock = false;

      // 先尝试获取真实数据
      if (!useMockData) {
        list = await fetchRealData(plat.key);
      }

      // 如果没有真实数据，使用模拟数据
      if (!list) {
        list = MOCK_DATA[plat.key] || [];
        isMock = true;
      }

      setItems(list);
      setUseMockData(isMock);
      setLastUpdate(Date.now());

      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: list,
          timestamp: Date.now(),
          isMock: isMock,
        }));
      } catch { /* quota exceeded */ }

    } catch (e) {
      if (e.name === 'AbortError') {
        console.log('请求已取消');
        return;
      }
      console.error('热榜获取失败:', e);
      // 出错时使用模拟数据
      try {
        const fallbackList = MOCK_DATA[plat.key] || [];
        setItems(fallbackList);
        setUseMockData(true);
        setLastUpdate(Date.now());
        setError(`获取热榜失败，已加载本地数据`);
      } catch (fallbackErr) {
        setError('获取热榜失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  useEffect(() => {
    fetchNews(platform);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [platform, fetchNews]);

  return (
    <div className="widget hotnews-widget">
      <div className="widget-header">
        <h3><Icon name="news" size={18} /> 热榜资讯</h3>
        <div className="hotnews-header-actions">
          <span className="hotnews-update">
            {lastUpdate ? `更新于 ${formatTime(lastUpdate)}` : ''}
            {useMockData && <span className="hotnews-mock-tag">本地数据</span>}
          </span>
          <button
            className="btn-icon"
            onClick={() => fetchNews(platform)}
            title="刷新"
            disabled={loading}
          >
            <Icon name="refreshCw" size={16} />
          </button>
        </div>
      </div>

      <div className="hotnews-platforms">
        {PLATFORMS.map((p) => (
          <button
            key={p.key}
            className={`hotnews-platform ${p.key === platform.key ? 'active' : ''}`}
            onClick={() => setPlatform(p)}
            style={{ '--platform-color': p.color }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {loading && items.length === 0 && (
        <div className="hotnews-loading">加载中...</div>
      )}

      {error && (
        <div className="hotnews-error">
          <span>{error}</span>
          <button className="btn-text" onClick={() => fetchNews(platform)}>重试</button>
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
              title={item.title}
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
