import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const FitBoundsView = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length >= 2) {
            map.fitBounds(bounds, { padding: [40, 40] });
        }
    }, [map, bounds]);
    return null;
};

export default FitBoundsView;
