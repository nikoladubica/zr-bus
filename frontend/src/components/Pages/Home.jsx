import Map from '../Elements/Map/Map';
import Card from '../UI/Card';

import info from '../../assets/icons/info/info-gray.svg';

const Home = () => {
    return (
        <>
            <h1 className="text-left dark:text-white text-gray-900 font-light">
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
