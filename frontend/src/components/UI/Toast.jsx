import { createContext, useCallback, useContext, useRef, useState } from 'react';

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'success') => {
        const id = ++idRef.current;
        setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
        setTimeout(() => removeToast(id), 3000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);

const ToastContainer = () => {
    const { toasts } = useToast();

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`px-4 py-3 rounded-xl backdrop-blur-xl border text-sm font-medium shadow-2xl pointer-events-auto transition-all duration-300 ${
                        t.type === 'error'
                            ? 'bg-red-500/20 border-red-500/30 text-red-200'
                            : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
                    }`}
                >
                    {t.message}
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
