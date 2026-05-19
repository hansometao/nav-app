import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TimeProvider } from './hooks/useTime.jsx'
import { ThemeProvider } from './hooks/useTheme.jsx'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <TimeProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </TimeProvider>
    </ThemeProvider>
  </StrictMode>,
)
