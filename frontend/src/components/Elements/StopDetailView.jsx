import { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router';
import useStore from '../../store/client/useStore';
import { useScript } from '../../context/ScriptContext.jsx';
import { nextDepartureMinutes, countdownLabel } from '../../utils/countdown';
import { useReminders } from '../../hooks/useReminders';

const DAY_LABELS = {
    latin:    { workday: 'Radni dan', saturday: 'Subota',  sunday: 'Nedelja' },
    cyrillic: { workday: 'Радни дан', saturday: 'Субота',  sunday: 'Недеља'  },
};

const todayDayType = () => {
    const d = new Date().getDay(); // 0=Sun,6=Sat
    if (d === 0) return 'sunday';
    if (d === 6) return 'saturday';
    return 'workday';
};

// Parses "Bagljaš – Centar": direction A → last segment, direction B → first segment
const destLabel = (name, direction) => {
    if (!name) return '';
    const parts = name.split(/\s*[–—-]\s*/);
    if (parts.length < 2) return name;
    return direction === 'A' ? parts[parts.length - 1].trim() : parts[0].trim();
};

const StopDetailView = () => {
    const { script } = useScript();
    const isCyrillic = script === 'cyrillic';

    const selectedStopId = useStore((s) => s.selectedStopId);
    const activeLine = useStore((s) => s.activeLine);
    const allLinesLocations = useStore((s) => s.allLinesLocations);
    const departures = useStore((s) => s.departures);
    const favourites = useStore((s) => s.favourites);
    const toggleFavourite = useStore((s) => s.toggleFavourite);
    const clearSelectedStop = useStore((s) => s.clearSelectedStop);

    const [now, setNow] = useState(() => new Date());
    const [activeTab, setActiveTab] = useState(todayDayType);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(id);
    }, []);

    // Reset tab to today when a new stop is selected
    useEffect(() => {
        setActiveTab(todayDayType());
    }, [selectedStopId]);

    // Entries for this stop across all lines, in the same order as the departures array
    const stopEntries = useMemo(
        () => allLinesLocations.filter((e) => e.locations?.id === selectedStopId),
        [allLinesLocations, selectedStopId],
    );

    // Stop location object (for name display)
    const stopLocation = stopEntries[0]?.locations ?? null;

    // Group entries by line id, merging their departures; active line sorts first
    const lineGroups = useMemo(() => {
        const grouped = {};
        stopEntries.forEach((entry, i) => {
            const lineId = entry.lines?.id;
            if (!lineId) return;
            if (!grouped[lineId]) {
                grouped[lineId] = { line: entry.lines, allDepartures: [] };
            }
            grouped[lineId].allDepartures.push(...(departures[i] || []));
        });
        return Object.values(grouped).sort((a, b) => {
            if (a.line.id === activeLine) return -1;
            if (b.line.id === activeLine) return 1;
            return 0;
        });
    }, [stopEntries, departures, activeLine]);

    // Determine which day-type tabs have data
    const availableTabs = useMemo(() => {
        const all = lineGroups.flatMap((g) => g.allDepartures);
        const hasDayType = all.some((d) => d.day_type);
        if (!hasDayType) return null; // null = degrade to showing all without tabs
        const types = new Set(all.map((d) => d.day_type));
        return ['workday', 'saturday', 'sunday'].filter((t) => types.has(t));
    }, [lineGroups]);

    const { schedule, cancel, isScheduled, permDenied } = useReminders();

    const isFav = favourites.includes(selectedStopId);
    const stopName = stopLocation
        ? (isCyrillic ? stopLocation.cyr_name : stopLocation.lat_name) || stopLocation.lat_name
        : '';

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2 p-2 px-4 border-b dark:border-white/10 border-black/10 shrink-0">
                <button
                    onClick={clearSelectedStop}
                    className="w-8 h-8 flex items-center justify-center rounded-xl dark:hover:bg-white/10 hover:bg-black/5 transition-colors dark:text-white/60 text-gray-500 shrink-0"
                    aria-label="Nazad"
                >
                    ←
                </button>
                <p className="font-semibold text-sm dark:text-white text-gray-900 flex-1 truncate">
                    {stopName}
                </p>
                <button
                    onClick={() => toggleFavourite(selectedStopId)}
                    className="text-lg leading-none shrink-0 transition-colors"
                    aria-label={isFav ? 'Ukloni iz omiljenih' : 'Dodaj u omiljene'}
                >
                    <span className={isFav ? 'text-yellow-400' : 'dark:text-white/20 text-gray-300'}>★</span>
                </button>
            </div>

            {permDenied && (
                <p className="text-xs text-amber-500/80 px-4 py-2 shrink-0">
                    {isCyrillic
                        ? 'Обавештења су блокирана. Омогући их у подешавањима прегледача.'
                        : 'Obaveštenja su blokirana. Omogući ih u podešavanjima pregledača.'}
                </p>
            )}

            {/* Day-type tabs */}
            {availableTabs && availableTabs.length > 1 && (
                <div className="flex px-4 pt-3 gap-1 shrink-0">
                    {availableTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                activeTab === tab
                                    ? 'dark:bg-white/15 bg-black/10 dark:text-white text-gray-900'
                                    : 'dark:text-white/40 text-gray-400 dark:hover:bg-white/5 hover:bg-black/5'
                            }`}
                        >
                            {DAY_LABELS[script]?.[tab] ?? DAY_LABELS.latin[tab]}
                        </button>
                    ))}
                </div>
            )}

            {/* Per-line blocks */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-3 flex flex-col gap-8">
                {lineGroups.length === 0 && (
                    <p className="text-sm dark:text-white/40 text-gray-400 py-6 text-center">
                        {isCyrillic ? 'Нема података о поласцима.' : 'Nema podataka o polascima.'}
                    </p>
                )}

                {lineGroups.map(({ line, allDepartures }) => {
                    // Filter by active tab (or show all if no tabs)
                    const filtered = availableTabs
                        ? allDepartures.filter((d) => d.day_type === activeTab)
                        : allDepartures;

                    const currentMins = now.getHours() * 60 + now.getMinutes();
                    const upcoming = filtered
                        .map((d) => {
                            const [h, m] = d.departure.split(':').map(Number);
                            return { mins: h * 60 + m, fmt: d.departure.slice(0, 5) };
                        })
                        .filter((d) => d.mins >= currentMins)
                        .sort((a, b) => a.mins - b.mins);

                    const past = filtered
                        .map((d) => {
                            const [h, m] = d.departure.split(':').map(Number);
                            return { mins: h * 60 + m, fmt: d.departure.slice(0, 5) };
                        })
                        .filter((d) => d.mins < currentMins)
                        .sort((a, b) => a.mins - b.mins);

                    const nextDep = upcoming[0] ?? null;
                    const nextMins = nextDep ? nextDep.mins - currentMins : null;
                    const followingDeps = upcoming.slice(1);
                    const lineName = isCyrillic ? line.cyr_name : line.lat_name;
                    const dest = destLabel(lineName, line.direction);

                    return (
                        <div key={line.id} className="flex flex-col gap-2">
                            {/* Line header */}
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-6! h-6 min-w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                    style={{ backgroundColor: line.hex_color }}
                                >
                                    {line.number}
                                </div>
                                <span className="text-xs dark:text-white/60 text-gray-500">
                                    → {dest}
                                </span>
                            </div>

                            {/* Next departure highlight */}
                            {nextDep ? (
                                <div className="rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border px-3 py-2.5 flex items-baseline gap-2 flex-wrap">
                                    <span className="font-bold dark:text-white text-gray-900">
                                        ▶ {countdownLabel(nextMins, isCyrillic)}
                                    </span>
                                    <span className="text-xs font-medium dark:text-white/50 text-gray-500">
                                        {nextDep.fmt}
                                    </span>
                                    {followingDeps.length > 0 && (
                                        <span className="text-xs dark:text-white/30 text-gray-400">
                                            {isCyrillic ? 'па' : 'pa'}{' '}
                                            {followingDeps.slice(0, 4).map((d) => d.fmt).join(' · ')}
                                            {followingDeps.length > 4 && ' …'}
                                        </span>
                                    )}
                                    {(() => {
                                        const scheduled = isScheduled(line.id, selectedStopId, nextDep.mins);
                                        return (
                                            <button
                                                onClick={() => {
                                                    if (scheduled) {
                                                        cancel({ lineId: line.id, stopId: selectedStopId, depMins: nextDep.mins });
                                                    } else {
                                                        schedule({
                                                            lineId: line.id,
                                                            stopId: selectedStopId,
                                                            lineNumber: line.number,
                                                            dest,
                                                            depMins: nextDep.mins,
                                                            isCyrillic,
                                                        });
                                                    }
                                                }}
                                                className={`ml-auto text-xs px-2 py-1 rounded-lg border transition-colors ${
                                                    scheduled
                                                        ? 'dark:bg-white/10 bg-black/8 dark:border-white/20 border-black/15 dark:text-white/80 text-gray-700'
                                                        : 'dark:border-white/10 border-black/10 dark:text-white/40 text-gray-400 dark:hover:bg-white/5 hover:bg-black/5'
                                                }`}
                                            >
                                                {scheduled
                                                    ? (isCyrillic ? 'Откажи подсетник' : 'Otkaži podsetnik')
                                                    : (isCyrillic ? 'Подсети ме' : 'Podseti me')}
                                            </button>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border px-3 py-2 text-xs dark:text-white/30 text-gray-400">
                                    {isCyrillic ? 'Нема полазака' : 'Nema polazaka'}
                                </div>
                            )}

                            {/* All day's times */}
                            {filtered.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {[...past, ...upcoming].map((d, idx) => {
                                        const isNext = nextDep && d.fmt === nextDep.fmt && idx === past.length;
                                        return (
                                            <span
                                                key={`${d.fmt}-${idx}`}
                                                className={`text-xs px-2 py-1 rounded-lg border ${
                                                    isNext
                                                        ? 'dark:bg-white/20 bg-black/10 dark:border-white/20 border-black/15 font-semibold dark:text-white text-gray-900'
                                                        : idx < past.length
                                                        ? 'dark:bg-white/3 bg-black/3 dark:border-white/5 border-black/5 dark:text-white/20 text-gray-300'
                                                        : 'dark:bg-white/8 bg-black/5 dark:border-white/10 border-black/10 dark:text-white/70 text-gray-600'
                                                }`}
                                            >
                                                {d.fmt}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Timetable link */}
                            <NavLink
                                to={`/red-voznje/${line.id}`}
                                className="text-xs dark:text-white/40 text-gray-400 dark:hover:text-white/70 hover:text-gray-700 transition-colors self-start text-left"
                            >
                                {isCyrillic
                                    ? `Цео ред вожње за линију ${line.number} ›`
                                    : `Ceo red vožnje za liniju ${line.number} ›`}
                            </NavLink>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StopDetailView;
