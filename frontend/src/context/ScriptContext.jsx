import { createContext, useContext, useState } from 'react';

const ScriptContext = createContext('latin');

export const ScriptProvider = ({ children }) => {
    const [script, setScript] = useState(
        () => localStorage.getItem('script') || 'latin',
    );

    const toggleScript = () =>
        setScript((s) => {
            const next = s === 'latin' ? 'cyrillic' : 'latin';
            localStorage.setItem('script', next);
            return next;
        });

    return (
        <ScriptContext.Provider value={{ script, toggleScript }}>
            {children}
        </ScriptContext.Provider>
    );
};

export const useScript = () => useContext(ScriptContext);

export default ScriptContext;
