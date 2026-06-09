import { useCallback } from 'react';
import { useLocation, NavLink } from 'react-router';
import useStore from '../../../store/client/useStore';
import { useScript } from '../../../context/ScriptContext.jsx';

import Card from '../../UI/Card';
import Button from '../../UI/Button';

import logo from '../../../assets/zrbus_logo.svg';
import locate from '../../../assets/icons/locate/locate-white.svg';

const Header = () => {
    let location = useLocation();
    const { script, toggleScript } = useScript();

    const getCurrentLocationWithRecenter = useStore(
        (state) => state.getCurrentLocationWithRecenter,
    );

    const locateMeHandler = useCallback(() => {
        getCurrentLocationWithRecenter();

        document
            .querySelector('.MapContainer')
            .scrollIntoView({ behavior: 'smooth' });
    }, [getCurrentLocationWithRecenter]);

    return (
        <Card className="flex items-center justify-between h-23">
            <NavLink to="/">
                <img src={logo} alt="ZRBus logo" height={36} width={100} />
            </NavLink>

            <div className="flex items-center gap-2">
                <Button
                    text={script === 'latin' ? 'Ћир' : 'Lat'}
                    onClick={toggleScript}
                />

                {location.pathname === '/' && (
                    <Button
                        icon={locate}
                        text="Lociraj me"
                        onClick={locateMeHandler}
                    />
                )}
            </div>
        </Card>
    );
};

export default Header;
