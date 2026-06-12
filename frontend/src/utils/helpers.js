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

const CYR_TO_LAT = {
    'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Ђ':'Đ','Е':'E','Ж':'Ž','З':'Z',
    'И':'I','Ј':'J','К':'K','Л':'L','Љ':'Lj','М':'M','Н':'N','Њ':'Nj',
    'О':'O','П':'P','Р':'R','С':'S','Т':'T','Ћ':'Ć','У':'U','Ф':'F','Х':'H',
    'Ц':'C','Ч':'Č','Џ':'Dž','Ш':'Š',
    'а':'a','б':'b','в':'v','г':'g','д':'d','ђ':'đ','е':'e','ж':'ž','з':'z',
    'и':'i','ј':'j','к':'k','л':'l','љ':'lj','м':'m','н':'n','њ':'nj',
    'о':'o','п':'p','р':'r','с':'s','т':'t','ћ':'ć','у':'u','ф':'f','х':'h',
    'ц':'c','ч':'č','џ':'dž','ш':'š',
};

export const normalizeForSearch = (str) => {
    if (!str) return '';
    const transliterated = str.split('').map((ch) => CYR_TO_LAT[ch] ?? ch).join('');
    return transliterated.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
};

export const getUniqueStops = (allLinesLocations) => {
    const byLocation = {};
    (allLinesLocations || []).forEach((entry) => {
        const locId = entry?.locations?.id;
        if (!locId) return;
        if (!byLocation[locId]) {
            byLocation[locId] = { locationId: locId, location: entry.locations, entries: [] };
        }
        byLocation[locId].entries.push(entry);
    });
    return Object.values(byLocation);
};

export const todayDayType = () => {
    const d = new Date().getDay();
    if (d === 0) return 'sunday';
    if (d === 6) return 'saturday';
    return 'workday';
};

export const findDirectRoutes = (fromLocationId, toLocationId, allLinesLocations) => {
    const fromEntries = allLinesLocations.filter(e => e.locations?.id === fromLocationId);
    const toEntries = allLinesLocations.filter(e => e.locations?.id === toLocationId);
    const results = [];
    fromEntries.forEach(fe => {
        const te = toEntries.find(te =>
            te.lines?.id === fe.lines?.id &&
            fe.stop_number < te.stop_number
        );
        if (te) results.push({ fromEntry: fe, toEntry: te });
    });
    return results;
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
