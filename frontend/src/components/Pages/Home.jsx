import { useState } from 'react';

import { useTheme } from '../../context/ThemeContext.jsx';
import { useScript } from '../../context/ScriptContext.jsx';
import useStore from '../../store/client/useStore';

import Header from '../Elements/Header/Header';
import MapLineSwitcher from '../Elements/Map/MapLineSwitcher';
import Map from '../Elements/Map/Map';
import BottomSheet from '../UI/BottomSheet';

const Home = () => {
    const { theme } = useTheme();
    const { script } = useScript();
    const line = useStore((state) => state.line);
    const [sheetSnap, setSheetSnap] = useState('peek');

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
            <BottomSheet
                header={<Header />}
                snapTo={sheetSnap}
                onSnapChange={setSheetSnap}
            >
                <div className="p-4 flex flex-col gap-3">
                    <MapLineSwitcher />
                </div>
            </BottomSheet>

            <div className="flex-1 relative h-full">
                <Map />
            </div>

            <div className="md:hidden absolute z-[1000] top-0 left-0 right-0">
                <div className="m-1 backdrop-blur-xl dark:bg-white/10 bg-black/5 rounded-3xl dark:border-white/20 border-black/10 border shadow-2xl">
                    <Header />
                </div>
            </div>
        </div>
    );
};

export default Home;
