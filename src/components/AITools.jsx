import { useState, useRef, useEffect, useCallback } from 'react';

const SEARCH_ENGINES = [
  { name: 'Google', url: 'https://www.google.com/search?q=', icon: '🔍' },
  { name: '百度', url: 'https://www.baidu.com/s?wd=', icon: '🐻' },
  { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: '🟦' },
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: '🦆' },
  { name: 'GitHub', url: 'https://github.com/search?q=', icon: '🐙' },
  { name: 'B站', url: 'https://search.bilibili.com/all?keyword=', icon: '📺' },
  { name: '知乎', url: 'https://www.zhihu.com/search?type=content&q=', icon: '💡' },
];

const AI_TOOLS = [
  { name: 'ChatGPT',    url: 'https://chat.openai.com',        icon: '🤖', desc: 'OpenAI 对话助手' },
  { name: 'Claude',     url: 'https://claude.ai',              icon: '🧠', desc: 'Anthropic AI 助手' },
  { name: 'DeepSeek',   url: 'https://chat.deepseek.com',      icon: '🔍', desc: '深度求索 AI' },
  { name: 'Gemini',     url: 'https://gemini.google.com',      icon: '✨', desc: 'Google AI 助手' },
  { name: '通义千问',   url: 'https://tongyi.aliyun.com',      icon: '🌊', desc: '阿里云 AI' },
  { name: '文心一言',   url: 'https://yiyan.baidu.com',        icon: '📖', desc: '百度 AI 助手' },
  { name: 'Kimi',       url: 'https://kimi.moonshot.cn',       icon: '🌙', desc: '月之暗面 AI' },
  { name: '豆包',       url: 'https://www.doubao.com',         icon: '🫘', desc: '字节跳动 AI' },
  { name: 'Perplexity', url: 'https://www.perplexity.ai',      icon: '🔎', desc: 'AI 搜索引擎' },
  { name: 'Grok',       url: 'https://grok.com',               icon: '⚡', desc: 'xAI 助手' },
  { name: 'Midjourney', url: 'https://www.midjourney.com',     icon: '🎨', desc: 'AI 图像生成' },
  { name: 'StableDiff.',url: 'https://stability.ai',           icon: '🖼', desc: '开源 AI 绘图' },
  { name: 'Suno',       url: 'https://suno.com',               icon: '🎵', desc: 'AI 音乐生成' },
  { name: 'Runway',     url: 'https://runwayml.com',           icon: '🎬', desc: 'AI 视频创作' },
];

