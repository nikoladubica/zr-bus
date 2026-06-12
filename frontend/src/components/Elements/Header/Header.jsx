import { useCallback, useState } from 'react';
import { useLocation, NavLink } from 'react-router';
import useStore from '../../../store/client/useStore';
import { useTheme } from '../../../context/ThemeContext.jsx';

import SettingsPopover from './SettingsPopover';
import logo from '../../../assets/zrbus_logo.svg';
import logoBlack from '../../../assets/zrbus_logo-black.svg';
import locateWhite from '../../../assets/icons/locate/locate-white.svg';
import locateBlack from '../../../assets/icons/locate/locate-black.svg';

const Header = () => {
    const location = useLocation();
    const { theme } = useTheme();
    const [settingsOpen, setSettingsOpen] = useState(false);

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
                <img src={theme === 'dark' ? logo : logoBlack} alt="ZRBus logo" height={36} width={100} />
            </NavLink>

            <div className="flex items-center gap-1">
                <div className="relative">
                    <button
                        className="w-9 h-9 flex items-center justify-center rounded-xl dark:hover:bg-white/10 hover:bg-black/5 transition-colors dark:text-white text-gray-800"
                        onClick={() => setSettingsOpen((o) => !o)}
                    >
                        ⚙
                    </button>

                    {settingsOpen && (
                        <SettingsPopover onClose={() => setSettingsOpen(false)} />
                    )}
                </div>

                {location.pathname === '/' && (
                    <button
                        className="relative w-9 h-9 flex items-center justify-center rounded-xl dark:hover:bg-white/10 hover:bg-black/5 transition-colors"
                        onClick={locateMeHandler}
                    >
                        <img src={theme === 'dark' ? locateWhite : locateBlack} className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' alt="Locate" height={16} width={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Header;
