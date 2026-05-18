import { useState, useRef, useCallback } from 'react';
import { useTheme, THEMES } from '../hooks/useTheme.jsx';
import { exportAllData, importData, clearAllData } from '../utils/dataManagement';

export default function SettingsPanel({ onClose }) {
  const { theme, toggleTheme, setLightTheme, setDarkTheme } = useTheme();
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = useCallback(() => {
    try {
      exportAllData();
      setImportStatus({ type: 'success', message: '导出成功！' });
      setTimeout(() => setImportStatus(null), 3000);
    } catch (e) {
      setImportStatus({ type: 'error', message: '导出失败：' + e.message });
    }
  }, []);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importData(file);
      setImportStatus({ type: 'success', message: result.message });
      setTimeout(() => {
        setImportStatus(null);
        window.location.reload();
      }, 1500);
    } catch (e) {
      setImportStatus({ type: 'error', message: e.message });
      setTimeout(() => setImportStatus(null), 5000);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClearData = useCallback(() => {
    if (confirm('⚠️ 确定要清除所有数据吗？\n\n这将删除：\n- 所有书签\n- 待办事项\n- 备忘录\n- 倒计时\n- 日历事件\n- 布局设置\n\n此操作不可恢复！')) {
      if (confirm('再次确认：所有数据将被永久删除！')) {
        clearAllData();
      }
    }
  }, []);

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="settings-header">
          <h2>⚙️ 设置</h2>
          <button className="settings-close" onClick={onClose} aria-label="关闭设置">✕</button>
        </div>

        <div className="settings-content">
          <section className="settings-section">
            <h3>🎨 主题设置</h3>
            <div className="theme-options">
              <button 
                className={`theme-option ${theme === THEMES.DARK ? 'active' : ''}`}
                onClick={() => setDarkTheme()}
                aria-pressed={theme === THEMES.DARK}
              >
                <span className="theme-icon">🌙</span>
                <span className="theme-label">深色模式</span>
              </button>
              <button 
                className={`theme-option ${theme === THEMES.LIGHT ? 'active' : ''}`}
                onClick={() => setLightTheme()}
                aria-pressed={theme === THEMES.LIGHT}
              >
                <span className="theme-icon">☀️</span>
                <span className="theme-label">亮色模式</span>
              </button>
            </div>
          </section>

          <section className="settings-section">
            <h3>💾 数据管理</h3>
            <p className="settings-hint">备份或恢复您的所有数据</p>
            
            <div className="data-actions">
              <button className="data-action-btn export-btn" onClick={handleExport}>
                <span>📤</span> 导出数据
              </button>
              <button className="data-action-btn import-btn" onClick={handleImportClick}>
                <span>📥</span> 导入数据
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {importStatus && (
              <div className={`import-status ${importStatus.type}`}>
                {importStatus.message}
              </div>
            )}
          </section>

          <section className="settings-section danger-zone">
            <h3>⚠️ 危险区域</h3>
            <p className="settings-hint">清除所有本地存储的数据</p>
            <button className="data-action-btn danger-btn" onClick={handleClearData}>
              <span>🗑️</span> 清除所有数据
            </button>
          </section>
        </div>

        <div className="settings-footer">
          <p>皮皮导航 v1.0</p>
        </div>
      </div>
    </div>
  );
}
