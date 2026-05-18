/**
 * 输入验证和 XSS 防护工具函数
 */

/**
 * 验证 URL 是否合法
 * @param {string} string - 待验证的 URL 字符串
 * @returns {boolean} - 是否为有效的 HTTP/HTTPS URL
 */
export const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

/**
 * 清理 URL，添加协议前缀
 * @param {string} url - 原始 URL
 * @returns {string} - 标准化后的 URL
 */
export const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  
  const trimmed = url.trim();
  if (!trimmed) return '';
  
  // 如果已有协议前缀，直接返回
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // 添加 HTTPS 前缀
  return `https://${trimmed}`;
};

/**
 * 清理 HTML 特殊字符，防止 XSS
 * @param {string} str - 待清理的字符串
 * @returns {string} - 清理后的字符串
 */
export const sanitizeHtml = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str.replace(/[<>\"'&]/g, (char) => {
    const entities = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '&': '&amp;'
    };
    return entities[char] || char;
  });
};

/**
 * 清理文本输入（允许中文、英文、数字、常见标点）
 * @param {string} str - 待清理的字符串
 * @returns {string} - 清理后的字符串
 */
export const sanitizeText = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  // 移除可能的 HTML 标签和脚本
  return str.replace(/<[^>]*>/g, '').trim();
};

/**
 * 验证并清理书签数据
 * @param {Object} bookmark - 原始书签数据
 * @returns {Object|null} - 验证通过返回清理后的数据，失败返回 null
 */
export const validateBookmark = (bookmark) => {
  if (!bookmark || typeof bookmark !== 'object') return null;
  
  const { name, url, icon, category } = bookmark;
  
  // 验证名称
  if (!name || typeof name !== 'string' || !name.trim()) {
    return null;
  }
  
  // 验证 URL
  const normalizedUrl = normalizeUrl(url);
  if (!isValidUrl(normalizedUrl)) {
    return null;
  }
  
  return {
    name: sanitizeText(name),
    url: normalizedUrl,
    icon: icon || '🔖',
    category: sanitizeText(category) || '默认'
  };
};

/**
 * 生成安全的 HTML 属性值
 * @param {string} str - 原始字符串
 * @returns {string} - 转义后的字符串
 */
export const escapeHtmlAttr = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
};
