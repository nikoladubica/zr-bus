import { useEffect, useMemo } from 'react';

import Card from '../UI/Card';
import { useScript } from '../../context/ScriptContext.jsx';
import useStore from '../../store/client/useStore';

const About = () => {
    const { script } = useScript();
    const data = useStore((state) => state.data);
    const fetchLines = useStore((state) => state.fetchLines);

    useEffect(() => {
        if (data.length === 0) fetchLines();
    }, []);

    const lines = useMemo(
        () =>
            data
                .flatMap((group) => group)
                .filter(
                    (line, index, arr) =>
                        arr.findIndex((l) => l?.line_id === line?.line_id) === index,
                ),
        [data],
    );

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-2">
                    {script === 'cyrillic' ? 'ЗР-Бус' : 'ZR-Bus'}
                </h2>
                <p className="text-sm dark:text-white/70 text-gray-600">
                    {script === 'cyrillic'
                        ? 'Апликација за јавни градски превоз у Зрењанину. Приказује линије и станице на интерактивној мапи и омогућава преглед возног реда.'
                        : 'Aplikacija za javni gradski prevoz u Zrenjaninu. Prikazuje linije i stanice na interaktivnoj mapi i omogućava pregled voznog reda.'}
                </p>
            </Card>

            <Card>
                <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-2">
                    {script === 'cyrillic' ? 'Линије' : 'Linije'}
                </h2>
                <div className="flex flex-wrap gap-2">
                    {lines.map((line) => (
                        <div
                            key={line?.line_id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm dark:bg-white/10 bg-black/5 dark:border-white/10 border-black/10 border"
                        >
                            <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: line?.hex_color }}
                            />
                            <span className="dark:text-white text-gray-900 font-medium">
                                {line?.number}
                            </span>
                            <span className="dark:text-white/70 text-gray-600">
                                {script === 'cyrillic' ? line?.cyr_name : line?.lat_name}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>

            <Card>
                <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-2">
                    {script === 'cyrillic' ? 'Извори података' : 'Izvori podataka'}
                </h2>
                {/* TODO: add data source credits */}
                <p className="text-sm dark:text-white/70 text-gray-600">
                    {script === 'cyrillic'
                        ? 'Подаци о линијама и станицама биће наведени овде.'
                        : 'Podaci o linijama i stanicama biće navedeni ovde.'}
                </p>
            </Card>
        </div>
    );
};

export default About;
