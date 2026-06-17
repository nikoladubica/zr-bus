import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import Card from '../UI/Card';
import useStore from '../../store/client/useStore';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const login = useStore((s) => s.login);
    const authLoading = useStore((s) => s.authLoading);
    const authError = useStore((s) => s.authError);
    const isAuthenticated = useStore((s) => s.isAuthenticated);
    const navigate = useNavigate();

    if (isAuthenticated) return <Navigate to="/admin" replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ok = await login(username, password);
        if (ok) navigate('/admin', { replace: true });
    };

    return (
        <>
        <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-4">
            <Card className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-xl font-semibold dark:text-white text-gray-900">Admin prijava</h1>
                        <p className="text-sm dark:text-white/50 text-gray-500 mt-1">ZR-Bus administracija</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm dark:text-white/70 text-gray-700">Korisničko ime</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoComplete="username"
                                className="px-3 py-2 rounded-xl text-sm dark:bg-white/10 bg-black/5 dark:border-white/20 border-black/10 border dark:text-white text-gray-900 outline-none focus:dark:border-white/40 focus:border-black/30 transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm dark:text-white/70 text-gray-700">Lozinka</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="px-3 py-2 rounded-xl text-sm dark:bg-white/10 bg-black/5 dark:border-white/20 border-black/10 border dark:text-white text-gray-900 outline-none focus:dark:border-white/40 focus:border-black/30 transition-colors"
                            />
                        </div>

                        {authError && (
                            <p className="text-sm text-red-400">{authError}</p>
                        )}

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="px-4 py-2.5 rounded-2xl text-sm font-medium dark:bg-white/10 bg-black/5 dark:border-white/20 border-black/10 border dark:text-white/90 text-gray-800 dark:hover:bg-white/20 hover:bg-black/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {authLoading ? 'Prijava...' : 'Prijavi se'}
                        </button>
                    </form>
                </div>
            </Card>
        </div>
        </>
    );
};

export default Login;
