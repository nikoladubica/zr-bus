import { useCallback } from 'react';
import useStore from '../../../store/client/useStore';
import { useScript } from '../../../context/ScriptContext.jsx';
import { useRetro } from '../../../context/RetroContext.jsx';

// Parses "Bagljaš – Centar": direction A → last segment, direction B → first segment
const destLabel = (name, direction) => {
    if (!name) return '';
    const parts = name.split(/\s*[–—-]\s*/);
    if (parts.length < 2) return name;
    return direction === 'A' ? parts[parts.length - 1].trim() : parts[0].trim();
};

const MapLineSwitcher = () => {
    const data = useStore((state) => state.data);
    const activeLine = useStore((state) => state.activeLine);
    const filterLineById = useStore((state) => state.filterLineById);
    const { script } = useScript();
    const { retro } = useRetro();

    const activeItem = data.find((item) =>
        item.some((d) => d.line_id === activeLine),
    );
    const isBidirectional = activeItem?.length === 2;

    const handleSelect = useCallback(
        (lineId) => () => filterLineById(lineId),
        [filterLineById],
    );

    if (data.length === 0) return null;

    return (
        <div className="flex flex-col gap-2">
            <p className={retro ? 'win-label text-left' : 'text-xs font-medium text-left uppercase tracking-wide dark:text-white/40 text-gray-400'}>
                {script === 'cyrillic' ? 'Линија: ' : 'Linija: '}
                <span className={retro ? '' : 'dark:text-white text-black'}>
                    {script === 'latin' ? activeItem?.[0]?.lat_name : activeItem?.[0]?.cyr_name}
                </span>
            </p>

            {/* Colour chip row */}
            <div className="flex items-center gap-1.5 overflow-x-auto md:overflow-x-visible md:flex-wrap pb-0.5 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {data.map((item) => {
                    const line = item[0];
                    const isActive = item.some((d) => d.line_id === activeLine);
                    return (
                        <button
                            key={line.line_id}
                            onClick={handleSelect(line.line_id)}
                            className={`flex items-center gap-1.5 shrink-0 transition-all select-none ${
                                retro
                                    ? isActive
                                        ? 'win-btn pressed text-white'
                                        : 'win-btn'
                                    : isActive
                                        ? 'text-white shadow-sm rounded-full px-3 py-2 text-sm font-semibold'
                                        : 'dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border dark:text-white text-gray-800 dark:hover:bg-white/10 hover:bg-black/10 rounded-full px-3 py-2 text-sm font-semibold'
                            }`}
                            style={isActive ? { backgroundColor: line.hex_color } : {}}
                        >
                            {!isActive && (
                                <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: line.hex_color }}
                                />
                            )}
                            {line.number}
                        </button>
                    );
                })}
            </div>

            {/* Direction toggle — only for active bidirectional lines */}
            {isBidirectional && activeItem && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    {activeItem.map((dir) => {
                        const isDirActive = dir.line_id === activeLine;
                        const name =
                            script === 'cyrillic' ? dir.cyr_name : dir.lat_name;
                        return (
                            <button
                                key={dir.line_id}
                                onClick={handleSelect(dir.line_id)}
                                className={`flex items-center gap-1 shrink-0 select-none ${
                                    retro
                                        ? `win-btn text-xs ${isDirActive ? 'pressed' : ''}`
                                        : `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                            isDirActive
                                                ? 'text-white border-transparent'
                                                : 'dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 dark:text-white/60 text-gray-500 dark:hover:bg-white/10 hover:bg-black/10'
                                        }`
                                }`}
                                style={isDirActive ? { backgroundColor: activeItem[0].hex_color } : {}}
                            >
                                <span className="opacity-60">→</span>
                                {destLabel(name, dir.direction)}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MapLineSwitcher;
