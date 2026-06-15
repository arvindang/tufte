import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TufteApp from './TufteApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TufteApp />
  </StrictMode>,
)
