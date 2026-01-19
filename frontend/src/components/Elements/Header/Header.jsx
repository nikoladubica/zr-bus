import logo from "../../../assets/zrbus_logo.svg"

function Header() {
    return (
        <header className="flex items-center justify-between px-8 py-3 border-b border-white/10 bg-gray-700">
            <img src={logo} alt="ZRBus logo" height={36} width={100} />

            <div className="flex items-center gap-8 text-white font-light">
                <span className="text-yellow-300 font-medium cursor-pointer hover:text-yellow-500 transition-colors">Nađi bus</span>
                <span className="cursor-pointer hover:text-gray-300 transition-colors">Linije</span>
                <span className="cursor-pointer hover:text-gray-300 transition-colors">Stajališta</span>
                <span className="cursor-pointer hover:text-gray-300 transition-colors">Polasci</span>
            </div>
        </header>
    )
}

export default Header
