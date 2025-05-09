import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useHistoryStore = create(
  persist(
    (set, get) => ({
      calls: [],
      addCall: (call) => {
        const newCall = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          duration: call.duration || 0,
          number: call.number,
          name: call.name || 'Unknown',
          direction: call.direction, // 'inbound' or 'outbound'
          status: call.status, // 'answered', 'missed', 'rejected', etc.
          recording: call.recording || null,
        };
        
        set((state) => ({
          calls: [newCall, ...state.calls]
        }));
      },
      
      removeCall: (id) => 
        set((state) => ({
          calls: state.calls.filter(call => call.id !== id)
        })),
      
      clearHistory: () => set({ calls: [] }),
      
      getCallById: (id) => {
        const state = get();
        return state.calls.find(call => call.id === id);
      },

      getFilteredCalls: (filter) => {
        const state = get();
        if (!filter) return state.calls;
        
        return state.calls.filter(call => 
          call.number.includes(filter) || 
          call.name.toLowerCase().includes(filter.toLowerCase())
        );
      }
    }),
    {
      name: 'call-history',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useHistoryStore;