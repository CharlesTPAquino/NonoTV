import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PlayerProvider } from './context/PlayerContext'
import { SourceProvider } from './context/SourceContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SourceProvider>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </SourceProvider>
  </React.StrictMode>,
)
