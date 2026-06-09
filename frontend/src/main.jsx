import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router";

import { ScriptProvider } from './context/ScriptContext.jsx';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <ScriptProvider>
                <App />
            </ScriptProvider>
        </BrowserRouter>
    </StrictMode>,
);
