import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PlayerProvider } from './context/PlayerContext'
import { SourceProvider } from './context/SourceContext'
import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <SourceProvider>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </SourceProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
