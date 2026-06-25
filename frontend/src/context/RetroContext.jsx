import { createContext, useContext, useState, useEffect } from 'react';

const RetroContext = createContext(false);

export const RetroProvider = ({ children }) => {
    const [retro, setRetro] = useState(
        () => (typeof localStorage !== 'undefined' ? localStorage.getItem('retro') === 'true' : false),
    );

    useEffect(() => {
        document.documentElement.classList.toggle('retro', retro);
    }, [retro]);

    const toggleRetro = () =>
        setRetro((r) => {
            const next = !r;
            if (typeof localStorage !== 'undefined') localStorage.setItem('retro', String(next));
            return next;
        });

    return (
        <RetroContext.Provider value={{ retro, toggleRetro }}>
            {children}
        </RetroContext.Provider>
    );
};

export const useRetro = () => useContext(RetroContext);

export default RetroContext;
