import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import { Call, CallHistoryStore } from '../types/callhistory.types';

type HistoryStorePersist = (
  config: StateCreator<CallHistoryStore>,
  options: PersistOptions<CallHistoryStore>
) => StateCreator<CallHistoryStore>;

const useHistoryStore = create<CallHistoryStore>()(
  (persist as HistoryStorePersist)(
    (set, get) => ({
      calls: [],
      addCall: (call: Partial<Call>) => {
        const newCall: Call = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          duration: call.duration ?? 0,
          number: call.number,
          name: call.name,
          direction: call.direction ?? 'inbound',
          status: call.status ?? 'Missed',
          recording: call.recording ?? null,
        };
        
        set((state) => ({
          calls: [newCall, ...state.calls]
        }));
      },
      
      removeCall: (id: number) => 
        set((state) => ({
          calls: state.calls.filter(call => call.id !== id)
        })),
      
      clearHistory: () => set({ calls: [] }),
      
      getCallById: (id: number) => {
        const state = get();
        return state.calls.find(call => call.id === id);
      },

      getFilteredCalls: (filter: string) => {
        const state = get();
        if (!filter) return state.calls;
        
        return state.calls.filter(call => 
          call.number?.includes(filter) || 
          call.name?.toLowerCase().includes(filter.toLowerCase())
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