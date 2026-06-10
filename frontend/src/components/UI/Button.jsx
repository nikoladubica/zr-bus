const Button = ({ icon = null, text = '', onClick = () => {} }) => {
    return (
        <div
            className="flex items-center gap-2 px-4 py-2.5 select-none cursor-pointer rounded-2xl backdrop-blur-xl dark:bg-white/10 bg-black/5 dark:border-white/20 border-black/10 border dark:text-white/90 text-gray-800 dark:hover:bg-white/20 hover:bg-black/10 transition-all duration-300"
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
