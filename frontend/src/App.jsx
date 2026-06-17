import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import Home from './components/Pages/Home';
import About from './components/Pages/About';
import Timetable from './components/Pages/Timetable';
import Login from './components/Pages/Login';
import AdminRoute from './components/Elements/AdminRoute';
import './App.css';

const Admin = lazy(() => import('./components/Pages/Admin'));
const SurveyCapture = lazy(() => import('./components/Pages/SurveyCapture'));
const SurveyReview = lazy(() => import('./components/Pages/SurveyReview'));

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
                path="admin"
                element={
                    <AdminRoute>
                        <Suspense fallback={null}><Admin /></Suspense>
                    </AdminRoute>
                }
            />
            <Route
                path="admin/survey"
                element={
                    <AdminRoute>
                        <Suspense fallback={null}><SurveyCapture /></Suspense>
                    </AdminRoute>
                }
            />
            <Route
                path="admin/survey/:id"
                element={
                    <AdminRoute>
                        <Suspense fallback={null}><SurveyReview /></Suspense>
                    </AdminRoute>
                }
            />
        </Routes>
    );
};

export default App;
