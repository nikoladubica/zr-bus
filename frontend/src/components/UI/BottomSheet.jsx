import { useState, useRef, useEffect, useMemo } from 'react';
import { useRetro } from '../../context/RetroContext.jsx';

const SHEET_HEIGHT_VH = 92;

const computeFullSnap = (topOffsetPx) => {
    if (!topOffsetPx || !window.innerHeight) return 0;
    return Math.max(0, Math.ceil((topOffsetPx / window.innerHeight) * 100) - (100 - SHEET_HEIGHT_VH));
};

const BottomSheet = ({ children, header, snapTo = 'peek', onSnapChange, topOffset = 0 }) => {
    const { retro } = useRetro();
    const [fullSnap, setFullSnap] = useState(() => computeFullSnap(topOffset));

    useEffect(() => {
        const update = () => setFullSnap(computeFullSnap(topOffset));
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [topOffset]);

    const snaps = useMemo(
        () => ({ peek: 74, half: 37, full: fullSnap }),
        [fullSnap],
    );

    const [translateVh, setTranslateVh] = useState(snaps[snapTo] ?? snaps.peek);
    const [isDragging, setIsDragging] = useState(false);
    const touchStartY = useRef(null);
    const startTranslate = useRef(null);
    const translateRef = useRef(snaps[snapTo] ?? snaps.peek);
    const snapsRef = useRef(snaps);
    snapsRef.current = snaps;

    const setTranslate = (val) => {
        translateRef.current = val;
        setTranslateVh(val);
    };

    useEffect(() => {
        if (snapTo && snaps[snapTo] !== undefined) {
            setTranslate(snaps[snapTo]);
        }
    }, [snapTo, snaps]);

    const snapToNearest = () => {
        const current = translateRef.current;
        const [name, value] = Object.entries(snapsRef.current).reduce((best, curr) =>
            Math.abs(curr[1] - current) < Math.abs(best[1] - current) ? curr : best
        );
        setTranslate(value);
        onSnapChange?.(name);
    };

    const onTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
        startTranslate.current = translateRef.current;
        setIsDragging(true);
    };

    const onTouchMove = (e) => {
        const dy = e.touches[0].clientY - touchStartY.current;
        const delta = (dy / window.innerHeight) * 100;
        const clamped = Math.max(snapsRef.current.full, Math.min(snapsRef.current.peek, startTranslate.current + delta));
        setTranslate(clamped);
    };

    const onTouchEnd = () => {
        setIsDragging(false);
        snapToNearest();
    };

    const sheetBg = retro
        ? 'retro-panel'
        : 'dark:bg-[#222222] bg-white/95 backdrop-blur-2xl';

    return (
        <>
            {/* Desktop: persistent side panel */}
            <aside className={`hidden md:flex flex-col w-[380px] shrink-0 h-full z-[500] relative ${sheetBg} ${retro ? '' : 'border-r dark:border-white/10 border-black/10'}`}>
                {header && (
                    <div className={retro ? 'shrink-0 border-b border-[#808080]' : 'shrink-0 border-b dark:border-white/10 border-black/10'}>
                        {header}
                    </div>
                )}
                <div className={`flex-1 overflow-y-auto overscroll-contain ${retro ? 'retro-scroll' : ''}`}>
                    {children}
                </div>
            </aside>

            {/* Mobile: draggable bottom sheet */}
            <div
                className={`md:hidden fixed bottom-0 left-0 right-0 z-[600] ${retro ? '' : 'rounded-t-3xl'} ${sheetBg} ${retro ? 'border-t-2 border-t-[#808080]' : 'border-t dark:border-white/10 border-black/10'} shadow-2xl pointer-events-none`}
                style={{
                    height: `${SHEET_HEIGHT_VH}vh`,
                    transform: `translateY(${translateVh}vh)`,
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                }}
            >
                <div
                    className="pointer-events-auto flex justify-center pt-3 pb-2 touch-none cursor-grab active:cursor-grabbing"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div className={retro
                        ? 'retro-handle mx-auto mt-3 mb-2'
                        : 'w-10 h-1 rounded-full dark:bg-white/25 bg-black/20'
                    } />
                </div>

                <div
                    className={`pointer-events-auto overflow-y-auto overscroll-contain ${retro ? 'retro-scroll' : ''}`}
                    style={{
                        height: `calc(${SHEET_HEIGHT_VH - translateVh}vh)`,
                        transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                    }}
                >
                    {children}
                </div>
            </div>
        </>
    );
};

export default BottomSheet;
