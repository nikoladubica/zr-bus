import './App.css';

import Header from './components/Elements/Header/Header';
import Map from './components/Elements/Map/Map';

function App() {
    return (
        <div className="h-full w-screen overflow-x-hidden flex flex-col justify-center gap-8 bg-gray-800">
            <Header />

            <div className="w-full flex flex-col justify-center gap-8 p-8">
                <h1 className="text-left text-white font-light">
                    Najbrži način da nađeš autobus koji ti treba u Zrenjaninu
                </h1>

                <Map />

                <p className="read-the-docs">Explore the map</p>
            </div>
        </div>
    );
}

export default App;
