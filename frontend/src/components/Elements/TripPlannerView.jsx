import { useState, useMemo } from 'react';

import useStore from '../../store/client/useStore';
import { useScript } from '../../context/ScriptContext.jsx';
import { useRetro } from '../../context/RetroContext.jsx';
import { normalizeForSearch, getUniqueStops } from '../../utils/helpers';

const TripPlannerView = () => {
    const { script } = useScript();
    const isCyrillic = script === 'cyrillic';
    const { retro } = useRetro();

    const allLinesLocations = useStore((s) => s.allLinesLocations);
    const currentLocation = useStore((s) => s.currentLocation);
    const closeSearch = useStore((s) => s.closeSearch);
    const setSearchMode = useStore((s) => s.setSearchMode);
    const tripFrom = useStore((s) => s.tripFrom);
    const tripTo = useStore((s) => s.tripTo);
    const tripResults = useStore((s) => s.tripResults);
    const tripLoading = useStore((s) => s.tripLoading);
    const tripError = useStore((s) => s.tripError);
    const setTripFrom = useStore((s) => s.setTripFrom);
    const setTripTo = useStore((s) => s.setTripTo);
    const swapTripEndpoints = useStore((s) => s.swapTripEndpoints);
    const planTrip = useStore((s) => s.planTrip);
    const selectTripItinerary = useStore((s) => s.selectTripItinerary);
    const getCurrentLocation = useStore((s) => s.getCurrentLocation);

    const [fromQuery, setFromQuery] = useState(() => {
        if (!tripFrom) return '';
        if (tripFrom.type === 'location') return isCyrillic ? 'Моја локација' : 'Moja lokacija';
        return isCyrillic ? (tripFrom.location?.cyr_name || '') : (tripFrom.location?.lat_name || '');
    });
    const [toQuery, setToQuery] = useState(() => {
        if (!tripTo) return '';
        return isCyrillic ? (tripTo.location?.cyr_name || '') : (tripTo.location?.lat_name || '');
    });
    const [activeField, setActiveField] = useState(null);

    const allStops = useMemo(() => getUniqueStops(allLinesLocations), [allLinesLocations]);

    const stopName = (loc) => (isCyrillic ? loc?.cyr_name : loc?.lat_name) || loc?.lat_name || '';

    const filteredFrom = useMemo(() => {
        const q = normalizeForSearch(fromQuery);
        if (!q) return [];
        return allStops.filter((s) => {
            const lat = normalizeForSearch(s.location?.lat_name);
            const cyr = normalizeForSearch(s.location?.cyr_name);
            return lat.includes(q) || cyr.includes(q);
        }).slice(0, 6);
    }, [fromQuery, allStops]);

    const filteredTo = useMemo(() => {
        const q = normalizeForSearch(toQuery);
        if (!q) return [];
        return allStops.filter((s) => {
            const lat = normalizeForSearch(s.location?.lat_name);
            const cyr = normalizeForSearch(s.location?.cyr_name);
            return lat.includes(q) || cyr.includes(q);
        }).slice(0, 6);
    }, [toQuery, allStops]);

    const handleSelectFrom = (stop) => {
        setTripFrom({ type: 'stop', locationId: stop.locationId, location: stop.location });
        setFromQuery(stopName(stop.location));
        setActiveField(tripTo ? null : 'to');
    };

    const handleSelectTo = (stop) => {
        setTripTo({ type: 'stop', locationId: stop.locationId, location: stop.location });
        setToQuery(stopName(stop.location));
        setActiveField(null);
    };

    const handleMyLocation = () => {
        if (!currentLocation?.lat) {
            getCurrentLocation();
        }
        setTripFrom({ type: 'location', lat: currentLocation?.lat, lng: currentLocation?.lng });
        setFromQuery(isCyrillic ? 'Моја локација' : 'Moja lokacija');
        setActiveField(tripTo ? null : 'to');
    };

    const handleSwap = () => {
        swapTripEndpoints();
        const prevFrom = fromQuery;
        setFromQuery(toQuery);
        setToQuery(prevFrom);
    };

    const canSearch = tripFrom && tripTo && !tripLoading;

    const linesForStop = (entries) => {
        const seen = new Set();
        return entries
            .filter((e) => { const k = e?.lines?.number; return k && !seen.has(k) && seen.add(k); })
            .map((e) => ({ number: e.lines.number, color: e.lines.hex_color }));
    };

    const formatMins = (mins) => {
        if (mins < 60) return `${mins} min`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}min` : `${h}h`;
    };

    const showFromDropdown = activeField === 'from' && filteredFrom.length > 0;
    const showToDropdown = activeField === 'to' && filteredTo.length > 0;

    return (
        <div className="flex flex-col h-full">
            {/* Tab toggle */}
            <div className={`flex shrink-0 p-2 px-3 ${retro ? 'border-b border-[#808080]' : 'border-b dark:border-white/10 border-black/10'}`}>
                <button
                    onClick={() => setSearchMode('stanica')}
                    className={retro
                        ? 'win-btn flex-1 rounded-none!'
                        : 'flex-1 py-2 text-xs font-medium dark:text-white/40 text-gray-400 dark:hover:text-white/60 hover:text-gray-600 transition-colors border-r dark:border-white/10 border-black/10 rounded-none! rounded-l-2xl!'
                    }
                >
                    {isCyrillic ? 'Станица' : 'Stanica'}
                </button>
                <button
                    className={retro
                        ? 'win-btn flex-1 rounded-none! pressed'
                        : 'flex-1 py-2 text-xs font-medium dark:text-white text-gray-900 rounded-none!'
                    }
                >
                    {isCyrillic ? 'Рута' : 'Ruta'}
                </button>
                <button
                    onClick={closeSearch}
                    className={retro
                        ? 'win-btn rounded-none!'
                        : 'px-4 text-sm dark:text-white/50 text-gray-500 dark:hover:text-white/80 hover:text-gray-800 transition-colors shrink-0 rounded-none! rounded-r-2xl!'
                    }
                >
                    {isCyrillic ? 'Откажи' : 'Otkaži'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-8 flex flex-col gap-3">

                {/* From / To inputs */}
                <div className={retro
                    ? 'retro-card overflow-hidden'
                    : 'rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border overflow-hidden'
                }>
                    {/* From row */}
                    <div className={`flex items-center gap-2 px-3 py-2.5 ${retro ? 'border-b border-[#808080]' : 'border-b dark:border-white/5 border-black/5'}`}>
                        <span className={retro ? 'text-xs shrink-0' : 'text-xs dark:text-white/40 text-gray-400 shrink-0'}>⊙</span>
                        <input
                            type="text"
                            value={fromQuery}
                            onChange={(e) => { setFromQuery(e.target.value); setActiveField('from'); }}
                            onFocus={() => setActiveField('from')}
                            placeholder={isCyrillic ? 'Одакле...' : 'Odakle...'}
                            className={retro
                                ? 'flex-1 border-none outline-none min-w-0'
                                : 'flex-1 bg-transparent text-sm dark:text-white text-gray-900 placeholder:dark:text-white/30 placeholder:text-gray-400 outline-none min-w-0'
                            }
                            style={retro ? { fontFamily: 'Tahoma, sans-serif', fontSize: 11, background: 'transparent', color: '#000' } : undefined}
                            autoComplete="off"
                            spellCheck={false}
                        />
                        {fromQuery ? (
                            <button
                                onClick={() => { setFromQuery(''); setTripFrom(null); setActiveField('from'); }}
                                className={retro
                                    ? 'win-btn w-4 h-4 flex items-center justify-center p-0 shrink-0 text-xs'
                                    : 'w-4 h-4 flex items-center justify-center rounded-full dark:bg-white/20 bg-black/10 dark:text-white/60 text-gray-500 text-xs shrink-0'
                                }
                                aria-label="Obriši"
                            >
                                ×
                            </button>
                        ) : (
                            <button
                                onClick={handleMyLocation}
                                className={retro
                                    ? 'win-btn shrink-0'
                                    : 'text-xs dark:text-white/40 text-gray-400 shrink-0 dark:hover:text-white/70 hover:text-gray-700 transition-colors'
                                }
                                aria-label={isCyrillic ? 'Моја локација' : 'Moja lokacija'}
                            >
                                📍
                            </button>
                        )}
                    </div>

                    {/* Swap button */}
                    <div className={`flex items-center justify-center py-0.5 ${retro ? 'border-b border-[#808080]' : 'border-b dark:border-white/5 border-black/5'}`}>
                        <button
                            onClick={handleSwap}
                            className={retro
                                ? 'win-btn w-6 h-6 flex items-center justify-center p-0'
                                : 'w-6 h-6 flex items-center justify-center rounded-full dark:hover:bg-white/10 hover:bg-black/10 transition-colors dark:text-white/40 text-gray-400 dark:hover:text-white/70 hover:text-gray-700 text-sm'
                            }
                            aria-label={isCyrillic ? 'Zameni' : 'Zameni'}
                        >
                            ⇅
                        </button>
                    </div>

                    {/* To row */}
                    <div className="flex items-center gap-2 px-3 py-2.5">
                        <span className={retro ? 'text-xs shrink-0' : 'text-xs dark:text-white/40 text-gray-400 shrink-0'}>◎</span>
                        <input
                            type="text"
                            value={toQuery}
                            onChange={(e) => { setToQuery(e.target.value); setActiveField('to'); }}
                            onFocus={() => setActiveField('to')}
                            placeholder={isCyrillic ? 'Докле...' : 'Dokle...'}
                            className={retro
                                ? 'flex-1 border-none outline-none min-w-0'
                                : 'flex-1 bg-transparent text-sm dark:text-white text-gray-900 placeholder:dark:text-white/30 placeholder:text-gray-400 outline-none min-w-0'
                            }
                            style={retro ? { fontFamily: 'Tahoma, sans-serif', fontSize: 11, background: 'transparent', color: '#000' } : undefined}
                            autoComplete="off"
                            spellCheck={false}
                        />
                        {toQuery && (
                            <button
                                onClick={() => { setToQuery(''); setTripTo(null); setActiveField('to'); }}
                                className={retro
                                    ? 'win-btn w-4 h-4 flex items-center justify-center p-0 shrink-0 text-xs'
                                    : 'w-4 h-4 flex items-center justify-center rounded-full dark:bg-white/20 bg-black/10 dark:text-white/60 text-gray-500 text-xs shrink-0'
                                }
                                aria-label="Obriši"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {/* Autocomplete dropdown */}
                {(showFromDropdown || showToDropdown) && (
                    <div className={retro
                        ? 'retro-card flex flex-col gap-0 overflow-hidden p-0'
                        : 'flex flex-col gap-1 rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border overflow-hidden'
                    }>
                        {(showFromDropdown ? filteredFrom : filteredTo).map((stop) => (
                            <button
                                key={stop.locationId}
                                onClick={() => showFromDropdown ? handleSelectFrom(stop) : handleSelectTo(stop)}
                                className={retro
                                    ? 'win-btn w-full flex items-center justify-between gap-3 text-left rounded-none! border-b border-[#808080] last:border-b-0'
                                    : 'flex items-center justify-between gap-3 px-3 py-2.5 text-left w-full dark:hover:bg-white/10 hover:bg-black/8 transition-colors border-b last:border-b-0 dark:border-white/5 border-black/5'
                                }
                            >
                                <span className={retro ? 'text-sm truncate flex-1' : 'text-sm dark:text-white text-gray-900 truncate flex-1'}>
                                    {stopName(stop.location)}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {linesForStop(stop.entries).map((l) => (
                                        <span
                                            key={l.number}
                                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                                            style={{ backgroundColor: l.color }}
                                        >
                                            {l.number}
                                        </span>
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Search button */}
                <button
                    onClick={planTrip}
                    disabled={!canSearch}
                    className={retro
                        ? `win-btn w-full py-2 ${!canSearch ? 'opacity-50 cursor-not-allowed' : ''}`
                        : `w-full py-3 rounded-xl text-sm font-medium transition-colors ${
                            canSearch
                                ? 'dark:bg-white/10 bg-black/10 dark:text-white text-gray-900 dark:hover:bg-white/15 hover:bg-black/15'
                                : 'dark:bg-white/5 bg-black/5 dark:text-white/30 text-gray-400 cursor-not-allowed'
                        }`
                    }
                >
                    {tripLoading
                        ? (isCyrillic ? 'Тражим...' : 'Tražim...')
                        : (isCyrillic ? 'Претражи руту' : 'Pretraži rutu')}
                </button>

                {/* Loading */}
                {tripLoading && (
                    <div className="py-8 text-center">
                        <p className={retro ? 'text-sm' : 'text-sm dark:text-white/40 text-gray-400'}>
                            {isCyrillic ? 'Тражим...' : 'Tražim...'}
                        </p>
                    </div>
                )}

                {/* Error states */}
                {!tripLoading && tripError && (
                    <div className="py-6 text-center">
                        <p className={retro ? 'text-sm text-center py-6' : 'text-sm dark:text-white/50 text-gray-500'}>
                            {tripError === 'same_stop' && (isCyrillic ? 'Полазиште и одредиште су иста станица.' : 'Polazište i odredište su ista stanica.')}
                            {tripError === 'no_route' && (isCyrillic ? 'Нема директне линије између ових станица.' : 'Nema direktne linije između ovih stanica.')}
                            {tripError === 'no_service' && (isCyrillic ? 'Нема више полазака за данас.' : 'Nema više polazaka za danas.')}
                            {tripError === 'fetch_error' && (isCyrillic ? 'Грешка при учитавању. Проверите конекцију.' : 'Greška pri učitavanju. Proverite konekciju.')}
                        </p>
                    </div>
                )}

                {/* Results */}
                {!tripLoading && !tripError && tripResults.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <p className={retro ? 'win-label' : 'text-xs font-medium uppercase tracking-wide dark:text-white/40 text-gray-400'}>
                            {isCyrillic ? 'Резултати' : 'Rezultati'}
                        </p>
                        {tripResults.map((item, i) => (
                            <div
                                key={i}
                                className={retro
                                    ? 'retro-card flex flex-col gap-2'
                                    : 'rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border p-3 flex flex-col gap-2'
                                }
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                        style={{ backgroundColor: item.lineColor }}
                                    >
                                        {item.lineNumber}
                                    </span>
                                    <span className={retro ? 'text-sm font-medium truncate flex-1' : 'text-sm font-medium dark:text-white text-gray-900 truncate flex-1'}>
                                        {isCyrillic ? item.lineCyrName : item.lineLatName}
                                    </span>
                                </div>

                                <div className={retro ? 'flex items-center gap-1.5 text-xs' : 'flex items-center gap-1.5 text-xs dark:text-white/60 text-gray-600'}>
                                    <span className="truncate">
                                        {isCyrillic ? item.boardCyrName : item.boardLatName}
                                    </span>
                                    <span className={retro ? 'shrink-0' : 'shrink-0 dark:text-white/30 text-gray-400'}>→</span>
                                    <span className="truncate">
                                        {isCyrillic ? item.alightCyrName : item.alightLatName}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={retro ? 'text-sm font-bold' : 'text-sm font-bold dark:text-white text-gray-900'}>
                                            {item.boardTime}
                                        </span>
                                        <span className={retro ? 'text-xs' : 'text-xs dark:text-white/40 text-gray-400'}>→</span>
                                        <span className={retro ? 'text-sm font-bold' : 'text-sm font-bold dark:text-white text-gray-900'}>
                                            {item.alightTime}
                                        </span>
                                        <span className={retro ? 'text-xs' : 'text-xs dark:text-white/40 text-gray-400'}>
                                            · {formatMins(item.travelMins)} {isCyrillic ? 'вожња' : 'vožnja'}
                                        </span>
                                    </div>
                                </div>

                                {item.walkToBoard > 0 && (
                                    <p className={retro ? 'text-xs' : 'text-xs dark:text-white/40 text-gray-400'}>
                                        {item.walkToBoard} min {isCyrillic ? 'пешице до станице' : 'pešice do stanice'}
                                    </p>
                                )}

                                <button
                                    onClick={() => selectTripItinerary(item)}
                                    className={retro
                                        ? 'win-btn mt-0.5 w-full'
                                        : 'mt-0.5 w-full py-1.5 rounded-lg text-xs font-medium dark:bg-white/8 bg-black/8 dark:text-white/70 text-gray-600 dark:hover:bg-white/12 hover:bg-black/12 transition-colors'
                                    }
                                >
                                    {isCyrillic ? 'Прикажи на мапи' : 'Prikaži na mapi'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripPlannerView;
