import { useEffect, useMemo } from 'react';
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Polyline,
    Pane,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import MapChangeView from './MapChangeView';

import { getClosestStation } from '../../../utils/helpers';
import useStore from '../../../store/client/useStore';
import { useScript } from '../../../context/ScriptContext.jsx';
import { useTheme } from '../../../context/ThemeContext.jsx';

const Map = () => {
    const { script } = useScript();
    const { theme } = useTheme();
    const data = useStore((state) => state.data);
    const line = useStore((state) => state.line);
    const linesLocations = useStore((state) => state.linesLocations);
    const currentLocation = useStore((state) => state.currentLocation);
    const mapCenter = useStore((state) => state.mapCenter);
    const mapZoom = useStore((state) => state.mapZoom);
    const fetchLines = useStore((state) => state.fetchLines);
    const filterLineById = useStore((state) => state.filterLineById);
    const getCurrentLocation = useStore((state) => state.getCurrentLocation);
    const departures = useStore((state) => state.departures);
    const selectedStopId = useStore((state) => state.selectedStopId);
    const fetchDepartures = useStore((state) => state.fetchDepartures);
    const clearSelectedStop = useStore((state) => state.clearSelectedStop);
    const isLoading = useStore((state) => state.isLoading);
    const error = useStore((state) => state.error);
    const geoError = useStore((state) => state.geoError);

    useEffect(() => {
        fetchLines();
    }, [fetchLines]);

    useEffect(() => {
        getCurrentLocation();
    }, [getCurrentLocation]);

    useEffect(() => {
        filterLineById(1);
    }, [data, filterLineById]);

    const formatTime = (ts) => ts.slice(0, 5);

    const uniqueStops = useMemo(() => {
        const byLocation = {};
        linesLocations.forEach((marker) => {
            const locId = marker?.locations?.id;
            if (!byLocation[locId]) {
                byLocation[locId] = { locationId: locId, location: marker.locations, entries: [] };
            }
            byLocation[locId].entries.push({ id: marker.id, stop_number: marker.stop_number });
        });
        return Object.values(byLocation).map((s) => ({
            ...s,
            entries: s.entries.sort((a, b) => a.stop_number - b.stop_number),
        }));
    }, [linesLocations]);

    const selectedStop = useMemo(
        () => uniqueStops.find((s) => s.locationId === selectedStopId) ?? null,
        [uniqueStops, selectedStopId],
    );

    const closestStation = useMemo(() => {
        const station = getClosestStation(linesLocations, currentLocation);

        return station?.coords ? (
            <CircleMarker
                center={station?.coords}
                className="leaflet-pulse"
                radius={12}
                pathOptions={{
                    color: line?.hex_color || '#404040',
                    weight: 0,
                    fillColor: line?.hex_color || '#404040',
                    fillOpacity: 0.3,
                }}
            />
        ) : null;
    }, [linesLocations, currentLocation]);

    if (isLoading && data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center dark:bg-white/5 bg-black/5">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 dark:border-white/20 border-black/20 border-t-transparent animate-spin" />
                    <span className="text-sm dark:text-white/50 text-gray-500">
                        {script === 'cyrillic' ? 'Учитавање...' : 'Učitavanje...'}
                    </span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center dark:bg-red-900/20 bg-red-50">
                <div className="flex flex-col items-center gap-2 text-center px-6">
                    <span className="text-2xl">⚠</span>
                    <p className="text-sm font-medium dark:text-red-300 text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <MapContainer
                className="MapContainer w-full h-full"
                center={mapCenter}
                zoom={mapZoom}
                scrollWheelZoom={true}
            >
                <MapChangeView center={mapCenter} zoom={mapZoom} />
                <TileLayer
                    key={theme}
                    url={
                        theme === 'dark'
                            ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
                            : 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
                    }
                    subdomains={theme === 'light' ? ['a', 'b', 'c'] : []}
                />

                {/* Bus Stops */}
                {uniqueStops.length > 0 && (
                    <Pane name="stopsPane" style={{ zIndex: 650 }}>
                        {uniqueStops.map((stop) => {
                            const isSelected = selectedStopId === stop.locationId;
                            return (
                                <CircleMarker
                                    key={`marker_${stop.locationId}`}
                                    center={[stop.location?.lat, stop.location?.lng]}
                                    radius={isSelected ? 9 : 6}
                                    pathOptions={
                                        isSelected
                                            ? {
                                                color: '#ffffff',
                                                weight: 2.5,
                                                fillColor: line?.hex_color || '#404040',
                                                fillOpacity: 1,
                                            }
                                            : {
                                                color: line?.hex_color || '#404040',
                                                weight: 1,
                                                fillColor: '#ffffff',
                                                fillOpacity: 1,
                                            }
                                    }
                                    eventHandlers={{
                                        click: () => fetchDepartures(
                                            stop.entries.map((e) => e.id),
                                            stop.locationId,
                                        ),
                                    }}
                                />
                            );
                        })}
                    </Pane>
                )}

                {/* Marking the closest station */}
                {closestStation}

                {/* Route Line */}
                {!!line && !!line?.route?.coordinates ? (
                    <Polyline
                        key={line.id}
                        positions={line.route.coordinates.map(
                            ([lng, lat]) => [lat, lng],
                        )}
                        pathOptions={{
                            color: line?.hex_color || '#404040',
                        }}
                        dashArray={line?.direction === 'B' ? '4, 10' : ''}
                    />
                ) : null}

                {/* Current Location */}
                {!!currentLocation?.lat && !!currentLocation?.lng && (
                    <>
                        {/* Outer glow */}
                        <CircleMarker
                            className="leaflet-pulse"
                            center={[
                                currentLocation.lat,
                                currentLocation.lng,
                            ]}
                            radius={12}
                            pathOptions={{
                                color: '#2286ff',
                                weight: 0,
                                fillColor: '#2286ff',
                                fillOpacity: 0.3,
                            }}
                        />

                        {/* Inner dot */}
                        <CircleMarker
                            center={[
                                currentLocation.lat,
                                currentLocation.lng,
                            ]}
                            radius={5}
                            pathOptions={{
                                color: '#ffffff',
                                weight: 2,
                                fillColor: '#2286ff',
                                fillOpacity: 1,
                            }}
                        />
                    </>
                )}
            </MapContainer>

            {geoError && (
                <div className="absolute bottom-4 right-4 z-[1000] px-3 py-1.5 rounded-full dark:bg-black/70 bg-white/80 backdrop-blur-xl border dark:border-white/10 border-black/10 shadow text-xs dark:text-white/60 text-gray-500">
                    ⚠ {geoError}
                </div>
            )}

            {selectedStop && (
                <div className="absolute bottom-4 left-4 z-[1000] w-72 rounded-2xl backdrop-blur-xl dark:bg-black/60 bg-white/80 dark:border-white/15 border-black/10 border shadow-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="font-semibold dark:text-white text-gray-900 text-sm leading-snug">
                                {script === 'latin' ? selectedStop.location?.lat_name : selectedStop.location?.cyr_name}
                            </p>
                            <p className="text-xs dark:text-white/40 text-gray-500 mt-0.5">
                                Stanica {selectedStop.entries.map((e) => e.stop_number).join(' / ')}
                            </p>
                        </div>
                        <button
                            onClick={clearSelectedStop}
                            className="dark:text-white/30 dark:hover:text-white/70 text-gray-400 hover:text-gray-700 transition-colors text-base leading-none mt-0.5 shrink-0"
                        >
                            ✕
                        </button>
                    </div>
                    {departures.some((g) => g.length > 0) && (
                        <>
                            <div className="my-3 border-t dark:border-white/10 border-black/10" />
                            {departures.map((group, groupIndex) => (
                                <div key={groupIndex}>
                                    {groupIndex > 0 && (
                                        <div className="my-2 border-t dark:border-white/10 border-black/10" />
                                    )}
                                    <div className="flex flex-wrap gap-1.5">
                                        {group.map((dep) => (
                                            <span
                                                key={dep.id}
                                                className="text-xs dark:bg-white/10 dark:border-white/10 dark:text-white/80 bg-black/5 border-black/10 border px-2 py-1 rounded-lg text-gray-700"
                                            >
                                                {formatTime(dep.departure)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Map;
