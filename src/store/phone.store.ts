import { create } from 'zustand';

interface PhoneStore {
  number: string;
  name: string;
  setNumber: (number: string) => void;
  setName: (name: string) => void;
  clearNumberName: () => void;
}

const usePhoneStore = create<PhoneStore>((set) => ({
  number: '',
  name: '',
  setNumber: (number) => set({ number }),
  setName: (name) => set({ name }),
  clearNumberName: () => set({ number: '', name: '' }),
}));

export default usePhoneStore;