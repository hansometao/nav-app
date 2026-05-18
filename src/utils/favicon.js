const faviconCache = new Map();

export async function getFavicon(url) {
  if (faviconCache.has(url)) {
    return faviconCache.get(url);
  }

  try {
    const domain = new URL(url).origin;
    
    const googleFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    if (await testImageLoad(googleFavicon)) {
      faviconCache.set(url, googleFavicon);
      return googleFavicon;
    }
    
    const ddgFavicon = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    if (await testImageLoad(ddgFavicon)) {
      faviconCache.set(url, ddgFavicon);
      return ddgFavicon;
    }
    
    const faviconIm = `https://favicon.im/${domain}`;
    if (await testImageLoad(faviconIm)) {
      faviconCache.set(url, faviconIm);
      return faviconIm;
    }
    
    const fallback = generateFallbackAvatar(domain);
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
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    setTimeout(() => resolve(false), 3000);
  });
}

function generateFallbackAvatar(url) {
  let domain;
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = url;
  }
  
  const firstChar = domain.charAt(0).toUpperCase();
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B500', '#00CED1', '#FF69B4', '#32CD32', '#FF4500'
  ];
  
  const colorIndex = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const color = colors[colorIndex];
  
  const svg = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="12" fill="${color}"/>
      <text x="32" y="42" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">${firstChar}</text>
    </svg>
  `)}`;
  
  return svg;
}

export function clearFaviconCache() {
  faviconCache.clear();
}
