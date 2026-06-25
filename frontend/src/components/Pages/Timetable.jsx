import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, NavLink } from 'react-router';

import Header from '../Elements/Header/Header';
import PageHead from '../Elements/PageHead';
import { useScript } from '../../context/ScriptContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useRetro } from '../../context/RetroContext.jsx';
import { useSSGData } from '../../context/SSGDataContext.jsx';
import useStore from '../../store/client/useStore';
import { LINES_LOCATIONS, LINES_LOCATIONS_DEPARTURES } from '../../utils/api';

const DAY_LABELS = {
    latin: { workday: 'Radni dan', saturday: 'Subota', sunday: 'Nedelja' },
    cyrillic: { workday: 'Радни дан', saturday: 'Субота', sunday: 'Недеља' },
};

const todayDayType = () => {
    const d = new Date().getDay();
    if (d === 0) return 'sunday';
    if (d === 6) return 'saturday';
    return 'workday';
};

const destLabel = (name, direction) => {
    if (!name) return '';
    const parts = name.split(/\s*[–—-]\s*/);
    if (parts.length < 2) return name;
    return direction === 'A' ? parts[parts.length - 1].trim() : parts[0].trim();
};

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://zrbus.ddns.net';

const buildItemListJsonLd = (data, rawLines) => {
    let items;
    if (rawLines?.length > 0) {
        items = rawLines.map((line, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: `Linija ${line?.number} — ${line?.lat_name ?? ''}`,
            url: `${SITE_URL}/red-voznje/${line?.id}`,
        }));
    } else {
        items = data.flatMap((group) => group).map((line, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: `Linija ${line?.number} — ${line?.lat_name ?? ''}`,
            url: `${SITE_URL}/red-voznje/${line?.line_id}`,
        }));
    }
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Autobuske linije Zrenjanin',
        description: 'Red vožnje za sve gradske autobuske linije u Zrenjaninu (NetBus).',
        itemListElement: items,
    };
};

