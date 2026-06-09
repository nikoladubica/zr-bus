import { useEffect, useMemo, useState } from 'react';
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
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

const Map = () => {
    const data = useStore((state) => state.data);
    const line = useStore((state) => state.line);
    const linesLocations = useStore((state) => state.linesLocations);
    const currentLocation = useStore((state) => state.currentLocation);
    const mapCenter = useStore((state) => state.mapCenter);
    const mapZoom = useStore((state) => state.mapZoom);
    const fetchLines = useStore((state) => state.fetchLines);
    const filterLineById = useStore((state) => state.filterLineById);
    const getCurrentLocation = useStore((state) => state.getCurrentLocation);

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
                [Linija {line?.number}] {line?.lat_name}
            </h2>

            <Card className="p-2! md:p-2!">
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
                    {linesLocations.length > 0 && (
                        <Pane name="stopsPane" style={{ zIndex: 650 }}>
                            {Array.from(linesLocations).map((marker, index) => (
                                <CircleMarker
                                    key={`marker_${index}`}
                                    center={[
                                        marker?.locations?.lat,
                                        marker?.locations?.lng,
                                    ]}
                                    radius={6}
                                    pathOptions={{
                                        color: line?.hex_color || '#404040',
                                        fillColor: '#ffffff',
                                        fillOpacity: 1,
                                    }}
                                    eventHandlers={{
                                        mouseover: (event) =>
                                            event.target.openPopup(),
                                        mouseout: (event) =>
                                            event.target.closePopup(),
                                    }}
                                >
                                    <Pane
                                        key={`key_popupPane_${index}`}
                                        name={`popupPane_${index}`}
                                        style={{ zIndex: 651 }}
                                    >
                                        <Popup>
                                            Stanica broj: {marker?.stop_number}
                                            <br />
                                            <span className="font-medium">
                                                {marker?.locations?.lat_name}
                                            </span>
                                        </Popup>
                                    </Pane>
                                </CircleMarker>
                            ))}
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
            </Card>
        </>
    );
};

export default Map;
