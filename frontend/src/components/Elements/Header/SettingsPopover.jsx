import { useEffect, useRef } from 'react';
import { useTheme } from '../../../context/ThemeContext.jsx';
import { useScript } from '../../../context/ScriptContext.jsx';

const SettingsPopover = ({ onClose }) => {
    const { theme, toggleTheme } = useTheme();
    const { script, toggleScript } = useScript();
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="absolute right-0 top-full mt-2 z-50 min-w-[180px] backdrop-blur-xl dark:bg-white/10 bg-white/80 rounded-2xl dark:border-white/20 border-black/10 border shadow-2xl"
        >
            <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm dark:text-white text-gray-800">
                    {theme === 'dark' ? 'Tamna tema' : 'Svetla tema'}
                </span>
                <button
                    className="w-9 h-9 flex items-center justify-center rounded-xl dark:hover:bg-white/10 hover:bg-black/5 transition-colors dark:text-white text-gray-800"
                    onClick={toggleTheme}
                >
                    {theme === 'dark' ? '☀' : '☾'}
                </button>
            </div>

            <div className="border-t dark:border-white/10 border-black/10" />

            <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm dark:text-white text-gray-800">
                    {script === 'latin' ? 'Latinica' : 'Ćirilica'}
                </span>
                <button
                    className="h-9 px-2.5 flex items-center justify-center rounded-xl dark:hover:bg-white/10 hover:bg-black/5 transition-colors dark:text-white text-gray-800 text-sm font-medium"
                    onClick={toggleScript}
                >
                    {script === 'latin' ? 'Ћир' : 'Lat'}
                </button>
            </div>
        </div>
    );
};

export default SettingsPopover;
