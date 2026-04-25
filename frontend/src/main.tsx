import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { useTheme } from './store/theme'

const savedTheme = useTheme.getState().theme;
if (savedTheme && savedTheme !== 'default') {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

const input = document.createElement('input');
input.type = 'date';
const testDate = new Date('2026-01-15');
const localeTest = testDate.toLocaleDateString('es-ES');
if (!localeTest.includes('15')) {
  document.documentElement.lang = 'es-ES';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
