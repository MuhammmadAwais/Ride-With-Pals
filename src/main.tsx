import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.tsx';
import { store, persistor } from './app/store';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { setupApiStore } from './api/backendApi';

setupApiStore(store);

const root = document.getElementById('root')!;

createRoot(root).render(
  <StrictMode>
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
  </StrictMode>,
);

// Loading screen is dismissed by LandingPage after first render
// to prevent any flash of unstyled/unloaded content.
