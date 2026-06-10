import { LINES_ROUTES, LINES_LOCATIONS, LINES_LOCATIONS_DEPARTURES } from '../../utils/api';
import { position } from '../../utils/enums';

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

    updateActiveLine: (newId) => set({ activeLine: newId }),
    resetActiveLine: () => set({ activeLine: 1 }),
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
    clearSelectedStop: () => set({ departures: [], selectedStopId: null }),
    fetchLinesLocations: async (lineId) => {
        const fullUrl = `${LINES_LOCATIONS}/${lineId}`;
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error(response.status);
            const printable = await response.json();

            set({ linesLocations: printable, isLoading: false });
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
