// API Routes
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const [LINES_ROUTES, LINES_LOCATIONS, LINES_LOCATIONS_DEPARTURES] = [
    `${API_URL}/lines-routes`,
    `${API_URL}/lines-locations`,
    `${API_URL}/lines-locations-departures`,
];

export const AUTH_LOGIN = `${API_URL}/auth/login`;

export const LINES_API = `${API_URL}/lines`;
export const LOCATIONS_API = `${API_URL}/locations`;
export const LINES_LOCATIONS_API = `${API_URL}/lines-locations`;
export const DEPARTURES_API = `${API_URL}/lines-locations-departures`;

export const SURVEY_API = `${API_URL}/survey`;

export const INTERCITY_LINES_API = `${API_URL}/lines/intercity`;

export const authFetch = (url, options = {}) => {
    const token = localStorage.getItem('auth_token');
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers ?? {}),
        },
    });
};
