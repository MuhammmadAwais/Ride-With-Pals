import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { HelmetProvider } from 'react-helmet-async';
import { I18nProvider } from '@lingui/react';
import './index.css';
import App from './App.tsx';
import { store, persistor } from './app/store';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { setupApiStore } from './api/backendApi';
import { i18n, dynamicActivate, type Locale } from './lib/i18n';

setupApiStore(store);

// Activate the persisted locale before first render
const savedLocale = (localStorage.getItem('rwp-locale') as Locale) || 'en';
dynamicActivate(savedLocale);

const root = document.getElementById('root')!;

createRoot(root).render(
  <StrictMode>
    {/* LinguiJS i18n provider — wraps everything so all components can translate */}
    <I18nProvider i18n={i18n}>
      {/* Redux store + persistence */}
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {/* Custom theme context (replaces next-themes) */}
          <ThemeProvider>
            {/* react-helmet-async for per-page <title> tags */}
            <HelmetProvider>
              <App />
            </HelmetProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </I18nProvider>
  </StrictMode>,
);

// Loading screen is dismissed by LandingPage after first render
// to prevent any flash of unstyled/unloaded content.
