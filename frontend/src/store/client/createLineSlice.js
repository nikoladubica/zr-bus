import { LINES_ROUTES, LINES_LOCATIONS } from '../../utils/api';

const createLineSlice = (set, get) => ({
    activeLine: 1,
    line: null,
    data: [],
    linesLocations: [],
    currentLocation: {
        lat: null,
        lng: null,
    },
    updateActiveLine: (newId) => set({ activeLine: newId }),
    resetActiveLine: () => set({ activeLine: 1 }),
    fetchLines: async () => {
        const response = await fetch(LINES_ROUTES);
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

        set({ data: mapped.filter((element) => !!element) });
    },
    fetchLinesLocations: async (lineId) => {
        const fullUrl = `${LINES_LOCATIONS}/${lineId}`;

        const response = await fetch(fullUrl);
        const printable = await response.json();

        // console.log("break: ", printable);

        set({ linesLocations: printable });
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
        // Request the current position when the component mounts and set it
        navigator.geolocation.getCurrentPosition((position) => {
            set({
                currentLocation: {
                    lat: position?.coords?.latitude || null,
                    lng: position?.coords?.longitude || null,
                },
            });
        });
    },
});

export default createLineSlice;
