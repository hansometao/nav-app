const faviconCache = new Map();

// 更好的favicon服务优先级
const FAVICON_SERVICES = [
  (domain) => `https://api.faviconkit.com/${domain}/64`,
  (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
  (domain) => `https://icon.horse/icon/${domain}`,
  (domain) => `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  (domain) => `https://f1.allesedv.com/64/${domain}`,
];

export async function getFavicon(url) {
  if (faviconCache.has(url)) {
    return faviconCache.get(url);
  }

  try {
    const domain = new URL(url).origin.replace(/^https?:\/\//, '');
    
    // 尝试多个favicon服务，并行快速获取
    let bestFavicon = null;
    
    for (const service of FAVICON_SERVICES) {
      try {
        const faviconUrl = service(domain);
        const isWorking = await testImageLoad(faviconUrl);
        if (isWorking) {
          bestFavicon = faviconUrl;
          break; // 找到第一个可用的就用它
        }
      } catch (e) {
        continue;
      }
    }
    
    if (bestFavicon) {
      faviconCache.set(url, bestFavicon);
      return bestFavicon;
    }
    
    const fallback = generateFallbackAvatar(url);
    faviconCache.set(url, fallback);
    return fallback;
  } catch (e) {
    const fallback = generateFallbackAvatar(url);
    faviconCache.set(url, fallback);
    return fallback;
  }
}

async function testImageLoad(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (img.naturalWidth > 1 && img.naturalHeight > 1) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
    img.onerror = () => resolve(false);
    img.src = url;
    setTimeout(() => resolve(false), 1500); // 更快的超时
  });
}

// 美观的渐变配色方案
const GRADIENTS = [
  { from: '#667eea', to: '#764ba2' }, // 紫色渐变
  { from: '#f093fb', to: '#f5576c' }, // 粉红渐变
  { from: '#4facfe', to: '#00f2fe' }, // 青色渐变
  { from: '#43e97b', to: '#38f9d7' }, // 绿色渐变
  { from: '#fa709a', to: '#fee140' }, // 橙粉渐变
  { from: '#a18cd1', to: '#fbc2eb' }, // 淡紫渐变
  { from: '#ff9a9e', to: '#fecfef' }, // 淡红渐变
  { from: '#a1c4fd', to: '#c2e9fb' }, // 蓝青渐变
  { from: '#d4fc79', to: '#96e6a1' }, // 黄绿渐变
  { from: '#84fab0', to: '#8fd3f4' }, // 青绿渐变
  { from: '#fccb90', to: '#d57eeb' }, // 粉紫渐变
  { from: '#e0c3fc', to: '#8ec5fc' }, // 紫蓝渐变
  { from: '#f6d365', to: '#fda085' }, // 橙黄渐变
  { from: '#a8edea', to: '#fed6e3' }, // 浅粉渐变
  { from: '#d299c2', to: '#fef9d7' }, // 黄紫渐变
  { from: '#fddb92', to: '#d1fdff' }, // 黄蓝渐变
  { from: '#9890e3', to: '#b1f4cf' }, // 紫绿渐变
  { from: '#f0a5a5', to: '#f8cdda' }, // 红粉渐变
];

// 精美的备用图标生成
function generateFallbackAvatar(url) {
  let domain;
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = url;
  }
  
  const cleanDomain = domain.replace('www.', '').split('.')[0] || domain;
  const firstChar = cleanDomain.charAt(0).toUpperCase();
  
  // 使用域名生成确定性的索引
  const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradientIndex = hash % GRADIENTS.length;
  const gradient = GRADIENTS[gradientIndex];
  
  const svg = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient.from};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradient.to};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.15)"/>
        </filter>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#grad)" filter="url(#shadow)"/>
      <circle cx="32" cy="32" r="28" fill="url(#grad)" opacity="0.9"/>
      <text x="32" y="40" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="white" text-anchor="middle" style="text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${firstChar}</text>
    </svg>
  `)}`;
  
  return svg;
}

export function clearFaviconCache() {
  faviconCache.clear();
}
