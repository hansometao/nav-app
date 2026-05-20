import { Component } from 'react';

// 安全获取环境变量
const isDevelopment = (() => {
  try {
    return typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
  } catch {
    return false;
  }
})();

/**
 * 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，防止整个应用崩溃
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一渲染周期显示降级 UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息（可集成错误上报服务）
    console.error('🚨 Error caught by boundary:', error);
    console.error('📋 Component stack:', errorInfo.componentStack);

    // 保存错误信息供调试
    this.setState({ errorInfo });

    // 可选：发送到错误监控服务
    // sendErrorToMonitoring(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">😕</div>
            <h2>出错了</h2>
            <p className="error-message">应用遇到了一些问题，请尝试刷新页面</p>

            {isDevelopment && this.state.error && (
              <details className="error-details">
                <summary>错误详情（仅开发环境）</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && <pre>{this.state.errorInfo.componentStack}</pre>}
              </details>
            )}

            <div className="error-actions">
              <button className="btn-reset" onClick={this.handleReset}>
                返回主页
              </button>
              <button className="btn-reload" onClick={this.handleReload}>
                刷新页面
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
