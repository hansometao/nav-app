import { useState, useRef, useEffect, useCallback } from 'react';

const SEARCH_ENGINES = [
  {
    name: '百度',
    url: 'https://www.baidu.com/s?wd=',
    favicon: 'https://www.baidu.com/favicon.ico',
  },
  {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    favicon: 'https://www.bing.com/favicon.ico',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/search?q=',
    favicon: 'https://github.com/favicon.ico',
  },
  {
    name: '知乎',
    url: 'https://www.zhihu.com/search?type=content&q=',
    favicon: 'https://static.zhihu.com/heifetz/favicon.ico',
  },
];

const AI_TOOLS = [
  { name: 'ChatGPT', url: 'https://chat.openai.com', icon: '🤖', desc: 'OpenAI 对话助手' },
  { name: 'Claude', url: 'https://claude.ai', icon: '🧠', desc: 'Anthropic AI 助手' },
  { name: 'DeepSeek', url: 'https://chat.deepseek.com', icon: '🔍', desc: '深度求索 AI' },
  { name: 'Gemini', url: 'https://gemini.google.com', icon: '✨', desc: 'Google AI 助手' },
  { name: '通义千问', url: 'https://tongyi.aliyun.com', icon: '🌊', desc: '阿里云 AI' },
  { name: '文心一言', url: 'https://yiyan.baidu.com', icon: '📖', desc: '百度 AI 助手' },
  { name: 'Kimi', url: 'https://kimi.moonshot.cn', icon: '🌙', desc: '月之暗面 AI' },
  { name: '豆包', url: 'https://www.doubao.com', icon: '🫘', desc: '字节跳动 AI' },
  { name: 'Perplexity', url: 'https://www.perplexity.ai', icon: '🔎', desc: 'AI 搜索引擎' },
  { name: 'Grok', url: 'https://grok.com', icon: '⚡', desc: 'xAI 助手' },
  { name: 'Midjourney', url: 'https://www.midjourney.com', icon: '🎨', desc: 'AI 图像生成' },
  { name: 'StableDiff.', url: 'https://stability.ai', icon: '🖼', desc: '开源 AI 绘图' },
  { name: 'Suno', url: 'https://suno.com', icon: '🎵', desc: 'AI 音乐生成' },
  { name: 'Runway', url: 'https://runwayml.com', icon: '🎬', desc: 'AI 视频创作' },
];

const QUICK_LINKS = [
  { name: 'Google', url: 'https://www.google.com', icon: '🔍' },
  { name: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { name: 'YouTube', url: 'https://youtube.com', icon: '▶️' },
  { name: 'B 站', url: 'https://www.bilibili.com', icon: '📺' },
  { name: '知乎', url: 'https://www.zhihu.com', icon: '💡' },
  { name: '微博', url: 'https://weibo.com', icon: '📱' },
  { name: '掘金', url: 'https://juejin.cn', icon: '🛠' },
  { name: 'CSDN', url: 'https://www.csdn.net', icon: '📝' },
  { name: 'StackOver', url: 'https://stackoverflow.com', icon: '💬' },
  { name: 'Reddit', url: 'https://www.reddit.com', icon: '🧵' },
  { name: 'HackerNews', url: 'https://news.ycombinator.com', icon: '📰' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org', icon: '🌐' },
];

const getSearchHistory = () => {
  try {
    const history = localStorage.getItem('navAppSearchHistory');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

const saveSearchHistory = history => {
  try {
    localStorage.setItem('navAppSearchHistory', JSON.stringify(history.slice(0, 10)));
  } catch (e) {
    // Silent fail for localStorage operations
  }
};

/**
 * AITools 组件
 * @param {Object} props
 * @param {Object} props.searchEngine - 当前搜索引擎
 * @param {Function} props.onSearchEngineChange - 切换搜索引擎回调
 * @param {boolean} [props.compact=false] - 紧凑模式，只显示搜索栏
 */
export default function AITools({ searchEngine, onSearchEngineChange, compact = false }) {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const history = getSearchHistory();
    setSearchHistory(history);
  }, []);

  const handleSearch = useCallback(
    query => {
      if (!query.trim()) return;
      const newHistory = [query, ...searchHistory.filter(q => q !== query)].slice(0, 10);
      saveSearchHistory(newHistory);
      setSearchHistory(newHistory);
      window.open(`${searchEngine.url}${encodeURIComponent(query)}`, '_blank');
    },
    [searchEngine, searchHistory]
  );

  const handleSubmit = e => {
    e.preventDefault();
    handleSearch(query);
    setShowHistory(false);
  };

  const handleHistoryClick = q => {
    setQuery(q);
    handleSearch(q);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    saveSearchHistory([]);
  };

  return (
    <div className="ai-tools-widget">
      {!compact && (
        <>
          <section className="quick-links-widget">
            <h3 className="widget-title-label">快捷链接</h3>
            <div className="quick-links-grid">
              {QUICK_LINKS.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="quick-link-item"
                >
                  <span className="ql-icon">{link.icon}</span>
                  <span className="ql-name">{link.name}</span>
                </a>
              ))}
            </div>
          </section>

          <section className="ai-tools-section">
            <h3 className="widget-title-label">AI 工具</h3>
            <div className="ai-tools-grid">
              {AI_TOOLS.map((tool, i) => (
                <a
                  key={i}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ai-tool-card"
                >
                  <span className="ai-tool-icon">{tool.icon}</span>
                  <div className="ai-tool-info">
                    <span className="ai-tool-name">{tool.name}</span>
                    <span className="ai-tool-desc">{tool.desc}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="search-section search-section-compact">
        <form onSubmit={handleSubmit} className="search-form">
          <select
            className="search-engine-select"
            value={searchEngine.name}
            onChange={e => {
              const se = SEARCH_ENGINES.find(s => s.name === e.target.value);
              if (se && onSearchEngineChange) onSearchEngineChange(se);
            }}
          >
            {SEARCH_ENGINES.map(se => (
              <option key={se.name} value={se.name}>
                {se.name}
              </option>
            ))}
          </select>
          <div className="search-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder={`使用 ${searchEngine.name} 搜索`}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 200)}
              autoComplete="off"
            />
            {showHistory && searchHistory.length > 0 && (
              <div className="search-history-dropdown">
                <div className="search-history-header">
                  <span>搜索历史</span>
                  <button type="button" onClick={clearHistory} className="clear-history-btn">
                    清除
                  </button>
                </div>
                {searchHistory.map((q, i) => (
                  <button
                    type="button"
                    key={i}
                    className="search-history-item"
                    onClick={() => handleHistoryClick(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="search-btn" aria-label="搜索">
            🔍
          </button>
        </form>
      </section>
    </div>
  );
}
