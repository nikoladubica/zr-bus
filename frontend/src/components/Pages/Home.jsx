import { useTheme } from '../../context/ThemeContext.jsx';
import { useScript } from '../../context/ScriptContext.jsx';
import useStore from '../../store/client/useStore';

import Header from '../Elements/Header/Header';
import MapLineSwitcher from '../Elements/Map/MapLineSwitcher';
import Map from '../Elements/Map/Map';

const Home = () => {
    const { theme } = useTheme();
    const { script } = useScript();
    const line = useStore((state) => state.line);

    return (
        <div
            className={`flex h-screen w-screen overflow-hidden relative ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            style={{
                background:
                    theme === 'dark'
                        ? 'linear-gradient(135deg, oklch(27.8% 0.033 256.848) 0%, oklch(22% 0.04 260) 50%, oklch(18% 0.05 270) 100%)'
                        : 'linear-gradient(135deg, oklch(96% 0.01 256) 0%, oklch(93% 0.015 260) 50%, oklch(90% 0.02 270) 100%)',
            }}
        >
            <aside className="hidden md:flex flex-col w-[380px] shrink-0 h-full z-[500] relative dark:bg-black/50 bg-white/70 backdrop-blur-2xl border-r dark:border-white/10 border-black/10">
                <Header />
                <div className="p-4">
                    <MapLineSwitcher />
                </div>
                {line && (
                    <p className="px-4 text-sm font-bold text-left dark:text-white text-gray-900">
                        [Linija {line?.number}] {script === 'latin' ? line?.lat_name : line?.cyr_name}
                    </p>
                )}
            </aside>

            <div className="flex-1 relative h-full">
                <Map />
            </div>

            <div className="md:hidden absolute z-[1000] top-0 left-0 right-0 p-3">
                <Header />
            </div>

            <div className="md:hidden absolute z-[1000] top-[88px] left-0 right-0 px-3">
                <MapLineSwitcher />
            </div>
        </div>
    );
};

export default Home;
