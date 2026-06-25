import { useEffect, useMemo } from 'react';

import Card from '../UI/Card';
import Header from '../Elements/Header/Header';
import Footer from '../Elements/Footer/Footer';
import PageHead from '../Elements/PageHead';
import { useScript } from '../../context/ScriptContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useRetro } from '../../context/RetroContext.jsx';
import useStore from '../../store/client/useStore';

const About = () => {
    const { script } = useScript();
    const { theme } = useTheme();
    const { retro } = useRetro();
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
        <>
        <PageHead
            title="O nama — ZR Bus, gradski prevoz Zrenjanin (NetBus)"
            description="O projektu ZR Bus — gradski autobuski prevoz u Zrenjaninu, prevoznik NetBus."
            canonical="/o-nama"
        />
        <div
            className={`h-screen w-screen overflow-y-auto flex flex-col gap-0 ${retro ? 'retro-scroll' : (theme === 'dark' ? 'text-white' : 'text-gray-900')}`}
            style={retro
                ? { background: '#c0c0c0' }
                : {
                    background: theme === 'dark'
                        ? 'linear-gradient(135deg, oklch(27.8% 0.033 256.848) 0%, oklch(22% 0.04 260) 50%, oklch(18% 0.05 270) 100%)'
                        : 'linear-gradient(135deg, oklch(96% 0.01 256) 0%, oklch(93% 0.015 260) 50%, oklch(90% 0.02 270) 100%)',
                }
            }
        >
            <div className={retro ? '' : 'p-4'}>
                <Header />
            </div>
            <div className="flex-1 p-8 flex flex-col gap-6">
                <Card>
                    <h2 className={retro ? '' : 'text-lg font-semibold dark:text-white text-gray-900 mb-2'}>
                        {script === 'cyrillic' ? 'ЗР-Бус' : 'ZR-Bus'}
                    </h2>
                    <p className={retro ? '' : 'text-sm dark:text-white/70 text-gray-600'}>
                        {script === 'cyrillic'
                            ? 'Апликација за јавни градски превоз у Зрењанину. Приказује линије и станице на интерактивној мапи и омогућава преглед возног реда.'
                            : 'Aplikacija za javni gradski prevoz u Zrenjaninu. Prikazuje linije i stanice na interaktivnoj mapi i omogućava pregled voznog reda.'}
                    </p>
                </Card>

                <Card>
                    <h2 className={retro ? '' : 'text-lg font-semibold dark:text-white text-gray-900 mb-2'}>
                        {script === 'cyrillic' ? 'Линије' : 'Linije'}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {lines.map((line) => (
                            <div
                                key={line?.line_id}
                                className={retro
                                    ? 'win-btn flex items-center gap-2'
                                    : 'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm dark:bg-white/10 bg-black/5 dark:border-white/10 border-black/10 border'
                                }
                            >
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: line?.hex_color }}
                                />
                                <span className={retro ? '' : 'dark:text-white text-gray-900 font-medium'}>
                                    {line?.number}
                                </span>
                                <span className={retro ? '' : 'dark:text-white/70 text-gray-600'}>
                                    {script === 'cyrillic' ? line?.cyr_name : line?.lat_name}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h2 className={retro ? '' : 'text-lg font-semibold dark:text-white text-gray-900 mb-2'}>
                        {script === 'cyrillic' ? 'Извори података' : 'Izvori podataka'}
                    </h2>
                    <p className={retro ? '' : 'text-sm dark:text-white/70 text-gray-600'}>
                        {script === 'cyrillic'
                            ? 'Подаци о линијама и станицама биће наведени овде.'
                            : 'Podaci o linijama i stanicama biće navedeni ovde.'}
                    </p>
                </Card>
            </div>
            <Footer />
        </div>
        </>
    );
};

export default About;
