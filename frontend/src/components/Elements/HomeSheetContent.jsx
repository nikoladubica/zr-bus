import { useState, useEffect, useMemo } from 'react';
import useStore from '../../store/client/useStore';
import { useScript } from '../../context/ScriptContext.jsx';
import StopDetailView from './StopDetailView';
import SearchView from './SearchView';
import TripPlannerView from './TripPlannerView';
import { getNearbyStops } from '../../utils/helpers';
import { nextDepartureMinutes, countdownLabel, followingTimes } from '../../utils/countdown';
import MapLineSwitcher from './Map/MapLineSwitcher';

const HomeSheetContent = () => {
    const { script } = useScript();
    const isCyrillic = script === 'cyrillic';

    const isSearchOpen = useStore((s) => s.isSearchOpen);
    const openSearch = useStore((s) => s.openSearch);
    const searchMode = useStore((s) => s.searchMode);

    const allLinesLocations = useStore((s) => s.allLinesLocations);
    const currentLocation = useStore((s) => s.currentLocation);
    const closestStopInfo = useStore((s) => s.closestStopInfo);
    const closestStopDepartures = useStore((s) => s.closestStopDepartures);
    const favourites = useStore((s) => s.favourites);
    const toggleFavourite = useStore((s) => s.toggleFavourite);
    const fetchFavouriteDepartures = useStore((s) => s.fetchFavouriteDepartures);
    const favouriteDepartures = useStore((s) => s.favouriteDepartures);
    const selectedStopId = useStore((s) => s.selectedStopId);
    const fetchStopDepartures = useStore((s) => s.fetchStopDepartures);

    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (favourites.length > 0 && allLinesLocations.length > 0) {
            fetchFavouriteDepartures();
        }
    }, [favourites.length, allLinesLocations.length, fetchFavouriteDepartures]);

    const closestFlat = useMemo(() => closestStopDepartures.flat(), [closestStopDepartures]);
    const nextMinutes = useMemo(() => nextDepartureMinutes(closestFlat, now), [closestFlat, now]);
    const following = useMemo(() => followingTimes(closestFlat, now), [closestFlat, now]);
    const isClosestFav = closestStopInfo ? favourites.includes(closestStopInfo.locationId) : false;

    const nearbyStops = useMemo(
        () => getNearbyStops(allLinesLocations, currentLocation, 8),
        [allLinesLocations, currentLocation],
    );

    const favouriteStops = useMemo(() => {
        if (!favourites.length || !allLinesLocations.length) return [];
        const byLocation = {};
        allLinesLocations.forEach((e) => {
            const id = e?.locations?.id;
            if (id && !byLocation[id]) byLocation[id] = { locationId: id, location: e.locations, entries: [] };
            if (id) byLocation[id].entries.push(e);
        });
        return favourites.map((id) => byLocation[id]).filter(Boolean);
    }, [favourites, allLinesLocations]);

    const formatDist = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`);

    const stopName = (loc) => (isCyrillic ? loc?.cyr_name : loc?.lat_name) || loc?.lat_name || '';

    const linesForEntries = (entries) => {
        const seen = new Set();
        return entries
            .filter((e) => {
                const key = e?.lines?.number;
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .map((e) => ({ number: e.lines.number, color: e.lines.hex_color }));
    };

    if (isSearchOpen) {
        if (searchMode === 'ruta') return <TripPlannerView />;
        return <SearchView />;
    }

    if (selectedStopId !== null) {
        return <StopDetailView />;
    }

    return (
        <div className="flex flex-col gap-5 p-4 pb-8">

            {/* ── SEARCH PILL ── */}
            <div className="rounded-2xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border overflow-hidden">
                <div className="flex border-b dark:border-white/10 border-black/10">
                    <button
                        onClick={() => openSearch('stanica')}
                        className={`flex-1 py-2 text-xs font-medium transition-colors border-r dark:border-white/10 border-black/10 rounded-none! rounded-tl-2xl! ${
                            searchMode === 'stanica'
                                ? 'dark:text-white text-gray-900'
                                : 'dark:text-white/40 text-gray-400 dark:hover:text-white/60 hover:text-gray-600'
                        }`}
                    >
                        {isCyrillic ? 'Станица' : 'Stanica'}
                    </button>
                    <button
                        onClick={() => openSearch('ruta')}
                        className={`flex-1 py-2 text-xs font-medium transition-colors rounded-none! rounded-tr-2xl! ${
                            searchMode === 'ruta'
                                ? 'dark:text-white text-gray-900'
                                : 'dark:text-white/40 text-gray-400 dark:hover:text-white/60 hover:text-gray-600'
                        }`}
                    >
                        {isCyrillic ? 'Рута' : 'Ruta'}
                    </button>
                </div>
                <button
                    onClick={() => openSearch(searchMode)}
                    className="flex items-center gap-3 w-full px-4 py-3 dark:hover:bg-white/8 hover:bg-black/8 transition-colors text-left rounded-none! rounded-b-2xl!"
                    aria-label={isCyrillic ? 'Отвори претрагу' : 'Otvori pretragu'}
                >
                    <span className="text-base dark:text-white/30 text-gray-400">⌕</span>
                    <span className="text-sm dark:text-white/40 text-gray-400 flex-1">
                        {searchMode === 'ruta'
                            ? (isCyrillic ? 'Планирај руту А → Б' : 'Planiraj rutu A → B')
                            : (isCyrillic ? 'Претражи станицу / линију' : 'Pretraži stanicu / liniju')}
                    </span>
                </button>
            </div>

            {/* ── NEXT BUS ── */}
            {closestStopInfo && (
                <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-medium uppercase tracking-wide dark:text-white/40 text-gray-400 text-left">
                        {isCyrillic ? 'Следећи аутобус' : 'Sledeći autobus'}
                    </p>
                    <div
                        onClick={() => fetchStopDepartures(closestStopInfo.locationId)}
                        className="rounded-2xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border p-3 flex flex-col gap-2 cursor-pointer transition-colors hover:border-[#646cff] dark:hover:border-[#646cff]"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="font-semibold text-sm dark:text-white text-gray-900 leading-snug">
                                    {stopName(closestStopInfo.location)}
                                </p>
                                <p className="text-xs dark:text-white/40 text-gray-500 mt-0.5 text-left">
                                    {formatDist(closestStopInfo.distance)}
                                </p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleFavourite(closestStopInfo.locationId); }}
                                className="text-lg leading-none mt-0.5 shrink-0 transition-colors"
                                aria-label={isClosestFav ? 'Ukloni iz omiljenih' : 'Dodaj u omiljene'}
                            >
                                <span className={isClosestFav ? 'text-yellow-400' : 'dark:text-white/20 text-gray-300'}>
                                    ★
                                </span>
                            </button>
                        </div>

                        {closestFlat.length > 0 && (
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-base font-bold dark:text-white text-gray-900">
                                    {nextMinutes !== null ? (
                                        <>▶ {countdownLabel(nextMinutes, isCyrillic)}</>
                                    ) : (
                                        <span className="text-sm font-normal dark:text-white/40 text-gray-400">
                                            {isCyrillic ? 'нема полазака' : 'nema polazaka'}
                                        </span>
                                    )}
                                </span>
                                {following.length > 0 && nextMinutes !== null && (
                                    <span className="text-xs dark:text-white/40 text-gray-400">
                                        {isCyrillic ? 'па' : 'pa'} {following.join(' · ')}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── LINE SWITCHER ── always visible */}
            <MapLineSwitcher />

            {/* ── STANICE U BLIZINI ── always rendered */}
            {nearbyStops.length > 0 && (
                <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-medium uppercase tracking-wide dark:text-white/40 text-gray-400 text-left">
                        {isCyrillic ? 'Станице у близини' : 'Stanice u blizini'}
                    </p>
                    <div className="flex flex-col gap-1">
                        {nearbyStops.map((stop) => (
                            <div key={stop.locationId} onClick={() => fetchStopDepartures(stop.locationId)} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border cursor-pointer hover:border-[#646cff] dark:hover:border-[#646cff] transition-colors">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleFavourite(stop.locationId); }}
                                    className="text-base leading-none shrink-0 transition-colors"
                                    aria-label={favourites.includes(stop.locationId) ? 'Ukloni iz omiljenih' : 'Dodaj u omiljene'}
                                >
                                    <span className={favourites.includes(stop.locationId) ? 'text-yellow-400' : 'dark:text-white/20 text-gray-300'}>
                                        ★
                                    </span>
                                </button>
                                <div className="flex flex-col items-start justify-start w-full">
                                    <span className="text-sm dark:text-white text-gray-900 truncate flex-1 text-left">
                                        {stopName(stop.location)}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {linesForEntries(stop.entries).map((l) => (
                                        <span
                                            key={l.number}
                                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                                            style={{ backgroundColor: l.color }}
                                        >
                                            {l.number}
                                        </span>
                                    ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs dark:text-white/40 text-gray-400">
                                        {formatDist(stop.distance)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── OMILJENE ── always rendered if user has favourites */}
            {favouriteStops.length > 0 && (
                <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-medium uppercase tracking-wide dark:text-white/40 text-gray-400 text-left">
                        {isCyrillic ? 'Омиљене' : 'Omiljene'}
                    </p>
                    <div className="flex flex-col gap-1">
                        {favouriteStops.map((stop) => {
                            const deps = (favouriteDepartures[stop.locationId] || []).flat();
                            const mins = nextDepartureMinutes(deps, now);
                            return (
                                <div
                                    key={stop.locationId}
                                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        {linesForEntries(stop.entries).map((l) => (
                                            <span
                                                key={l.number}
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: l.color }}
                                            />
                                        ))}
                                        <span className="text-sm dark:text-white text-gray-900 truncate">
                                            {stopName(stop.location)}
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium shrink-0 dark:text-white/60 text-gray-500">
                                        {deps.length > 0 ? countdownLabel(mins, isCyrillic) : '—'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeSheetContent;
