import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'sonner'
import { TooltipProvider } from './components/ui/tooltip.tsx'
import { UserContextProvider } from '../Context/UserContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserContextProvider>
    <TooltipProvider>
    <App />
    <Toaster/>
    </TooltipProvider>
    </UserContextProvider>
  </StrictMode>,
)
