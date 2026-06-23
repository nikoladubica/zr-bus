import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { MapContainer, TileLayer, CircleMarker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useTheme } from '../../context/ThemeContext.jsx';
import { useScript } from '../../context/ScriptContext.jsx';
import { useSSGData } from '../../context/SSGDataContext.jsx';
import Header from '../Elements/Header/Header';
import PageHead from '../Elements/PageHead';
import BottomSheet from '../UI/BottomSheet';
import ClientOnly from '../Elements/Map/ClientOnly';
import FitBoundsView from '../Elements/Map/FitBoundsView';
import { API_URL } from '../../utils/api';

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://zrbus.ddns.net';

const CORRIDORS = {
    'novi-sad-zrenjanin': {
        from: 'novi-sad', to: 'zrenjanin',
        title: 'Autobus Novi Sad — Zrenjanin: red vožnje i cene | ZR Bus',
        description: 'Red vožnje autobusa Novi Sad – Zrenjanin: polasci, prevoznik i cena karte.',
        canonical: '/autobus/novi-sad-zrenjanin',
        fromLabel: 'Novi Sad', toLabel: 'Zrenjanin',
    },
    'beograd-zrenjanin': {
        from: 'beograd', to: 'zrenjanin',
        title: 'Autobus Beograd — Zrenjanin: red vožnje i cene | ZR Bus',
        description: 'Red vožnje autobusa Beograd – Zrenjanin: polasci, prevoznik i cena karte.',
        canonical: '/autobus/beograd-zrenjanin',
        fromLabel: 'Beograd', toLabel: 'Zrenjanin',
    },
    'kikinda-zrenjanin': {
        from: 'kikinda', to: 'zrenjanin',
        title: 'Autobus Kikinda — Zrenjanin: red vožnje i cene | ZR Bus',
        description: 'Red vožnje autobusa Kikinda – Zrenjanin: polasci, prevoznik i cena karte.',
        canonical: '/autobus/kikinda-zrenjanin',
        fromLabel: 'Kikinda', toLabel: 'Zrenjanin',
    },
};

