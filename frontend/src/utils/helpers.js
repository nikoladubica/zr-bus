const toRadian = (degree) => {
    return (degree * Math.PI) / 180;
};

const getDistance = (origin, destination) => {
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
