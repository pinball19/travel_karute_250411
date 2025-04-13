import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import initializeLogger from './utils/initLogger'

// アプリケーション起動時にロガーを初期化
initializeLogger();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
