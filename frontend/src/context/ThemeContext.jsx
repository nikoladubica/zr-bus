import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext('dark');

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(
        () => (typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null) || 'dark',
    );

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const toggleTheme = () =>
        setTheme((t) => {
            const next = t === 'dark' ? 'light' : 'dark';
            if (typeof localStorage !== 'undefined') localStorage.setItem('theme', next);
            return next;
        });

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
