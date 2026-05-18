import { STORAGE_KEYS } from '../config/storage';

export const STORAGE_KEYS_TO_EXPORT = [
  STORAGE_KEYS.TODO,
  STORAGE_KEYS.MEMO,
  STORAGE_KEYS.BOOKMARKS,
  STORAGE_KEYS.COUNTDOWN,
  STORAGE_KEYS.CALENDAR,
  STORAGE_KEYS.LAYOUT,
  STORAGE_KEYS.EDIT_MODE,
];

export function exportAllData() {
  const data = {};
  
  for (const key of STORAGE_KEYS_TO_EXPORT) {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        data[key] = JSON.parse(value);
      }
    } catch (e) {
      console.warn(`Failed to export ${key}:`, e);
    }
  }
  
  const exportData = {
    version: '1.0',
    exportTime: new Date().toISOString(),
    appName: 'nav-app',
    data: data,
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nav-app-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return true;
}

export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const importData = JSON.parse(content);
        
        if (!importData.appName || importData.appName !== 'nav-app') {
          reject(new Error('无效的备份文件格式'));
          return;
        }
        
        if (!importData.data || typeof importData.data !== 'object') {
          reject(new Error('备份数据格式错误'));
          return;
        }
        
        const keys = Object.keys(importData.data);
        let importedCount = 0;
        
        for (const key of keys) {
          try {
            if (STORAGE_KEYS_TO_EXPORT.includes(key)) {
              localStorage.setItem(key, JSON.stringify(importData.data[key]));
              importedCount++;
            }
          } catch (e) {
            console.warn(`Failed to import ${key}:`, e);
          }
        }
        
        resolve({ 
          success: true, 
          count: importedCount,
          message: `成功导入 ${importedCount} 项数据` 
        });
      } catch (e) {
        reject(new Error('文件解析失败：' + e.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    reader.readAsText(file);
  });
}

export function clearAllData() {
  if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
    for (const key of STORAGE_KEYS_TO_EXPORT) {
      localStorage.removeItem(key);
    }
    window.location.reload();
  }
}
