import { useEffect, useMemo } from 'react';
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    LayersControl,
    Polyline,
    Pane,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import MapLineSwitcher from './MapLineSwitcher';
import MapChangeView from './MapChangeView';
import Card from '../../UI/Card';

import { tileLayers } from '../../../utils/enums';
import { getClosestStation } from '../../../utils/helpers';
import useStore from '../../../store/client/useStore';
import { useScript } from '../../../context/ScriptContext.jsx';

const Map = () => {
    const { script } = useScript();
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
        console.log(
            'break: ',
            getClosestStation(linesLocations, currentLocation),
        );
    }, [linesLocations, currentLocation]);

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

    return (
        <>
            <MapLineSwitcher />

            <h2 className="text-left font-bold">
                [Linija {line?.number}] {script === 'latin' ? line?.lat_name : line?.cyr_name}
            </h2>

            <Card className="p-2! md:p-2!">
                <div className="relative">
                <MapContainer
                    className="MapContainer w-full h-120 bg-light-gray-mild rounded-2xl"
                    center={mapCenter}
                    zoom={mapZoom}
                    scrollWheelZoom={true}
                >
                    <MapChangeView center={mapCenter} zoom={mapZoom} />
                    <LayersControl>
                        {tileLayers.map((layer, index) => (
                            <LayersControl.BaseLayer
                                key={`layer_${index}`}
                                checked={layer.selected}
                                name={layer.name}
                            >
                                {layer.subdomains.length > 0 ? (
                                    <TileLayer
                                        url={layer.url}
                                        subdomains={layer.subdomains}
                                    />
                                ) : (
                                    <TileLayer url={layer.url} />
                                )}
                            </LayersControl.BaseLayer>
                        ))}
                    </LayersControl>

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
                                    color: '#ffffff', // white ring
                                    weight: 2,
                                    fillColor: '#2286ff',
                                    fillOpacity: 1,
                                }}
                            />
                        </>
                    )}
                </MapContainer>

                {/* Stop info panel */}
                {selectedStop && (
                    <div className="absolute bottom-4 left-4 z-1000 w-72 rounded-2xl backdrop-blur-xl bg-black/60 border border-white/15 shadow-2xl p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold text-white text-sm leading-snug">
                                    {script === 'latin' ? selectedStop.location?.lat_name : selectedStop.location?.cyr_name}
                                </p>
                                <p className="text-xs text-white/40 mt-0.5">
                                    Stanica {selectedStop.entries.map((e) => e.stop_number).join(' / ')}
                                </p>
                            </div>
                            <button
                                onClick={clearSelectedStop}
                                className="text-white/30 hover:text-white/70 transition-colors text-base leading-none mt-0.5 shrink-0"
                            >
                                ✕
                            </button>
                        </div>
                        {departures.some((g) => g.length > 0) && (
                            <>
                                <div className="my-3 border-t border-white/10" />
                                {departures.map((group, groupIndex) => (
                                    <div key={groupIndex}>
                                        {groupIndex > 0 && (
                                            <div className="my-2 border-t border-white/10" />
                                        )}
                                        <div className="flex flex-wrap gap-1.5">
                                            {group.map((dep) => (
                                                <span
                                                    key={dep.id}
                                                    className="text-xs bg-white/10 border border-white/10 px-2 py-1 rounded-lg text-white/80"
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
            </Card>
        </>
    );
};

export default Map;
