import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TimeProvider } from './hooks/useTime.jsx'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TimeProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </TimeProvider>
  </StrictMode>,
)
