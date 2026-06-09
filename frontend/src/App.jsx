import { Routes, Route } from 'react-router';

import Home from './components/Pages/Home';
import About from './components/Pages/About';

import Header from './components/Elements/Header/Header';
import Footer from './components/Elements/Footer/Footer';

import './App.css';

const App = () => {
    return (
        <div
            className="h-screen w-screen p-8 overflow-x-hidden overflow-y-auto flex flex-col justify-start gap-8 bg-gray-800"
            style={{
                background:
                    'linear-gradient(135deg, oklch(27.8% 0.033 256.848) 0%, oklch(22% 0.04 260) 50%, oklch(18% 0.05 270) 100%)',
            }}
        >
            <Header />

            <div className="w-full flex flex-col justify-center gap-8">
                <Routes>
                    <Route index element={<Home />} />
                    <Route path="o-nama" element={<About />} />

                    {/* Nested example */}
                    {/* <Route path="dashboard" element={<Dashboard />}>
                        <Route index element={<Home />} />
                        <Route path="settings" element={<Settings />} />
                    </Route> */}
                </Routes>
            </div>

            {/* <Footer /> */}
        </div>
    );
};

export default App;