const DAY_LABELS = {
    workday: 'Radni dan',
    saturday: 'Subota',
    sunday: 'Nedelja',
    everyday: 'Svaki dan',
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

async function fetchCorridorData(apiUrl, from, to) {
    const res = await fetch(`${apiUrl}/lines/intercity?from=${from}&to=${to}`);
    if (!res.ok) return null;
    const lines = await res.json();
    if (!lines.length) return { lines: [], stopsByLine: {}, departuresByEntry: {} };

    const stopsByLine = {};
    const departuresByEntry = {};

    await Promise.all(lines.map(async (line) => {
        const stopsRes = await fetch(`${apiUrl}/lines-locations/${line.id}`);
        if (!stopsRes.ok) return;
        const stops = await stopsRes.json();
        const sorted = [...stops].sort((a, b) => a.stop_number - b.stop_number);
        stopsByLine[line.id] = sorted;

        await Promise.all(sorted.map(async (entry) => {
            const depRes = await fetch(`${apiUrl}/lines-locations-departures/${entry.id}`);
            if (!depRes.ok) return;
            departuresByEntry[entry.id] = await depRes.json();
        }));
    }));

    return { lines, stopsByLine, departuresByEntry };
}

const CorridorMap = ({ lines, stopsByLine, activeLineId }) => {
    const { theme } = useTheme();
    const activeLine = lines.find((l) => l.id === activeLineId) ?? lines[0];
    const activeStops = activeLine ? (stopsByLine[activeLine.id] ?? []) : [];

    const bounds = useMemo(() => {
        const coords = activeStops
            .map((e) => e?.locations?.lat && e?.locations?.lng ? [e.locations.lat, e.locations.lng] : null)
            .filter(Boolean);
        return coords.length >= 2 ? coords : null;
    }, [activeStops]);

    return (
        <MapContainer
            className="w-full h-full"
            center={[45.38, 20.39]}
            zoom={9}
            scrollWheelZoom={true}
            zoomControl={false}
        >
            {bounds && <FitBoundsView bounds={bounds} />}
            <TileLayer
                key={theme}
                url={
                    theme === 'dark'
                        ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
                        : 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
                }
                subdomains={theme === 'light' ? ['a', 'b', 'c'] : []}
            />
            {activeStops.map((entry) => {
                const loc = entry?.locations;
                if (!loc?.lat || !loc?.lng) return null;
                return (
                    <CircleMarker
                        key={entry.id}
                        center={[loc.lat, loc.lng]}
                        radius={6}
                        pathOptions={{
                            color: activeLine?.hex_color ?? '#404040',
                            weight: 1,
                            fillColor: '#ffffff',
                            fillOpacity: 1,
                        }}
                    />
                );
            })}
            {activeLine?.route?.coordinates && (
                <Polyline
                    positions={activeLine.route.coordinates.map(([lng, lat]) => [lat, lng])}
                    pathOptions={{ color: activeLine.hex_color ?? '#404040' }}
                />
            )}
        </MapContainer>
    );
};

const InterCitySheetContent = ({ config, lines, stopsByLine, departuresByEntry, activeLineId, setActiveLineId, isCyrillic }) => {
    const activeLine = lines.find((l) => l.id === activeLineId) ?? lines[0];
    const stops = activeLine ? (stopsByLine[activeLine.id] ?? []) : [];
    const [activeTab, setActiveTab] = useState(todayDayType);

    const availableTabs = useMemo(() => {
        const all = Object.values(departuresByEntry).flat();
        const types = new Set(all.map((d) => d?.day_type).filter(Boolean));
        return ['workday', 'saturday', 'sunday', 'everyday'].filter((t) => types.has(t));
    }, [departuresByEntry]);

    const stopName = (loc) => (isCyrillic ? loc?.cyr_name : loc?.lat_name) || loc?.lat_name || '';

    return (
        <div className="flex flex-col h-full">
            {/* Header bar — same design as StopDetailView */}
            <div className="flex items-center gap-2 p-2 px-4 border-b dark:border-white/10 border-black/10 shrink-0">
                <Link
                    to="/"
                    className="button-look w-8 h-8 flex items-center justify-center rounded-xl dark:hover:bg-white/10 hover:bg-black/5 transition-colors dark:text-white/60! text-gray-500! shrink-0"
                    aria-label={isCyrillic ? 'Почетна' : 'Početna'}
                >
                    ←
                </Link>
                <div className="flex flex-col flex-1 min-w-0">
                    <p className="font-semibold text-sm dark:text-white text-gray-900 truncate">
                        {isCyrillic
                            ? (activeLine?.cyr_name ?? `${config.fromLabel} – ${config.toLabel}`)
                            : (activeLine?.lat_name ?? `${config.fromLabel} – ${config.toLabel}`)}
                    </p>
                    {activeLine?.operator && (
                        <p className="text-xs dark:text-white/40 text-gray-500">{activeLine.operator}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4 p-4 pb-8 overflow-y-auto flex-1">
                {lines.length >= 2 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {lines.map((dir) => {
                            const isDirActive = dir.id === activeLineId;
                            const name = isCyrillic ? dir.cyr_name : dir.lat_name;
                            return (
                                <button
                                    key={dir.id}
                                    onClick={() => setActiveLineId(dir.id)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors border select-none ${
                                        isDirActive
                                            ? 'text-white border-transparent'
                                            : 'dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 dark:text-white/60 text-gray-500 dark:hover:bg-white/10 hover:bg-black/10'
                                    }`}
                                    style={isDirActive ? { backgroundColor: lines[0].hex_color } : {}}
                                >
                                    <span className="opacity-60">→</span>
                                    {destLabel(name, dir.direction)}
                                </button>
                            );
                        })}
                    </div>
                )}

            {availableTabs.length > 1 && (
                <div className="flex gap-1">
                    {availableTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                                activeTab === tab
                                    ? 'dark:bg-white/15 bg-black/10 dark:text-white text-gray-900'
                                    : 'dark:text-white/40 text-gray-400 dark:hover:bg-white/5 hover:bg-black/5'
                            }`}
                        >
                            {DAY_LABELS[tab] ?? tab}
                        </button>
                    ))}
                </div>
            )}

            {lines.length === 0 ? (
                <p className="text-sm dark:text-white/40 text-gray-400 py-8 text-center">
                    {isCyrillic ? 'Ускоро' : 'Uskoro'}
                </p>
            ) : (
                <div className="flex flex-col gap-1">
                    {stops.map((entry, idx) => {
                        const deps = (departuresByEntry[entry.id] ?? [])
                            .filter((d) => d.day_type === activeTab || d.day_type === 'everyday')
                            .map((d) => d.departure?.slice(0, 5))
                            .sort();
                        return (
                            <div
                                key={entry.id}
                                className="flex flex-col gap-1.5 px-4 py-3 rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border"
                            >
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xs dark:text-white/30 text-gray-400 shrink-0 w-5 text-right">
                                        {idx + 1}.
                                    </span>
                                    <span className="text-sm font-medium dark:text-white text-gray-900">
                                        {stopName(entry.locations)}
                                    </span>
                                </div>
                                {deps.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 pl-7">
                                        {deps.map((t, i) => (
                                            <span
                                                key={`${t}-${i}`}
                                                className="text-xs px-2 py-0.5 rounded-md dark:bg-white/8 bg-black/5 dark:border-white/10 border-black/10 border dark:text-white/70 text-gray-600 font-mono"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="pl-7 text-xs dark:text-white/25 text-gray-400">—</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            </div>
        </div>
    );
};

const InterCityRoute = ({ corridor }) => {
    const config = CORRIDORS[corridor];
    const { theme } = useTheme();
    const { script } = useScript();
    const isCyrillic = script === 'cyrillic';
    const ssgData = useSSGData();

    const [lines, setLines] = useState(() => ssgData?.lines ?? []);
    const [stopsByLine, setStopsByLine] = useState(() => ssgData?.stopsByLine ?? {});
    const [departuresByEntry, setDeparturesByEntry] = useState(() => ssgData?.departuresByEntry ?? {});
    const [activeLineId, setActiveLineId] = useState(null);
    const [sheetSnap, setSheetSnap] = useState('half');

    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    useEffect(() => {
        if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    }, []);

    useEffect(() => {
        if (ssgData?.lines) return;
        fetchCorridorData(API_URL, config.from, config.to).then((result) => {
            if (!result) return;
            setLines(result.lines);
            setStopsByLine(result.stopsByLine);
            setDeparturesByEntry(result.departuresByEntry);
        });
    }, [corridor]);

    useEffect(() => {
        if (lines.length > 0 && !activeLineId) {
            const dirA = lines.find((l) => l.direction === 'A') ?? lines[0];
            setActiveLineId(dirA.id);
        }
    }, [lines, activeLineId]);

    const jsonLd = useMemo(() => lines.length ? [
        {
            '@context': 'https://schema.org',
            '@type': 'BusTrip',
            name: `Autobus ${config.fromLabel} – ${config.toLabel}`,
            ...(lines[0]?.operator ? {
                provider: { '@type': 'Organization', name: lines[0].operator },
            } : {}),
            departureBusStop: {
                '@type': 'BusStation',
                name: `Autobuska stanica ${config.fromLabel}`,
                address: { '@type': 'PostalAddress', addressLocality: config.fromLabel },
            },
            arrivalBusStop: {
                '@type': 'BusStation',
                name: `Autobuska stanica ${config.toLabel}`,
                address: { '@type': 'PostalAddress', addressLocality: config.toLabel },
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'ZR Bus', item: `${SITE_URL}/` },
                { '@type': 'ListItem', position: 2, name: 'Autobusi', item: `${SITE_URL}/autobus` },
                { '@type': 'ListItem', position: 3, name: `${config.fromLabel} – ${config.toLabel}`, item: `${SITE_URL}${config.canonical}` },
            ],
        },
    ] : null, [lines, config]);

    return (
        <>
            <PageHead
                title={config.title}
                description={config.description}
                canonical={config.canonical}
                jsonLd={jsonLd}
            />
            <div
                className={`flex h-screen w-screen overflow-hidden relative ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                style={{
                    background: theme === 'dark'
                        ? 'linear-gradient(135deg, oklch(27.8% 0.033 256.848) 0%, oklch(22% 0.04 260) 50%, oklch(18% 0.05 270) 100%)'
                        : 'linear-gradient(135deg, oklch(96% 0.01 256) 0%, oklch(93% 0.015 260) 50%, oklch(90% 0.02 270) 100%)',
                }}
            >
                <BottomSheet
                    header={<Header />}
                    snapTo={sheetSnap}
                    onSnapChange={setSheetSnap}
                    topOffset={headerHeight}
                >
                    <InterCitySheetContent
                        config={config}
                        lines={lines}
                        stopsByLine={stopsByLine}
                        departuresByEntry={departuresByEntry}
                        activeLineId={activeLineId}
                        setActiveLineId={setActiveLineId}
                        isCyrillic={isCyrillic}
                    />
                </BottomSheet>

                <div className="flex-1 relative h-full">
                    <h1 className="sr-only">{config.title}</h1>
                    <ClientOnly>
                        <CorridorMap
                            lines={lines}
                            stopsByLine={stopsByLine}
                            activeLineId={activeLineId}
                        />
                    </ClientOnly>
                </div>

                {sheetSnap !== 'peek' && (
                    <div
                        className="md:hidden fixed inset-0 z-[599]"
                        onClick={() => setSheetSnap('peek')}
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

export default InterCityRoute;
