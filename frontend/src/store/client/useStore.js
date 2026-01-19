import { create } from 'zustand';
import createLineSlice from './createLineSlice';

const useStore = create((set, get) => ({
    ...createLineSlice(set, get),
}));

export default useStore;
