import { useState, useEffect, useRef, useMemo } from 'react';

import useStore from '../../store/client/useStore';
import { useScript } from '../../context/ScriptContext.jsx';
import { useRetro } from '../../context/RetroContext.jsx';
import { normalizeForSearch, getUniqueStops } from '../../utils/helpers';

const SearchView = () => {
    const { script } = useScript();
    const isCyrillic = script === 'cyrillic';
    const { retro } = useRetro();

    const searchQuery = useStore((s) => s.searchQuery);
    const setSearchQuery = useStore((s) => s.setSearchQuery);
    const closeSearch = useStore((s) => s.closeSearch);
    const data = useStore((s) => s.data);
    const allLinesLocations = useStore((s) => s.allLinesLocations);
    const recentSearches = useStore((s) => s.recentSearches);
    const favourites = useStore((s) => s.favourites);
    const selectStopFromSearch = useStore((s) => s.selectStopFromSearch);
    const selectLineFromSearch = useStore((s) => s.selectLineFromSearch);
    const setSearchMode = useStore((s) => s.setSearchMode);

    const inputRef = useRef(null);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        const t = setTimeout(() => inputRef.current?.focus(), 50);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(searchQuery), 150);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const allStops = useMemo(() => getUniqueStops(allLinesLocations), [allLinesLocations]);

    const allLines = useMemo(() => {
        const seen = new Set();
        return (data || [])
            .flatMap((pair) => pair)
            .filter((line) => {
                if (!line?.line_id || seen.has(line.line_id)) return false;
                seen.add(line.line_id);
                return true;
            });
    }, [data]);

    const { stopResults, lineResults } = useMemo(() => {
        const q = normalizeForSearch(debouncedQuery);
        if (!q) return { stopResults: [], lineResults: [] };

        const stopResults = allStops.filter((s) => {
            const lat = normalizeForSearch(s.location?.lat_name);
            const cyr = normalizeForSearch(s.location?.cyr_name);
            return lat.includes(q) || cyr.includes(q);
        }).slice(0, 8);

        const lineResults = allLines.filter((l) => {
            const num = String(l.number || '');
            const lat = normalizeForSearch(l.lat_name);
            const cyr = normalizeForSearch(l.cyr_name);
            return num.includes(debouncedQuery.trim()) || lat.includes(q) || cyr.includes(q);
        }).slice(0, 4);

        return { stopResults, lineResults };
    }, [debouncedQuery, allStops, allLines]);

    const hasResults = stopResults.length > 0 || lineResults.length > 0;
    const hasQuery = debouncedQuery.trim().length > 0;

    const favouriteStops = useMemo(() => {
        if (!favourites.length) return [];
        return allStops.filter((s) => favourites.includes(s.locationId)).slice(0, 5);
    }, [allStops, favourites]);

    const recentStops = useMemo(() => {
        return recentSearches
            .filter((r) => r.type === 'stop')
            .map((r) => allStops.find((s) => s.locationId === r.id))
            .filter(Boolean)
            .slice(0, 3);
    }, [recentSearches, allStops]);

    const recentLines = useMemo(() => {
        return recentSearches
            .filter((r) => r.type === 'line')
            .map((r) => allLines.find((l) => l.line_id === r.id))
            .filter(Boolean)
            .slice(0, 3);
    }, [recentSearches, allLines]);

    const stopName = (loc) => (isCyrillic ? loc?.cyr_name : loc?.lat_name) || loc?.lat_name || '';

    const linesForStop = (entries) => {
        const seen = new Set();
        return entries
            .filter((e) => { const k = e?.lines?.number; return k && !seen.has(k) && seen.add(k); })
            .map((e) => ({ number: e.lines.number, color: e.lines.hex_color }));
    };

    const handleKey = (e) => {
        if (e.key === 'Escape') closeSearch();
        if (e.key === 'Enter') {
            if (stopResults.length > 0) {
                const s = stopResults[0];
                selectStopFromSearch(s.locationId, s.location.lat, s.location.lng);
            } else if (lineResults.length > 0) {
                selectLineFromSearch(lineResults[0].line_id);
            }
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Tab toggle */}
            <div className={`flex shrink-0 p-2 px-3 ${retro ? 'border-b border-[#808080]' : 'border-b dark:border-white/10 border-black/10'}`}>
                <button
                    onClick={() => setSearchMode('stanica')}
                    className={retro
                        ? `win-btn flex-1 rounded-none!`
                        : `flex-1 py-2 text-xs font-medium dark:text-white text-gray-900 border-r dark:border-white/10 border-black/10 rounded-none! rounded-l-2xl!`
                    }
                >
                    {isCyrillic ? 'Станица' : 'Stanica'}
                </button>
                <button
                    onClick={() => setSearchMode('ruta')}
                    className={retro
                        ? `win-btn flex-1 rounded-none!`
                        : `flex-1 py-2 text-xs font-medium dark:text-white/40 text-gray-400 dark:hover:text-white/60 hover:text-gray-600 transition-colors rounded-none! rounded-r-2xl!`
                    }
                >
                    {isCyrillic ? 'Рута' : 'Ruta'}
                </button>
            </div>
            <div className={`flex items-center gap-2 px-3 pt-2 pb-2 shrink-0 ${retro ? 'border-b border-[#808080]' : 'border-b dark:border-white/10 border-black/10'}`}>
                <span className={retro ? 'text-base shrink-0' : 'text-base dark:text-white/40 text-gray-400 shrink-0'}>⌕</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={isCyrillic ? 'Претражи станицу / линију' : 'Pretraži stanicu / liniju'}
                    className={retro
                        ? 'flex-1 border-none outline-none min-w-0'
                        : 'flex-1 bg-transparent text-sm dark:text-white text-gray-900 placeholder:dark:text-white/30 placeholder:text-gray-400 outline-none'
                    }
                    style={retro ? { fontFamily: 'Tahoma, sans-serif', fontSize: 11, background: 'transparent', color: '#000' } : undefined}
                    aria-label={isCyrillic ? 'Претражи' : 'Pretraži'}
                    autoComplete="off"
                    spellCheck={false}
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className={retro
                            ? 'win-btn w-5 h-5 flex items-center justify-center p-0 shrink-0 text-xs'
                            : 'w-5 h-5 flex items-center justify-center rounded-full dark:bg-white/20 bg-black/10 dark:text-white/60 text-gray-500 text-xs shrink-0'
                        }
                        aria-label="Obriši"
                    >
                        ×
                    </button>
                )}
                <button
                    onClick={closeSearch}
                    className={retro
                        ? 'win-btn shrink-0 ml-1'
                        : 'text-sm dark:text-white/50 text-gray-500 dark:hover:text-white/80 hover:text-gray-800 transition-colors shrink-0 pl-1'
                    }
                    aria-label={isCyrillic ? 'Затвори претрагу' : 'Zatvori pretragu'}
                >
                    {isCyrillic ? 'Откажи' : 'Otkaži'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-8 flex flex-col gap-4">

                {hasQuery && hasResults && (
                    <>
                        {stopResults.length > 0 && (
                            <div className="flex flex-col gap-1">
                                <p className={retro ? 'win-label' : 'text-xs font-medium uppercase tracking-wide dark:text-white/40 text-gray-400'}>
                                    {isCyrillic ? 'Станице' : 'Stanice'}
                                </p>
                                {stopResults.map((stop) => (
                                    <button
                                        key={stop.locationId}
                                        onClick={() => selectStopFromSearch(stop.locationId, stop.location.lat, stop.location.lng)}
                                        className={retro
                                            ? 'win-btn w-full flex items-center justify-between gap-3 text-left'
                                            : 'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border text-left w-full dark:hover:bg-white/10 hover:bg-black/8 transition-colors'
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

                        {lineResults.length > 0 && (
                            <div className="flex flex-col gap-1">
                                <p className={retro ? 'win-label' : 'text-xs font-medium uppercase tracking-wide dark:text-white/40 text-gray-400'}>
                                    {isCyrillic ? 'Линије' : 'Linije'}
                                </p>
                                {lineResults.map((line) => (
                                    <button
                                        key={line.line_id}
                                        onClick={() => selectLineFromSearch(line.line_id)}
                                        className={retro
                                            ? 'win-btn w-full flex items-center justify-between gap-3 text-left'
                                            : 'flex items-center gap-3 px-3 py-2.5 rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border text-left w-full dark:hover:bg-white/10 hover:bg-black/8 transition-colors'
                                        }
                                    >
                                        <span
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                            style={{ backgroundColor: line.hex_color }}
                                        >
                                            {line.number}
                                        </span>
                                        <span className={retro ? 'text-sm truncate flex-1' : 'text-sm dark:text-white text-gray-900 truncate'}>
                                            {isCyrillic ? line.cyr_name : line.lat_name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {hasQuery && !hasResults && debouncedQuery === searchQuery && (
                    <div className="py-8 text-center">
                        <p className={retro ? 'text-sm' : 'text-sm dark:text-white/40 text-gray-400'}>
                            {isCyrillic ? 'Нема резултата за „' : 'Nema rezultata za „'}
                            {searchQuery}
                            {'"'}
                        </p>
                    </div>
                )}

                {!hasQuery && (
                    <>
                        {(recentStops.length > 0 || recentLines.length > 0) && (
                            <div className="flex flex-col gap-1">
                                <p className={retro ? 'win-label' : 'text-xs font-medium uppercase tracking-wide dark:text-white/40 text-gray-400'}>
                                    {isCyrillic ? 'Недавно' : 'Nedavno'}
                                </p>
                                {recentStops.map((stop) => (
                                    <button
                                        key={stop.locationId}
                                        onClick={() => selectStopFromSearch(stop.locationId, stop.location.lat, stop.location.lng)}
                                        className={retro
                                            ? 'win-btn w-full flex items-center justify-between gap-3 text-left'
                                            : 'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border text-left w-full dark:hover:bg-white/10 hover:bg-black/8 transition-colors'
                                        }
                                    >
                                        <span className="text-xs dark:text-white/40 text-gray-400 shrink-0">↺</span>
                                        <span className={retro ? 'text-sm truncate flex-1' : 'text-sm dark:text-white text-gray-900 truncate flex-1'}>
                                            {stopName(stop.location)}
                                        </span>
                                    </button>
                                ))}
                                {recentLines.map((line) => (
                                    <button
                                        key={line.line_id}
                                        onClick={() => selectLineFromSearch(line.line_id)}
                                        className={retro
                                            ? 'win-btn w-full flex items-center justify-between gap-3 text-left'
                                            : 'flex items-center gap-3 px-3 py-2.5 rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border text-left w-full dark:hover:bg-white/10 hover:bg-black/8 transition-colors'
                                        }
                                    >
                                        <span className="text-xs dark:text-white/40 text-gray-400 shrink-0">↺</span>
                                        <span
                                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                                            style={{ backgroundColor: line.hex_color }}
                                        >
                                            {line.number}
                                        </span>
                                        <span className={retro ? 'text-sm truncate flex-1' : 'text-sm dark:text-white text-gray-900 truncate'}>
                                            {isCyrillic ? line.cyr_name : line.lat_name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {favouriteStops.length > 0 && (
                            <div className="flex flex-col gap-1">
                                <p className={retro ? 'win-label' : 'text-xs font-medium uppercase tracking-wide dark:text-white/40 text-gray-400'}>
                                    {isCyrillic ? 'Омиљене' : 'Omiljene'}
                                </p>
                                {favouriteStops.map((stop) => (
                                    <button
                                        key={stop.locationId}
                                        onClick={() => selectStopFromSearch(stop.locationId, stop.location.lat, stop.location.lng)}
                                        className={retro
                                            ? 'win-btn w-full flex items-center justify-between gap-3 text-left'
                                            : 'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border text-left w-full dark:hover:bg-white/10 hover:bg-black/8 transition-colors'
                                        }
                                    >
                                        <span className="text-yellow-400 text-sm shrink-0">★</span>
                                        <span className={retro ? 'text-sm truncate flex-1 text-left' : 'text-sm dark:text-white text-gray-900 truncate flex-1 text-left'}>
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

                        {recentStops.length === 0 && recentLines.length === 0 && favouriteStops.length === 0 && (
                            <p className={retro ? 'text-sm text-center py-6' : 'text-sm dark:text-white/30 text-gray-400 text-center py-6'}>
                                {isCyrillic ? 'Претражи станице и линије' : 'Pretraži stanice i linije'}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchView;
