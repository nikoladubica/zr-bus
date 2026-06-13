import { Routes, Route } from 'react-router';
import Home from './components/Pages/Home';
import About from './components/Pages/About';
import Timetable from './components/Pages/Timetable';
import Login from './components/Pages/Login';
import Admin from './components/Pages/Admin';
import AdminRoute from './components/Elements/AdminRoute';
import './App.css';

const PublicShell = ({ children }) => (
    <div className="h-screen w-screen overflow-hidden">{children}</div>
);

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<PublicShell><Home /></PublicShell>} />
            <Route path="o-nama" element={<PublicShell><About /></PublicShell>} />
            <Route path="red-voznje/:lineId?" element={<PublicShell><Timetable /></PublicShell>} />
            <Route path="prijava" element={<Login />} />
            <Route
                path="admin/*"
                element={
                    <AdminRoute>
                        <Admin />
                    </AdminRoute>
                }
            />
        </Routes>
    );
};

export default App;
