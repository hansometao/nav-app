import { Icon } from '../utils/icons';

export default function ErrorMessage({ 
  message, 
  onRetry, 
  type = 'error',
  retryText = '重试'
}) {
  const icons = {
    error: 'alertCircle',
    warning: 'alertTriangle',
    info: 'info'
  };

  const titles = {
    error: '出错了',
    warning: '注意',
    info: '提示'
  };

  return (
    <div className={`error-message error-${type}`}>
      <div className="error-icon">
        <Icon name={icons[type]} size={24} />
      </div>
      <div className="error-content">
        <h4 className="error-title">{titles[type]}</h4>
        <p className="error-text">{message}</p>
        {onRetry && (
          <button className="error-retry-btn" onClick={onRetry}>
            <Icon name="refreshCw" size={14} />
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
}