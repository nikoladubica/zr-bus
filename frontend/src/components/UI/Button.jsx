const Button = ({ icon = null, text = '', onClick = () => {} }) => {
    return (
        <div
            className="flex items-center gap-2 px-4 py-2.5 select-none cursor-pointer rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 text-white/90 hover:bg-white/20 transition-all duration-300"
            onClick={onClick}
        >
            {icon && (
                <img src={icon} alt={`${text} - Icon`} height={16} width={16} />
            )}
            <span className="text-sm font-medium">{text}</span>
        </div>
    );
};

export default Button;
