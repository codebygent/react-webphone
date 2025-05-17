import { create } from 'zustand';
import { NavigateFunction } from 'react-router-dom';

interface PhoneStore {
  isInCall: boolean;
  isIncomingCall: boolean;
  navigate: NavigateFunction | null;
  setInCall: (isInCall: boolean) => void;
  setIncomingCall: (isInCall: boolean) => void;
  setNavigate: (navigate: NavigateFunction) => void;
}

const usePhoneStore = create<PhoneStore>((set, get) => ({
  isInCall: false,
  isIncomingCall: false,
  navigate: null,
  setInCall: (f) => {
    set({ isInCall: f });
    if (f && get().navigate) {
      get().navigate('/phone');
    }
  },
  setIncomingCall: (f) => {
    set({ isIncomingCall: f });
    if (f && get().navigate) {
      get().navigate('/phone');
    }
  },
  setNavigate: (navigate) => set({ navigate }),
}));

export default usePhoneStore;