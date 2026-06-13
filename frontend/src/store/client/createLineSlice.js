import { LINES_ROUTES, LINES_LOCATIONS, LINES_LOCATIONS_DEPARTURES } from '../../utils/api';
import { position } from '../../utils/enums';
import { getClosestStop, todayDayType, findDirectRoutes } from '../../utils/helpers';

const loadRecentSearches = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem('recentSearches'));
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
};

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
    isSearchOpen: false,
    searchQuery: '',
    recentSearches: loadRecentSearches(),
    searchMode: 'stanica',
    tripFrom: null,
    tripTo: null,
    tripResults: [],
    tripLoading: false,
    tripError: null,

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

    openSearch: (mode = 'stanica') => set({ isSearchOpen: true, sheetSnap: 'full', searchMode: mode }),
    closeSearch: () => set({ isSearchOpen: false, searchQuery: '' }),
    setSearchQuery: (q) => set({ searchQuery: q }),
    setSearchMode: (mode) => set({ searchMode: mode }),
    setTripFrom: (from) => set({ tripFrom: from, tripResults: [], tripError: null }),
    setTripTo: (to) => set({ tripTo: to, tripResults: [], tripError: null }),
    swapTripEndpoints: () => set((s) => ({ tripFrom: s.tripTo, tripTo: s.tripFrom, tripResults: [], tripError: null })),
    clearTrip: () => set({ tripFrom: null, tripTo: null, tripResults: [], tripError: null }),

    addRecentSearch: (item) => set((state) => {
        const next = [item, ...state.recentSearches.filter(
            (r) => !(r.type === item.type && r.id === item.id)
        )].slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(next));
        return { recentSearches: next };
    }),

    selectStopFromSearch: (locationId, lat, lng) => {
        const { fetchStopDepartures, closeSearch, addRecentSearch } = get();
        addRecentSearch({ type: 'stop', id: locationId });
        set({ mapCenter: { lat, lng }, mapZoom: 16 });
        fetchStopDepartures(locationId);
        closeSearch();
    },

    selectLineFromSearch: (lineId) => {
        const { filterLineById, closeSearch, addRecentSearch } = get();
        addRecentSearch({ type: 'line', id: lineId });
        filterLineById(lineId);
        closeSearch();
        set({ sheetSnap: 'peek' });
    },

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

    planTrip: async () => {
        const { tripFrom, tripTo, allLinesLocations, currentLocation } = get();
        if (!tripFrom || !tripTo) return;

        set({ tripLoading: true, tripError: null, tripResults: [] });

        try {
            let fromLocationId, fromLocation, walkToBoardMins;
            if (tripFrom.type === 'location') {
                const nearest = getClosestStop(allLinesLocations, { lat: tripFrom.lat, lng: tripFrom.lng });
                if (!nearest) { set({ tripError: 'no_route', tripLoading: false }); return; }
                fromLocationId = nearest.locationId;
                fromLocation = nearest.location;
                walkToBoardMins = Math.round(nearest.distance / 80);
            } else {
                fromLocationId = tripFrom.locationId;
                fromLocation = tripFrom.location;
                walkToBoardMins = 0;
            }

            const toLocationId = tripTo.locationId;
            const toLocation = tripTo.location;

            if (fromLocationId === toLocationId) {
                set({ tripError: 'same_stop', tripLoading: false });
                return;
            }

            const matches = findDirectRoutes(fromLocationId, toLocationId, allLinesLocations);
            if (!matches.length) {
                set({ tripError: 'no_route', tripLoading: false });
                return;
            }

            const dayType = todayDayType();
            const now = new Date();
            const currentMins = now.getHours() * 60 + now.getMinutes();
            const effectiveNow = currentMins + walkToBoardMins;

            const itineraries = [];

            await Promise.all(matches.map(async ({ fromEntry, toEntry }) => {
                try {
                    const [boardDeps, alightDeps] = await Promise.all([
                        fetch(`${LINES_LOCATIONS_DEPARTURES}/${fromEntry.id}`).then(r => r.json()),
                        fetch(`${LINES_LOCATIONS_DEPARTURES}/${toEntry.id}`).then(r => r.json()),
                    ]);

                    const timeToMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

                    const boardTimes = boardDeps
                        .filter(d => d.day_type === dayType)
                        .map(d => ({ mins: timeToMins(d.departure), fmt: d.departure.slice(0, 5) }))
                        .sort((a, b) => a.mins - b.mins);

                    const alightTimes = alightDeps
                        .filter(d => d.day_type === dayType)
                        .map(d => ({ mins: timeToMins(d.departure), fmt: d.departure.slice(0, 5) }))
                        .sort((a, b) => a.mins - b.mins);

                    if (!boardTimes.length || !alightTimes.length) return;

                    boardTimes
                        .filter(b => b.mins >= effectiveNow)
                        .slice(0, 5)
                        .forEach(board => {
                            const alight = alightTimes.find(a => a.mins > board.mins);
                            if (!alight) return;
                            const travelMins = alight.mins - board.mins;
                            itineraries.push({
                                lineId: fromEntry.lines.id,
                                lineNumber: fromEntry.lines.number,
                                lineColor: fromEntry.lines.hex_color,
                                lineLatName: fromEntry.lines.lat_name,
                                lineCyrName: fromEntry.lines.cyr_name,
                                direction: fromEntry.lines.direction,
                                boardStopId: fromLocationId,
                                boardLatName: fromLocation.lat_name,
                                boardCyrName: fromLocation.cyr_name,
                                boardLat: fromLocation.lat,
                                boardLng: fromLocation.lng,
                                alightStopId: toLocationId,
                                alightLatName: toLocation.lat_name,
                                alightCyrName: toLocation.cyr_name,
                                walkToBoard: walkToBoardMins,
                                boardTime: board.fmt,
                                alightTime: alight.fmt,
                                boardMins: board.mins,
                                travelMins,
                            });
                        });
                } catch {
                    // Skip this match on fetch failure
                }
            }));

            if (!itineraries.length) {
                set({ tripError: 'no_service', tripLoading: false });
                return;
            }

            itineraries.sort((a, b) => a.boardMins - b.boardMins);
            set({ tripResults: itineraries, tripLoading: false });
        } catch {
            set({ tripError: 'fetch_error', tripLoading: false });
        }
    },

    selectTripItinerary: (itinerary) => {
        const { filterLineById, closeSearch } = get();
        filterLineById(itinerary.lineId);
        set({ mapCenter: { lat: itinerary.boardLat, lng: itinerary.boardLng }, mapZoom: 16 });
        closeSearch();
    },
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
