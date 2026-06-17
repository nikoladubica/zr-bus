import { AUTH_LOGIN } from '../../utils/api';

const safeLocalStorage = typeof localStorage !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const createAuthSlice = (set) => ({
    token: safeLocalStorage.getItem('auth_token') ?? null,
    isAuthenticated: !!safeLocalStorage.getItem('auth_token'),
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
            safeLocalStorage.setItem('auth_token', access_token);
            set({ token: access_token, isAuthenticated: true, authLoading: false });
            return true;
        } catch {
            set({ authError: 'Greška pri povezivanju sa serverom.', authLoading: false });
            return false;
        }
    },

    logout: () => {
        safeLocalStorage.removeItem('auth_token');
        set({ token: null, isAuthenticated: false, authError: null });
    },
});

export default createAuthSlice;