const buildLineJsonLd = (line, stops, siteUrl) => [
    {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'ZR Bus', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Red vožnje', item: `${siteUrl}/red-voznje` },
            {
                '@type': 'ListItem',
                position: 3,
                name: `Linija ${line?.number ?? ''} — ${line?.lat_name ?? ''}`,
                item: `${siteUrl}/red-voznje/${line?.id ?? ''}`,
            },
        ],
    },
    {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Stanice — Linija ${line?.number ?? ''}`,
        itemListElement: stops.map((stop, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: stop?.locations?.lat_name ?? stop?.locations?.cyr_name ?? '',
        })),
    },
];

const Timetable = () => {
    const { lineId } = useParams();
    const { script } = useScript();
    const { theme } = useTheme();
    const { retro } = useRetro();
    const isCyrillic = script === 'cyrillic';
    const ssgData = useSSGData();

    const data = useStore((s) => s.data);
    const fetchLines = useStore((s) => s.fetchLines);

    const [selectedLineId, setSelectedLineId] = useState(() =>
        lineId ? parseInt(lineId, 10) : null,
    );
    const [stops, setStops] = useState(() => ssgData?.stops ?? []);
    const [departures, setDepartures] = useState(() => ssgData?.departures ?? {});
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(todayDayType);
    const [contentVisible, setContentVisible] = useState(true);
    const switchTimeout = useRef(null);

    const handleLineSelect = (newLineId) => {
        if (newLineId === selectedLineId) return;
        clearTimeout(switchTimeout.current);
        setContentVisible(false);
        switchTimeout.current = setTimeout(
            () => setSelectedLineId(newLineId),
            300,
        );
    };

    useEffect(() => () => clearTimeout(switchTimeout.current), []);

    useEffect(() => {
        if (!isLoading) setContentVisible(true);
    }, [isLoading]);

    useEffect(() => {
        if (data.length === 0) fetchLines();
    }, []);

    useEffect(() => {
        if (!selectedLineId && data.length > 0) {
            setSelectedLineId(data[0][0].line_id);
        }
    }, [data, selectedLineId]);

    useEffect(() => {
        if (!selectedLineId) return;
        if (ssgData?.stops?.length > 0 && String(selectedLineId) === String(lineId)) return;

        let cancelled = false;

        const load = async () => {
            setIsLoading(true);
            setStops([]);
            setDepartures({});

            const resp = await fetch(`${LINES_LOCATIONS}/${selectedLineId}`);
            if (!resp.ok || cancelled) {
                if (!cancelled) setIsLoading(false);
                return;
            }
            const stopsData = await resp.json();
            const sorted = [...stopsData].sort(
                (a, b) => a.stop_number - b.stop_number,
            );
            if (cancelled) return;
            setStops(sorted);

            const depResults = await Promise.all(
                sorted.map((entry) =>
                    fetch(`${LINES_LOCATIONS_DEPARTURES}/${entry.id}`).then(
                        (r) => r.json(),
                    ),
                ),
            );
            if (cancelled) return;
            const depMap = {};
            sorted.forEach((entry, i) => {
                depMap[entry.id] = depResults[i] || [];
            });
            setDepartures(depMap);
            setIsLoading(false);
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [selectedLineId]);

    const activeGroup = useMemo(
        () =>
            data.find((group) =>
                group.some((d) => d.line_id === selectedLineId),
            ),
        [data, selectedLineId],
    );
    const isBidirectional = activeGroup?.length === 2;

    const availableTabs = useMemo(() => {
        const all = Object.values(departures).flat();
        const hasDayType = all.some((d) => d.day_type);
        if (!hasDayType) return null;
        const types = new Set(all.map((d) => d.day_type));
        return ['workday', 'saturday', 'sunday'].filter((t) => types.has(t));
    }, [departures]);

    const stopName = (loc) =>
        (isCyrillic ? loc?.cyr_name : loc?.lat_name) || loc?.lat_name || '';

    const formatTime = (t) => t?.slice(0, 5) ?? '';

    const timesForStop = (entryId) => {
        const deps = departures[entryId] || [];
        const filtered = availableTabs
            ? deps.filter((d) => d.day_type === activeTab)
            : deps;
        return filtered.map((d) => formatTime(d.departure)).sort();
    };

    const activeLine = activeGroup?.[0] ?? ssgData?.line ?? null;

    const lineIdForMeta = activeLine?.line_id ?? activeLine?.id ?? lineId;

    const pageTitle = activeLine
        ? `Linija ${activeLine.number} ${activeLine.lat_name ?? ''} — red vožnje i stanice | ZR Bus`
        : 'Red vožnje Zrenjanin — sve autobuske linije | ZR Bus';

    const pageDesc = activeLine
        ? `Red vožnje za liniju ${activeLine.number} u Zrenjaninu — stanice, polasci i smerovi A/B.`
        : 'Red vožnje za sve gradske autobuske linije u Zrenjaninu (NetBus).';

    const canonicalPath = activeLine
        ? `/red-voznje/${lineIdForMeta}`
        : '/red-voznje';

    const jsonLd = activeLine
        ? buildLineJsonLd(
            { number: activeLine.number, lat_name: activeLine.lat_name, id: lineIdForMeta },
            stops,
            SITE_URL,
          )
        : (data.length > 0 || ssgData?.lines?.length > 0)
            ? buildItemListJsonLd(data, ssgData?.lines)
            : null;

    return (
        <>
            <PageHead
                title={pageTitle}
                description={pageDesc}
                canonical={canonicalPath}
                jsonLd={jsonLd}
            />
            <div
                className={`flex flex-col h-screen ${retro ? '' : (`dark:bg-[#222222] bg-white/95 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`)}`}
                style={retro ? { background: '#c0c0c0' } : {}}
            >
                <div className={retro ? 'shrink-0 border-b border-[#808080]' : 'shrink-0 border-b dark:border-white/10 border-black/10'}>
                    <Header />
                </div>

                <div className={`flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] ${retro ? 'retro-scroll' : ''}`}>
                    <div className="max-w-3xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
                        <NavLink
                            to="/"
                            className={retro ? 'self-start text-sm' : 'self-start text-sm dark:text-white/50 text-gray-500 dark:hover:text-white/80 hover:text-gray-800 transition-colors'}
                        >
                            ← {isCyrillic ? 'Почетна' : 'Početna'}
                        </NavLink>

                        <h1 className={retro ? 'text-xl font-bold text-left' : 'text-xl font-bold dark:text-white text-gray-900 text-left'}>
                            {isCyrillic ? 'Редови вожње' : 'Redovi vožnje'}
                        </h1>

                        {data.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <p className={retro ? 'text-xs font-medium text-left uppercase tracking-wide' : 'text-xs font-medium text-left uppercase tracking-wide dark:text-white/40 text-gray-400'}>
                                    {isCyrillic
                                        ? 'Изаберите линију'
                                        : 'Izaberite liniju'}
                                </p>
                                <div className="flex items-center gap-1.5 overflow-x-auto md:overflow-x-visible md:flex-wrap pb-0.5 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                                    {data.map((group) => {
                                        const line = group[0];
                                        const isActive = group.some(
                                            (d) => d.line_id === selectedLineId,
                                        );
                                        return (
                                            <button
                                                key={line.line_id}
                                                onClick={() =>
                                                    handleLineSelect(line.line_id)
                                                }
                                                className={retro
                                                    ? `win-btn flex items-center gap-1.5 shrink-0 select-none ${isActive ? 'pressed' : ''}`
                                                    : `flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold shrink-0 transition-all select-none ${
                                                        isActive
                                                            ? 'text-white shadow-sm'
                                                            : 'dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border dark:text-white text-gray-800 dark:hover:bg-white/10 hover:bg-black/10'
                                                    }`
                                                }
                                                style={
                                                    isActive && !retro
                                                        ? { backgroundColor: line.hex_color }
                                                        : {}
                                                }
                                            >
                                                <span
                                                    className="w-2 h-2 rounded-full shrink-0"
                                                    style={{
                                                        backgroundColor: !isActive
                                                            ? line.hex_color
                                                            : (retro ? line.hex_color : '#ffffff'),
                                                    }}
                                                />
                                                {line.number}
                                            </button>
                                        );
                                    })}
                                </div>

                                {isBidirectional && activeGroup && (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {activeGroup.map((dir) => {
                                            const isDirActive =
                                                dir.line_id === selectedLineId;
                                            const name = isCyrillic
                                                ? dir.cyr_name
                                                : dir.lat_name;
                                            return (
                                                <button
                                                    key={dir.line_id}
                                                    onClick={() =>
                                                        handleLineSelect(
                                                            dir.line_id,
                                                        )
                                                    }
                                                    className={retro
                                                        ? `win-btn flex items-center gap-1 shrink-0 select-none ${isDirActive ? 'pressed' : ''}`
                                                        : `flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors border select-none ${
                                                            isDirActive
                                                                ? 'text-white border-transparent'
                                                                : 'dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 dark:text-white/60 text-gray-500 dark:hover:bg-white/10 hover:bg-black/10'
                                                        }`
                                                    }
                                                    style={
                                                        isDirActive && !retro
                                                            ? { backgroundColor: activeGroup[0].hex_color }
                                                            : {}
                                                    }
                                                >
                                                    <span className="opacity-60">
                                                        →
                                                    </span>
                                                    {destLabel(name, dir.direction)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        <div
                            className="flex flex-col gap-6 transition-opacity duration-300"
                            style={{ opacity: contentVisible ? 1 : 0 }}
                        >
                            {availableTabs && availableTabs.length > 1 && (
                                <div className="flex gap-1">
                                    {availableTabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={retro
                                                ? `win-btn ${activeTab === tab ? 'pressed' : ''}`
                                                : `px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                                                    activeTab === tab
                                                        ? 'dark:bg-white/15 bg-black/10 dark:text-white text-gray-900'
                                                        : 'dark:text-white/40 text-gray-400 dark:hover:bg-white/5 hover:bg-black/5'
                                                }`
                                            }
                                        >
                                            {DAY_LABELS[script]?.[tab] ??
                                                DAY_LABELS.latin[tab]}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {isLoading && (
                                <p className={retro ? 'text-sm py-8 text-center' : 'text-sm dark:text-white/40 text-gray-400 py-8 text-center'}>
                                    {isCyrillic ? 'Учитавање...' : 'Učitavanje...'}
                                </p>
                            )}

                            {!isLoading && stops.length > 0 && (
                                <div className="flex flex-col gap-1">
                                    {stops.map((stop, idx) => {
                                        const times = timesForStop(stop.id);
                                        return (
                                            <div
                                                key={stop.id}
                                                className={retro
                                                    ? 'retro-card flex flex-col gap-1.5'
                                                    : 'flex flex-col gap-1.5 px-4 py-3 rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border'
                                                }
                                            >
                                                <div className="flex items-baseline gap-2">
                                                    <span className={retro ? 'text-xs shrink-0 w-5 text-right' : 'text-xs dark:text-white/30 text-gray-400 shrink-0 w-5 text-right'}>
                                                        {idx + 1}.
                                                    </span>
                                                    <span className={retro ? 'text-sm font-medium' : 'text-sm font-medium dark:text-white text-gray-900'}>
                                                        {stopName(stop.locations)}
                                                    </span>
                                                </div>
                                                {times.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1 pl-7">
                                                        {times.map((t, i) => (
                                                            <span
                                                                key={`${t}-${i}`}
                                                                className={retro
                                                                    ? 'win-btn text-xs font-mono'
                                                                    : 'text-xs px-2 py-0.5 rounded-md dark:bg-white/8 bg-black/5 dark:border-white/10 border-black/10 border dark:text-white/70 text-gray-600 font-mono'
                                                                }
                                                            >
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className={retro ? 'pl-7 text-xs' : 'pl-7 text-xs dark:text-white/25 text-gray-400'}>
                                                        —
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {!isLoading && selectedLineId && stops.length === 0 && (
                                <p className={retro ? 'text-sm py-8 text-center' : 'text-sm dark:text-white/40 text-gray-400 py-8 text-center'}>
                                    {isCyrillic
                                        ? 'Нема података о станицама.'
                                        : 'Nema podataka o stanicama.'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Timetable;
