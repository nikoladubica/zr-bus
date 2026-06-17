import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ScriptProvider } from './context/ScriptContext.jsx';
import { SSGDataProvider } from './context/SSGDataContext.jsx';
import App from './App.jsx';

export async function render(url, ssgData = null) {
    const pathname = new URL(url).pathname;

    const html = renderToString(
        <HelmetProvider>
            <SSGDataProvider data={ssgData}>
                <StaticRouter location={pathname}>
                    <ThemeProvider>
                        <ScriptProvider>
                            <App />
                        </ScriptProvider>
                    </ThemeProvider>
                </StaticRouter>
            </SSGDataProvider>
        </HelmetProvider>,
    );

    return { html };
}
