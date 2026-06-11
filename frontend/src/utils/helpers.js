const toRadian = (degree) => {
    return (degree * Math.PI) / 180;
};

export const getDistance = (origin, destination) => {
    const [lon1, lat1, lon2, lat2] = [
        toRadian(origin[1]),
        toRadian(origin[0]),
        toRadian(destination[1]),
        toRadian(destination[0]),
    ];

    const [deltaLat, deltaLon] = [lat2 - lat1, lon2 - lon1];

    const a =
        Math.pow(Math.sin(deltaLat / 2), 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);

    const c = 2 * Math.asin(Math.sqrt(a));

    const EARTH_RADIUS = 6371;

    return c * EARTH_RADIUS * 1000;
};

export const getClosestStation = (stations, currentLocation) => {
    let distances = [];

    stations.forEach((station) => {
        const [stopLocation, myLocation] = [
            [station?.locations?.lat, station?.locations?.lng],
            [currentLocation?.lat, currentLocation?.lng],
        ];

        const distance = getDistance(myLocation, stopLocation);

        distances.push({
            id: station?.id,
            distance,
            coords: [station?.locations?.lat, station?.locations?.lng],
        });
    });

    distances.sort((a, b) => {
        return a.distance - b.distance;
    });

    return distances?.[0] || null;
};

// Groups allLinesLocations by unique stop, returns the closest to currentLocation.
// Returns: { locationId, location, entries: [], distance } or null.
export const getClosestStop = (allLinesLocations, currentLocation) => {
    if (!currentLocation?.lat || !currentLocation?.lng || !allLinesLocations?.length) return null;

    const byLocation = {};
    allLinesLocations.forEach((entry) => {
        const locId = entry?.locations?.id;
        if (!locId) return;
        if (!byLocation[locId]) {
            byLocation[locId] = { locationId: locId, location: entry.locations, entries: [] };
        }
        byLocation[locId].entries.push(entry);
    });

    let closest = null;
    let minDist = Infinity;
    Object.values(byLocation).forEach((stop) => {
        const dist = getDistance(
            [currentLocation.lat, currentLocation.lng],
            [stop.location.lat, stop.location.lng],
        );
        if (dist < minDist) {
            minDist = dist;
            closest = { ...stop, distance: Math.round(dist) };
        }
    });

    return closest;
};

// Returns all unique stops sorted by distance, with distance in metres.
export const getNearbyStops = (allLinesLocations, currentLocation, limit = 10) => {
    if (!currentLocation?.lat || !currentLocation?.lng || !allLinesLocations?.length) return [];

    const byLocation = {};
    allLinesLocations.forEach((entry) => {
        const locId = entry?.locations?.id;
        if (!locId) return;
        if (!byLocation[locId]) {
            byLocation[locId] = { locationId: locId, location: entry.locations, entries: [] };
        }
        byLocation[locId].entries.push(entry);
    });

    return Object.values(byLocation)
        .map((stop) => ({
            ...stop,
            distance: Math.round(
                getDistance(
                    [currentLocation.lat, currentLocation.lng],
                    [stop.location.lat, stop.location.lng],
                ),
            ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
};
