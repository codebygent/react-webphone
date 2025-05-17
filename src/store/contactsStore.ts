import { create } from 'zustand';
import api from './axios.config';
import { Contact, Extension } from '../types/contact.types';


interface ContactsState {
  contacts: Contact[];
  teammates: Extension[];
  totalRecords: number;
  isLoading: boolean;
  error: string | null;
  fetchContacts: (pageNumber?: number, pageSize?: number) => Promise<void>;
  getFilteredContacts: (filter: string) => Contact[];
  getFilteredTeams: (filter: string) => Contact[];
  fetchTeammates: () => Promise<void>;
}


export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  teammates: [],
  data: [],
  totalRecords: 0,
  isLoading: false,
  error: null,


  getFilteredContacts: (filter: string) => {
    const state = get();
    if (!filter) return state.contacts;

    return state.contacts.filter(call =>
      call.fullName?.includes(filter) ||
      call.number?.toLowerCase().includes(filter.toLowerCase())
    );
  },

  getFilteredTeams: (filter: string) => {
    const state = get();
    let filtered: Extension[] = [];
    if (!filter) filtered = state.teammates;

    filtered = state.teammates.filter(call =>
      call.name?.includes(filter) ||
      call.extension?.toLowerCase().includes(filter.toLowerCase())
    );


    const formatted: Contact[] = filtered.map(ext => ({
      id: ext.extensionId,
      firstName: ext.name,
      fullName: ext.name,
      lastName: '',
      number: ext.extension,
      avatar: ext.avatar,
      status: ext.status
    } as Contact));

    return formatted;

  },

  fetchTeammates: async () => {
    try {
      set({ error: null });

      const response = await api.post('/vmapi/planupdate/getextensions');

      if (response.data.success) {
        set({
          teammates: response.data.extensions,
        });
      } else {
        set({ error: 'Failed to fetch teammates' });
      }
    } catch (error) {
      console.error('Error fetching teammates:', error);
      set({
        error: 'Failed to fetch teammates',
      });
    }
  },

  fetchContacts: async (pageNumber = 1, pageSize = 1000) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.post('/vmapi/contacts/list', {
        pageNumber,
        pageSize,
        sipNumber: '40797038',
        pattern: ''
      });

      if (response.data.success) {
        set({
          contacts: response.data.contacts,
          totalRecords: response.data.totalNumberOfRecords,
          isLoading: false
        });
      } else {
        set({ error: 'Failed to fetch contacts', isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      set({
        error: 'Failed to fetch contacts',
        isLoading: false
      });
    }
  }
}));