import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';

import { ThemeProvider } from './context/ThemeContext.jsx';
import { RetroProvider } from './context/RetroContext.jsx';
import { ScriptProvider } from './context/ScriptContext.jsx';
import './index.css';
import App from './App.jsx';

const container = document.getElementById('root');
const isSSR = container.hasAttribute('data-server-rendered');

const app = (
    <StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <ThemeProvider>
                    <RetroProvider>
                        <ScriptProvider>
                            <App />
                        </ScriptProvider>
                    </RetroProvider>
                </ThemeProvider>
            </BrowserRouter>
        </HelmetProvider>
    </StrictMode>
);

if (isSSR) {
    hydrateRoot(container, app);
} else {
    createRoot(container).render(app);
}
