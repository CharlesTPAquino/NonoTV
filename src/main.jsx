import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PlayerProvider } from './context/PlayerContext'
import { SourceProvider } from './context/SourceContext'
import { ThemeProvider } from './context/ThemeContext'
import { PodcastProvider } from './context/PodcastContext'
import ErrorBoundary from './components/UI/ErrorBoundary.jsx'

console.log('[NonoTV] Iniciando app...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <SourceProvider>
          <PlayerProvider>
            <PodcastProvider>
              <App />
            </PodcastProvider>
          </PlayerProvider>
        </SourceProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
