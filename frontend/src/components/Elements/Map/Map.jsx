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
    const selectedStopId = useStore((state) => state.selectedStopId);
    const fetchStopDepartures = useStore((state) => state.fetchStopDepartures);
    const isLoading = useStore((state) => state.isLoading);
    const error = useStore((state) => state.error);
    const geoError = useStore((state) => state.geoError);
    const fetchAllLinesLocations = useStore((state) => state.fetchAllLinesLocations);

    useEffect(() => {
        fetchLines();
    }, [fetchLines]);

    useEffect(() => {
        getCurrentLocation();
    }, [getCurrentLocation]);

    useEffect(() => {
        filterLineById(1);
    }, [data, filterLineById]);

    useEffect(() => {
        fetchAllLinesLocations();
    }, [fetchAllLinesLocations]);

    const uniqueStops = useMemo(() => {
        const byLocation = {};
        linesLocations.forEach((marker) => {
            const locId = marker?.locations?.id;
            if (!byLocation[locId]) {
                byLocation[locId] = { locationId: locId, location: marker.locations, entries: [] };
            }
            byLocation[locId].entries.push({ id: marker.id, stop_number: marker.stop_number, lines: marker.lines });
        });
        return Object.values(byLocation).map((s) => ({
            ...s,
            entries: s.entries.sort((a, b) => a.stop_number - b.stop_number),
        }));
    }, [linesLocations]);

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
                zoomControl={false}
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
                                        click: () => fetchStopDepartures(stop.locationId),
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

        </div>
    );
};

export default Map;
