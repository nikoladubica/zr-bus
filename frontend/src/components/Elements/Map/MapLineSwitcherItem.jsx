import { useCallback, useMemo } from 'react';
import useStore from '../../../store/client/useStore';
import arrow from '../../../assets/icons/arrow/arrow-right-white.svg';

const MapLineSwitcherItem = ({ item }) => {
    const activeLine = useStore((state) => state.activeLine);
    const filterLineById = useStore((state) => state.filterLineById);

    const activeLineHandler = useCallback(
        (id) => () => {
            filterLineById(id);
        },
        [filterLineById],
    );

    const circledRoute = useMemo(() => {
        return (
            <div
                className={`flex items-center gap-2 cursor-pointer rounded-md p-2 border border-gray-600 bg-gray-700 hover:bg-gray-600 transition-colors select-none ${activeLine === item?.[0]?.line_id
                    ? 'border-white bg-gray-600!'
                    : ''
                    }`}
                onClick={activeLineHandler(item?.[0]?.line_id)}
            >
                <div
                    className="h-4 w-3 rounded-sm"
                    style={{ backgroundColor: item?.[0]?.hex_color }}
                ></div>
                <p className="text-sm text-gray-100 whitespace-nowrap m-0">
                    <span className="font-medium">{item?.[0]?.number}</span>
                </p>
            </div>
        );
    }, [item, activeLine, activeLineHandler]);

    const directionRoute = useMemo(() => {
        const isActive = [item?.[0]?.line_id, item?.[1]?.line_id].includes(
            activeLine,
        );

        return (
            <div className="flex items-center">
                <div
                    className={`flex items-center gap-2 cursor-pointer rounded-md p-2 border border-gray-600 bg-gray-700 hover:bg-gray-600 transition-colors select-none ${isActive ? 'border-white bg-gray-600!' : ''
                        }`}
                    onClick={activeLineHandler(item?.[0]?.line_id)}
                >
                    <div
                        className="h-4 w-3 rounded-sm"
                        style={{ backgroundColor: item?.[0]?.hex_color }}
                    ></div>
                    <p className="text-sm text-gray-100 whitespace-nowrap m-0">
                        <span className="font-medium">{item?.[0]?.number}</span>
                    </p>
                </div>

                <div
                    className={`flex items-center gap-1 overflow-hidden transition-[width] duration-500 ${isActive ? 'w-[98.79px]' : 'w-0'
                        }`}
                >
                    <div
                        className={`ml-1 flex items-center gap-2 cursor-pointer rounded-md p-2 border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors select-none ${activeLine === item?.[0]?.line_id
                            ? 'border-white bg-gray-700!'
                            : ''
                            }`}
                        onClick={activeLineHandler(item?.[0]?.line_id)}
                    >
                        <p className="text-sm text-gray-100 whitespace-nowrap m-0">
                            <span className="font-medium">
                                {item?.[0]?.direction}
                            </span>
                        </p>

                        <img
                            src={arrow}
                            alt="Arrow"
                            className={
                                item?.[0]?.direction === 'B'
                                    ? 'rotate-90'
                                    : '-rotate-90'
                            }
                        />
                    </div>

                    <div
                        className={`flex items-center gap-2 cursor-pointer rounded-md p-2 border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors select-none ${activeLine === item?.[1]?.line_id
                            ? 'border-white bg-gray-700!'
                            : ''
                            }`}
                        onClick={activeLineHandler(item?.[1]?.line_id)}
                    >
                        <p className="text-sm text-gray-100 whitespace-nowrap m-0">
                            <span className="font-medium">
                                {item?.[1]?.direction}
                            </span>
                        </p>

                        <img
                            src={arrow}
                            alt="Arrow"
                            className={
                                item?.[1]?.direction === 'B'
                                    ? 'rotate-90'
                                    : '-rotate-90'
                            }
                        />
                    </div>
                </div>
            </div>
        );
    }, [item, activeLine, activeLineHandler]);

    return <>{item?.length === 1 ? circledRoute : directionRoute}</>;
}

export default MapLineSwitcherItem;
