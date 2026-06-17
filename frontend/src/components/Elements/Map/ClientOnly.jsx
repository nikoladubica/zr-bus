import { useEffect, useState } from 'react';

const ClientOnly = ({ children, fallback = null }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return fallback;
    return typeof children === 'function' ? children() : children;
};

export default ClientOnly;
