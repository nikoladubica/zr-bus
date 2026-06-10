import { useCallback } from 'react';
import { useLocation, NavLink } from 'react-router';
import useStore from '../../../store/client/useStore';
import { useScript } from '../../../context/ScriptContext.jsx';
import { useTheme } from '../../../context/ThemeContext.jsx';

import logo from '../../../assets/zrbus_logo.svg';
import locate from '../../../assets/icons/locate/locate-white.svg';

const Header = () => {
    let location = useLocation();
    const { script, toggleScript } = useScript();
    const { theme, toggleTheme } = useTheme();

    const getCurrentLocationWithRecenter = useStore(
        (state) => state.getCurrentLocationWithRecenter,
    );

    const locateMeHandler = useCallback(() => {
        getCurrentLocationWithRecenter();

        document
            .querySelector('.MapContainer')
            .scrollIntoView({ behavior: 'smooth' });
    }, [getCurrentLocationWithRecenter]);

    return (
        <div className="flex items-center justify-between px-5 h-23">
            <NavLink to="/">
                <img src={logo} alt="ZRBus logo" height={36} width={100} />
            </NavLink>

            <div className="flex items-center gap-1">
                <button
                    className="w-9 h-9 flex items-center justify-center rounded-xl dark:hover:bg-white/10 hover:bg-black/5 transition-colors dark:text-white text-gray-800"
                    onClick={toggleTheme}
                >
                    {theme === 'dark' ? '☀' : '☾'}
                </button>

                <button
                    className="h-9 px-2.5 flex items-center justify-center rounded-xl dark:hover:bg-white/10 hover:bg-black/5 transition-colors dark:text-white text-gray-800 text-sm font-medium"
                    onClick={toggleScript}
                >
                    {script === 'latin' ? 'Ћир' : 'Lat'}
                </button>

                {location.pathname === '/' && (
                    <button
                        className="w-9 h-9 flex items-center justify-center rounded-xl dark:hover:bg-white/10 hover:bg-black/5 transition-colors"
                        onClick={locateMeHandler}
                    >
                        <img src={locate} alt="Locate" height={16} width={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Header;
