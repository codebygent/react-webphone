import { create } from 'zustand';

const usePhoneStore = create((set) => ({
  number: '',
  setNumber: (number) => set({ number }),
  clearNumber: () => set({ number: '' }),
}));

export default usePhoneStore;