import { NavLink } from 'react-router';

import Card from '../../UI/Card';

const Footer = () => {
    return (
        <Card className="flex items-center justify-between">
            <span className="text-sm dark:text-white/50 text-gray-400">
                © 2025 ZR-Bus
            </span>
            <NavLink
                to="/o-nama"
                className="text-sm dark:text-white/70 text-gray-600 hover:dark:text-white hover:text-gray-900 transition-colors"
            >
                O nama
            </NavLink>
        </Card>
    );
};

export default Footer;
