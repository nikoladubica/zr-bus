import { Routes, Route } from 'react-router';
import Home from './components/Pages/Home';
import About from './components/Pages/About';
import Timetable from './components/Pages/Timetable';
import './App.css';

const App = () => {
    return (
        <div className="h-screen w-screen overflow-hidden">
            <Routes>
                <Route index element={<Home />} />
                <Route path="o-nama" element={<About />} />
                <Route path="red-voznje/:lineId?" element={<Timetable />} />
            </Routes>
        </div>
    );
};

export default App;