const QUICK_LINKS = [
  { name: 'Google',    url: 'https://www.google.com',       icon: '🔍' },
  { name: 'GitHub',    url: 'https://github.com',           icon: '🐙' },
  { name: 'YouTube',   url: 'https://youtube.com',          icon: '▶️' },
  { name: 'B 站',       url: 'https://www.bilibili.com',     icon: '📺' },
  { name: '知乎',      url: 'https://www.zhihu.com',        icon: '💡' },
  { name: '微博',      url: 'https://weibo.com',            icon: '📱' },
  { name: '掘金',      url: 'https://juejin.cn',            icon: '🛠' },
  { name: 'CSDN',      url: 'https://www.csdn.net',         icon: '📝' },
  { name: 'StackOver', url: 'https://stackoverflow.com',    icon: '💬' },
  { name: 'Reddit',    url: 'https://www.reddit.com',       icon: '🧵' },
  { name: 'HackerNews',url: 'https://news.ycombinator.com', icon: '📰' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org',     icon: '🌐' },
];

// 从 localStorage 获取搜索历史
const getSearchHistory = () => {
  try {
    const history = localStorage.getItem('navAppSearchHistory');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

// 保存搜索历史到 localStorage
const saveSearchHistory = (history) => {
  try {
    localStorage.setItem('navAppSearchHistory', JSON.stringify(history.slice(0, 10)));
  } catch {}
};

/**
 * AITools 组件
 * @param {Object} props
 * @param {Object} props.searchEngine - 当前搜索引擎
 * @param {Function} props.onSearchEngineChange - 切换搜索引擎回调
 * @param {boolean} [props.compact=false] - 紧凑模式，只显示搜索栏
 */
export default function AITools({ searchEngine, onSearchEngineChange, compact = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showEngineMenu, setShowEngineMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState(getSearchHistory);
  const inputRef = useRef(null);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      window.open(searchEngine.url + encodeURIComponent(query), '_blank');
      
      // 更新搜索历史
      const newHistory = [query, ...searchHistory.filter(h => h !== query)];
      setSearchHistory(newHistory);
      saveSearchHistory(newHistory);
      
      setSearchQuery('');
      setShowHistory(false);
    }
  }, [searchQuery, searchEngine, searchHistory]);

  const handleHistorySearch = useCallback((query) => {
    window.open(searchEngine.url + encodeURIComponent(query), '_blank');
    setSearchQuery('');
    setShowHistory(false);
  }, [searchEngine]);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    saveSearchHistory([]);
    setShowHistory(false);
  }, []);
  
  // 键盘快捷键：Ctrl/Cmd + K 聚焦搜索框
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowHistory(searchHistory.length > 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchHistory]);
  
  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showEngineMenu && !e.target.closest('.search-engine-select')) {
        setShowEngineMenu(false);
      }
      if (showHistory && !e.target.closest('.search-history-wrapper')) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEngineMenu, showHistory]);

  // 紧凑模式：只显示搜索栏
  if (compact) {
    return (
      <div className="search-section search-section-compact">
        <div className="search-history-wrapper">
          <form className="search-bar search-bar-large" onSubmit={handleSearch}>
            <div className="search-engine-select">
              <button
                type="button"
                className="search-engine-btn"
                onClick={() => setShowEngineMenu(!showEngineMenu)}
                title={`切换搜索引擎 (当前：${searchEngine.name})`}
              >
                {searchEngine.icon}
                <span className="se-name">{searchEngine.name}</span>
                <span className="se-arrow">▾</span>
              </button>
              {showEngineMenu && (
                <div className="search-engine-dropdown">
                  {SEARCH_ENGINES.map(se => (
                    <button
                      key={se.name}
                      type="button"
                      className={`se-dropdown-item ${se.name === searchEngine.name ? 'active' : ''}`}
                      onClick={() => {
                        onSearchEngineChange(se);
                        setShowEngineMenu(false);
                      }}
                    >
                      {se.icon} {se.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowHistory(searchHistory.length > 0 && e.target.value === '');
              }}
              onFocus={() => searchHistory.length > 0 && setShowHistory(true)}
              placeholder={`搜索... (Ctrl+K)`}
              className="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear"
                onClick={() => setSearchQuery('')}
                aria-label="清空搜索"
              >
                ✕
              </button>
            )}
            <button type="submit" className="btn-search">搜索</button>
          </form>
          
          {/* Search History */}
          {showHistory && searchHistory.length > 0 && (
            <div className="search-history-dropdown">
              <div className="history-header">
                <span className="history-title">📋 搜索历史</span>
                <button type="button" className="btn-clear-history" onClick={clearHistory}>
                  清空
                </button>
              </div>
              <div className="history-list">
                {searchHistory.map((query, index) => (
                  <button
                    key={index}
                    type="button"
                    className="history-item"
                    onClick={() => handleHistorySearch(query)}
                  >
                    <span className="history-icon">🕐</span>
                    <span className="history-text">{query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="search-engines-bar">
          {SEARCH_ENGINES.map(se => (
            <button
              key={se.name}
              className={`se-tab ${se.name === searchEngine.name ? 'active' : ''}`}
              onClick={() => onSearchEngineChange(se)}
            >
              {se.icon} {se.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 完整模式：显示搜索 + 快捷链接 + AI 工具
  return (
    <>
      {/* Search Bar */}
      <div className="search-section">
        <div className="search-history-wrapper">
          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-engine-select">
              <button
                type="button"
                className="search-engine-btn"
                onClick={() => setShowEngineMenu(!showEngineMenu)}
                title={`切换搜索引擎 (当前：${searchEngine.name})`}
              >
                {searchEngine.icon}
                <span className="se-name">{searchEngine.name}</span>
                <span className="se-arrow">▾</span>
              </button>
              {showEngineMenu && (
                <div className="search-engine-dropdown">
                  {SEARCH_ENGINES.map(se => (
                    <button
                      key={se.name}
                      type="button"
                      className={`se-dropdown-item ${se.name === searchEngine.name ? 'active' : ''}`}
                      onClick={() => {
                        onSearchEngineChange(se);
                        setShowEngineMenu(false);
                      }}
                    >
                      {se.icon} {se.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowHistory(searchHistory.length > 0 && e.target.value === '');
              }}
              onFocus={() => searchHistory.length > 0 && setShowHistory(true)}
              placeholder={`搜索... (Ctrl+K)`}
              className="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear"
                onClick={() => setSearchQuery('')}
                aria-label="清空搜索"
              >
                ✕
              </button>
            )}
            <button type="submit" className="btn-search">搜索</button>
          </form>
          
          {/* Search History */}
          {showHistory && searchHistory.length > 0 && (
            <div className="search-history-dropdown">
              <div className="history-header">
                <span className="history-title">📋 搜索历史</span>
                <button type="button" className="btn-clear-history" onClick={clearHistory}>
                  清空
                </button>
              </div>
              <div className="history-list">
                {searchHistory.map((query, index) => (
                  <button
                    key={index}
                    type="button"
                    className="history-item"
                    onClick={() => handleHistorySearch(query)}
                  >
                    <span className="history-icon">🕐</span>
                    <span className="history-text">{query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="search-engines-bar">
          {SEARCH_ENGINES.map(se => (
            <button
              key={se.name}
              className={`se-tab ${se.name === searchEngine.name ? 'active' : ''}`}
              onClick={() => onSearchEngineChange(se)}
            >
              {se.icon} {se.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="widget quick-links-widget">
        <div className="widget-header">
          <h3>⚡ 快捷链接</h3>
        </div>
        <div className="quick-links-grid">
          {QUICK_LINKS.map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="quick-link-item">
              <span className="ql-icon">{link.icon}</span>
              <span className="ql-name">{link.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* AI Tools */}
      <div className="widget ai-tools-widget">
        <div className="widget-header">
          <h3>🤖 AI 工具</h3>
        </div>
        <div className="ai-tools-grid">
          {AI_TOOLS.map((tool, i) => (
            <a key={i} href={tool.url} target="_blank" rel="noopener noreferrer" className="ai-tool-card">
              <span className="ai-tool-icon">{tool.icon}</span>
              <div className="ai-tool-info">
                <span className="ai-tool-name">{tool.name}</span>
                <span className="ai-tool-desc">{tool.desc}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

export { SEARCH_ENGINES };
