import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // ПРОВЕРЬ ЭТУ СТРОКУ
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* ПРОВЕРЬ ЭТУ ОБЕРТКУ */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)