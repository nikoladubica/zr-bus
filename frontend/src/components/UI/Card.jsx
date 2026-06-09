const Card = ({ className, children }) => {
    return (
        <div
            className={`backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-4 md:p-6 shadow-2xl ${className || ''}`}
        >
            {children}
        </div>
    );
};

export default Card;
