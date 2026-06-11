// API Routes
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const [LINES_ROUTES, LINES_LOCATIONS, LINES_LOCATIONS_DEPARTURES] = [
    `${API_URL}/lines-routes`,
    `${API_URL}/lines-locations`,
    `${API_URL}/lines-locations-departures`,
];
