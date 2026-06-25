import { useRetro } from '../../context/RetroContext.jsx';

const Card = ({ className, children }) => {
    const { retro } = useRetro();

    if (retro) {
        return (
            <div className={`retro-card ${className || ''}`}>
                {children}
            </div>
        );
    }

    return (
        <div className={`backdrop-blur-xl dark:bg-white/10 bg-black/5 rounded-3xl dark:border-white/20 border-black/10 border p-4 md:p-6 shadow-2xl ${className || ''}`}>
            {children}
        </div>
    );
};

export default Card;
