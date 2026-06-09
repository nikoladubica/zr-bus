import Map from '../Elements/Map/Map';
import Card from '../UI/Card';

import info from '../../assets/icons/info/info-gray.svg';

const Home = () => {
    return (
        <>
            <div className="relative inline-block p-px backdrop-blur-xl bg-white/10 rounded-3xl  animated-border">
                <div className="bg-gray-800 rounded-[23px] px-6 py-4">Trying Border Animation</div>
            </div>

            <h1 className="text-left text-white font-light">
                Najbrži način da nađeš autobus koji ti treba u Zrenjaninu
            </h1>

            <Map />

            <Card className="flex items-center justify-center gap-2">
                <img src={info} alt="Info icon" height={12} width={12} />
                <span className="text-sm text-gray-400">
                    Klikni na autobusku stanicu za više informacija • Odaberi
                    liniju da vidiš rutu
                </span>
            </Card>
        </>
    );
};

export default Home;
