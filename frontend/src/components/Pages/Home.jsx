import { useRef, useState, useEffect, lazy, Suspense } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useScript } from '../../context/ScriptContext.jsx';
import useStore from '../../store/client/useStore';

import Header from '../Elements/Header/Header';
import ClientOnly from '../Elements/Map/ClientOnly';
import PageHead from '../Elements/PageHead';
import BottomSheet from '../UI/BottomSheet';
import HomeSheetContent from '../Elements/HomeSheetContent';

const Map = lazy(() => import('../Elements/Map/Map'));

const MapFallback = () => (
    <div className="w-full h-full flex items-center justify-center dark:bg-white/5 bg-black/5">
        <div className="w-8 h-8 rounded-full border-2 dark:border-white/20 border-black/20 border-t-transparent animate-spin" />
    </div>
);

const HOME_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'Koje su gradske autobuske linije u Zrenjaninu?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Zrenjanin ima više gradskih autobuskih linija kojima upravlja prevoznik NetBus. Sve linije, stanice i redove vožnje možete pregledati na ZR Bus mapi.',
            },
        },
        {
            '@type': 'Question',
            name: 'Gde je najbliža autobuska stanica?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Na ZR Bus mapi možete koristiti dugme "Lociraj me" da pronađete autobusku stanicu najbližu vašoj trenutnoj lokaciji.',
            },
        },
        {
            '@type': 'Question',
            name: 'Ko je prevoznik gradskog prevoza u Zrenjaninu (NetBus)?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Gradski prevoz u Zrenjaninu obavlja prevoznik NetBus. ZR Bus je neformalna aplikacija koja prikazuje podatke o linijama, stanicama i redovima vožnje.',
            },
        },
    ],
};

const Home = () => {
    const { theme } = useTheme();
    const { script } = useScript();
    const sheetSnap = useStore((state) => state.sheetSnap);
    const snapSheetTo = useStore((state) => state.snapSheetTo);

    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    useEffect(() => {
        if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    }, []);

    return (
        <>
            <PageHead
                title="ZR Bus — Gradski prevoz Zrenjanin: linije, stanice, red vožnje"
                description="Gradski prevoz u Zrenjaninu: interaktivna mapa autobuskih linija, najbliža stanica i red vožnje."
                canonical="/"
                jsonLd={HOME_JSON_LD}
            />
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
                    onSnapChange={snapSheetTo}
                    topOffset={headerHeight}
                >
                    <HomeSheetContent />
                </BottomSheet>

                <div className="flex-1 relative h-full">
                    <h1 className="sr-only">ZR Bus - Interaktivna mapa gradskih autobuskih linija u Zrenjaninu</h1>
                    <p className="absolute top-2 left-1/2 -translate-x-1/2 z-[900] pointer-events-none hidden md:block">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide backdrop-blur-xl dark:bg-white/10 bg-black/5 dark:border-white/15 border-black/10 border dark:text-white/70 text-gray-600 shadow">
                            ZR Bus — {script === 'cyrillic' ? 'Градски превоз Зрењанин' : 'Gradski prevoz Zrenjanin'}
                        </span>
                    </p>
                    <ClientOnly fallback={<MapFallback />}>
                        {() => (
                            <Suspense fallback={<MapFallback />}>
                                <Map />
                            </Suspense>
                        )}
                    </ClientOnly>
                </div>

                {sheetSnap !== 'peek' && (
                    <div
                        className="md:hidden fixed inset-0 z-[599]"
                        onClick={() => snapSheetTo('peek')}
                    />
                )}

                <div ref={headerRef} className="md:hidden absolute z-[1000] top-0 left-0 right-0">
                    <div className="m-1 backdrop-blur-xl dark:bg-white/10 bg-black/5 rounded-3xl dark:border-white/20 border-black/10 border shadow-2xl">
                        <Header />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
