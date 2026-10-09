import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import './index.css'
import App from './App.jsx'
import { aplicarTema, lerTema } from './utils/tema'

// Antes do primeiro render, pra não piscar o tema errado.
aplicarTema(lerTema())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
