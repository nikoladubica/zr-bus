import { create } from 'zustand';
import createLineSlice from './createLineSlice';
import createAuthSlice from './createAuthSlice';

const useStore = create((set, get) => ({
    ...createLineSlice(set, get),
    ...createAuthSlice(set, get),
}));

export default useStore;
