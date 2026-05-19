/**
 * API 错误处理工具
 * 提供统一的错误处理和用户友好的错误消息
 */

// 错误类型定义
export const ErrorTypes = {
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  SERVER: 'server',
  CLIENT: 'client',
  UNKNOWN: 'unknown'
};

// 错误消息映射
const errorMessages = {
  [ErrorTypes.NETWORK]: '网络连接失败，请检查网络设置',
  [ErrorTypes.TIMEOUT]: '请求超时，请稍后重试',
  [ErrorTypes.SERVER]: '服务器暂时不可用，请稍后重试',
  [ErrorTypes.CLIENT]: '请求参数错误',
  [ErrorTypes.UNKNOWN]: '发生未知错误，请稍后重试'
};

/**
 * 分析错误类型
 * @param {Error} error - 错误对象
 * @returns {string} - 错误类型
 */
export function analyzeError(error) {
  if (!error) return ErrorTypes.UNKNOWN;
  
  // 网络错误
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return ErrorTypes.NETWORK;
  }
  
  // 超时错误
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return ErrorTypes.TIMEOUT;
  }
  
  // HTTP 状态码错误
  if (error.status) {
    if (error.status >= 500) return ErrorTypes.SERVER;
    if (error.status >= 400) return ErrorTypes.CLIENT;
  }
  
  return ErrorTypes.UNKNOWN;
}

/**
 * 获取用户友好的错误消息
 * @param {Error} error - 错误对象
 * @param {string} fallbackMessage - 备用消息
 * @returns {string} - 错误消息
 */
export function getErrorMessage(error, fallbackMessage) {
  const type = analyzeError(error);
  return fallbackMessage || errorMessages[type] || errorMessages[ErrorTypes.UNKNOWN];
}

/**
 * 创建带超时的 fetch 请求
 * @param {string} url - 请求 URL
 * @param {Object} options - fetch 选项
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise} - fetch Promise
 */
export function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  return fetch(url, {
    ...options,
    signal: controller.signal
  }).finally(() => clearTimeout(timeoutId));
}

/**
 * 重试机制包装器
 * @param {Function} fn - 要执行的函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} delay - 重试延迟（毫秒）
 * @returns {Promise} - 执行结果
 */
export async function withRetry(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 如果是客户端错误，不重试
      if (analyzeError(error) === ErrorTypes.CLIENT) {
        throw error;
      }
      
      // 最后一次尝试，抛出错误
      if (i === maxRetries) {
        throw error;
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  
  throw lastError;
}

/**
 * API 请求包装器
 * @param {string} url - 请求 URL
 * @param {Object} options - fetch 选项
 * @returns {Promise} - 响应数据
 */
export async function apiRequest(url, options = {}) {
  try {
    const response = await fetchWithTimeout(url, options);
    
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}