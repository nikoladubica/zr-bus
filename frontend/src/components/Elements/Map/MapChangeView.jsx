import { useMap } from 'react-leaflet';

const MapChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
};

export default MapChangeView;
