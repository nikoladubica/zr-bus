import MapLineSwitcherItem from './MapLineSwitcherItem';
import useStore from '../../../store/client/useStore';

const MapLineSwitcher = () => {
    const data = useStore((state) => state.data);

    return (
        <div className="flex flex-col gap-2">
            <p className="text-lg text-left">Izaberi liniju:</p>
            <div className="flex items-center gap-1">
                {data.length > 0 &&
                    data.map((item, index) => (
                        <MapLineSwitcherItem
                            key={item?.id || index}
                            item={item}
                        />
                    ))}
            </div>
        </div>
    );
}

export default MapLineSwitcher;
