import { Navigate } from 'react-router';
import useStore from '../../store/client/useStore';

const AdminRoute = ({ children }) => {
    const isAuthenticated = useStore((s) => s.isAuthenticated);
    if (!isAuthenticated) return <Navigate to="/prijava" replace />;
    return children;
};

export default AdminRoute;
