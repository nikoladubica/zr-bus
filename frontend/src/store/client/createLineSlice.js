import { LINES_ROUTES, LINES_LOCATIONS, LINES_LOCATIONS_DEPARTURES } from '../../utils/api';
import { position } from '../../utils/enums';
import { getClosestStop } from '../../utils/helpers';

const loadFavourites = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem('favourites'));
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const createLineSlice = (set, get) => ({
    activeLine: 1,
    line: null,
    data: [],
    linesLocations: [],
    departures: [],
    selectedStopId: null,
    isLoading: false,
    error: null,
    geoError: null,
    currentLocation: {
        lat: null,
        lng: null,
    },
    mapCenter: position || { lat: null, lng: null },
    mapZoom: 13,
    sheetSnap: 'peek',
    allLinesLocations: [],
    closestStopInfo: null,
    closestStopDepartures: [],
    favouriteDepartures: {},
    favourites: loadFavourites(),

    addFavourite: (locationId) => {
        set((state) => {
            if (state.favourites.includes(locationId)) return {};
            const next = [...state.favourites, locationId];
            localStorage.setItem('favourites', JSON.stringify(next));
            return { favourites: next };
        });
    },
    removeFavourite: (locationId) => {
        set((state) => {
            const next = state.favourites.filter((id) => id !== locationId);
            localStorage.setItem('favourites', JSON.stringify(next));
            return { favourites: next };
        });
    },
    toggleFavourite: (locationId) => {
        const { addFavourite, removeFavourite, isFavourite } = get();
        isFavourite(locationId) ? removeFavourite(locationId) : addFavourite(locationId);
    },
    isFavourite: (locationId) => get().favourites.includes(locationId),

    snapSheetTo: (snap) => set({ sheetSnap: snap }),
    updateActiveLine: (newId) => set({ activeLine: newId }),
    resetActiveLine: () => set({ activeLine: 1 }),

    fetchAllLinesLocations: async () => {
        try {
            const response = await fetch(LINES_LOCATIONS);
            if (!response.ok) throw new Error(response.status);
            const data = await response.json();
            set({ allLinesLocations: data });
        } catch {
            // Silent failure — home sheet degrades gracefully
        }
    },

    fetchClosestStopDepartures: async () => {
        const { linesLocations, currentLocation } = get();
        const closest = getClosestStop(linesLocations, currentLocation);
        if (!closest) return;

        set({ closestStopInfo: closest });

        try {
            const results = await Promise.all(
                closest.entries.map((entry) =>
                    fetch(`${LINES_LOCATIONS_DEPARTURES}/${entry.id}`).then((r) => r.json()),
                ),
            );
            set({ closestStopDepartures: results });
        } catch {
            set({ closestStopDepartures: [] });
        }
    },

    fetchFavouriteDepartures: async () => {
        const { allLinesLocations, favourites } = get();
        if (!favourites.length || !allLinesLocations.length) return;

        const results = {};
        await Promise.all(
            favourites.map(async (locationId) => {
                const entries = allLinesLocations.filter((e) => e.locations?.id === locationId);
                if (!entries.length) return;
                try {
                    const deps = await Promise.all(
                        entries.map((e) =>
                            fetch(`${LINES_LOCATIONS_DEPARTURES}/${e.id}`).then((r) => r.json()),
                        ),
                    );
                    results[locationId] = deps;
                } catch {
                    results[locationId] = [];
                }
            }),
        );
        set({ favouriteDepartures: results });
    },
    fetchLines: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(LINES_ROUTES);
            if (!response.ok) throw new Error(response.status);
            const structured = await response.json();

            const mapped = structured.map((item, index) => {
                if (item?.line?.direction !== null) {
                    if (item?.line?.direction === 'A') {
                        return [
                            {
                                id: item?.id,
                                line_id: item?.line?.id,
                                number: item?.line?.number,
                                direction: item?.line?.direction,
                                hex_color: item?.line?.hex_color,
                                lat_name: item?.line?.lat_name,
                                cyr_name: item?.line?.cyr_name,
                                route: item?.route,
                            },
                            {
                                id: structured?.[index + 1]?.id,
                                line_id: structured?.[index + 1]?.line?.id,
                                number: structured?.[index + 1]?.line?.number,
                                direction: structured?.[index + 1]?.line?.direction,
                                hex_color: structured?.[index + 1]?.line?.hex_color,
                                lat_name: structured?.[index + 1]?.line?.lat_name,
                                cyr_name: structured?.[index + 1]?.line?.cyr_name,
                                route: structured?.[index + 1]?.route,
                            },
                        ];
                    }
                } else {
                    return [
                        {
                            id: item?.id,
                            line_id: item?.line?.id,
                            number: item?.line?.number,
                            direction: item?.line?.direction,
                            hex_color: item?.line?.hex_color,
                            lat_name: item?.line?.lat_name,
                            cyr_name: item?.line?.cyr_name,
                            route: item?.route,
                        },
                    ];
                }
            });

            set({ data: mapped.filter((element) => !!element), isLoading: false });
        } catch {
            set({ error: 'Nije moguće učitati linije. Proverite konekciju.', isLoading: false });
        }
    },
    fetchDepartures: async (ids, locationId) => {
        try {
            const results = await Promise.all(
                ids.map((id) => fetch(`${LINES_LOCATIONS_DEPARTURES}/${id}`).then((r) => r.json()))
            );
            set({ departures: results, selectedStopId: locationId });
        } catch {
            set({ departures: [], selectedStopId: locationId });
        }
    },
    fetchStopDepartures: async (locationId) => {
        const { allLinesLocations } = get();
        const entries = allLinesLocations.filter((e) => e.locations?.id === locationId);
        if (!entries.length) return;
        set({ selectedStopId: locationId, departures: [], sheetSnap: 'half' });
        try {
            const results = await Promise.all(
                entries.map((e) =>
                    fetch(`${LINES_LOCATIONS_DEPARTURES}/${e.id}`).then((r) => r.json()),
                ),
            );
            set({ departures: results });
        } catch {
            set({ departures: [] });
        }
    },
    clearSelectedStop: () => set({ departures: [], selectedStopId: null, sheetSnap: 'peek' }),
    fetchLinesLocations: async (lineId) => {
        const fullUrl = `${LINES_LOCATIONS}/${lineId}`;
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error(response.status);
            const printable = await response.json();

            set({ linesLocations: printable, isLoading: false });
            const { currentLocation, fetchClosestStopDepartures } = get();
            if (currentLocation?.lat && currentLocation?.lng) {
                fetchClosestStopDepartures();
            }
        } catch {
            set({ error: 'Nije moguće učitati stanice. Proverite konekciju.', isLoading: false });
        }
    },
    filterLineById: (id) => {
        const { data, fetchLinesLocations } = get();

        if (data?.length > 0) {
            const flatData = data.flatMap((it) => it);
            const filtered = flatData.find(
                (item) => parseInt(item?.line_id) === parseInt(id),
            );

            set({ activeLine: id, line: filtered || null });

            fetchLinesLocations(filtered?.line_id);
        }
    },
    getCurrentLocation: () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                set({
                    currentLocation: {
                        lat: position?.coords?.latitude || null,
                        lng: position?.coords?.longitude || null,
                    },
                    geoError: null,
                });
                const { linesLocations, fetchClosestStopDepartures } = get();
                if (linesLocations.length > 0) {
                    fetchClosestStopDepartures();
                }
            },
            (err) => {
                const messages = {
                    1: 'Lokacija nije dozvoljena.',
                    2: 'Lokacija nije dostupna.',
                    3: 'Istek vremena za lokaciju.',
                };
                set({ geoError: messages[err.code] ?? 'Greška pri određivanju lokacije.' });
            },
        );
    },
    getCurrentLocationWithRecenter: () => {
        const { currentLocation, getCurrentLocation } = get();

        getCurrentLocation();
        set({
            mapCenter: currentLocation,
            mapZoom: 15,
        });
    },
});

export default createLineSlice;
