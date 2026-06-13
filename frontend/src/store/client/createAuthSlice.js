import { AUTH_LOGIN } from '../../utils/api';

const createAuthSlice = (set) => ({
    token: localStorage.getItem('auth_token') ?? null,
    isAuthenticated: !!localStorage.getItem('auth_token'),
    authLoading: false,
    authError: null,

    login: async (username, password) => {
        set({ authLoading: true, authError: null });
        try {
            const res = await fetch(AUTH_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            if (!res.ok) {
                set({ authError: 'Pogrešno korisničko ime ili lozinka.', authLoading: false });
                return false;
            }
            const { access_token } = await res.json();
            localStorage.setItem('auth_token', access_token);
            set({ token: access_token, isAuthenticated: true, authLoading: false });
            return true;
        } catch {
            set({ authError: 'Greška pri povezivanju sa serverom.', authLoading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        set({ token: null, isAuthenticated: false, authError: null });
    },
});

export default createAuthSlice;
