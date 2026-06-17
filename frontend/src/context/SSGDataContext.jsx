import { createContext, useContext } from 'react';

const SSGDataContext = createContext(null);

export const SSGDataProvider = ({ data, children }) => (
    <SSGDataContext.Provider value={data}>
        {children}
    </SSGDataContext.Provider>
);

export const useSSGData = () => useContext(SSGDataContext);

export default SSGDataContext;
