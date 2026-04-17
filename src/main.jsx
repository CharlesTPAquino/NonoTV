import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PlayerProvider } from './context/PlayerContext'
import { SourceProvider } from './context/SourceContext'
import { ThemeProvider } from './context/ThemeContext'
import { PodcastProvider } from './context/PodcastContext'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/UI/ErrorBoundary.jsx'
import { detectDevice } from './hooks/useDevice.js'

// Aplicar classe TV antes de qualquer render — evita flash de layout errado
const { isTV } = detectDevice();
if (isTV) {
  document.documentElement.classList.add('tv-mode');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SourceProvider>
            <PlayerProvider>
              <PodcastProvider>
                <App />
              </PodcastProvider>
            </PlayerProvider>
          </SourceProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)