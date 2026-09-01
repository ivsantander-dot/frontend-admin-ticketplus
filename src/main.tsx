import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { msalConfig, isAuthConfigured } from './auth/msalConfig'
import './index.css'
import App from './App.tsx'

const bootstrapMSAL = async () => {
  // Caso A: Si la configuración no está completa, renderizar sin MsalProvider
  if (!isAuthConfigured()) {
    const root = createRoot(document.getElementById('root')!)
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    return
  }

  // Caso B: Si hay IDs válidos, inicializar MSAL
  const msalInstance = new PublicClientApplication(msalConfig)

  try {
    // Orden crítico: initialize → handleRedirectPromise → render
    await msalInstance.initialize()
    await msalInstance.handleRedirectPromise()

    const root = createRoot(document.getElementById('root')!)
    root.render(
      <StrictMode>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </StrictMode>,
    )
  } catch (error) {
    console.error('Error initializing MSAL:', error)
    const root = createRoot(document.getElementById('root')!)
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  }
}

bootstrapMSAL()
