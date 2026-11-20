import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope/wght.css'
import '@fontsource-variable/inter/wght.css'
import './index.css'
import { App } from './App'
import { AppProvider } from './context/AppContext'

createRoot(document.getElementById('root')!).render(<React.StrictMode><AppProvider><App /></AppProvider></React.StrictMode>)
