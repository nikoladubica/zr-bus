import { useNavigate } from 'react-router';
import Card from '../UI/Card';
import useStore from '../../store/client/useStore';

const Admin = () => {
    const logout = useStore((s) => s.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/prijava', { replace: true });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold dark:text-white text-gray-900">Admin panel</h1>
                        <p className="text-sm dark:text-white/50 text-gray-500 mt-1">ZR-Bus administracija</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-xl text-sm dark:bg-white/10 bg-black/5 dark:border-white/20 border-black/10 border dark:text-white/70 text-gray-700 dark:hover:bg-white/20 hover:bg-black/10 transition-all duration-300"
                    >
                        Odjava
                    </button>
                </div>

                <Card>
                    <p className="text-sm dark:text-white/60 text-gray-500">
                        Admin sadržaj dolazi u TICKET-023.
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default Admin;
