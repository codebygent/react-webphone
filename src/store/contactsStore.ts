import { create } from 'zustand';
import api from './axios.config';

interface Contact {
  contactName: string;
  contactNumber: string;
  contactType: 'sip' | 'pstn';
}

interface ContactsState {
  contacts: Contact[];
  teammates: Contact[];
  data: Contact[];
  totalRecords: number;
  isLoading: boolean;
  error: string | null;
  fetchContacts: (pageNumber?: number, pageSize?: number) => Promise<void>;
  getFilteredContacts: (filter: string) => Contact[];
  getFilteredTeams: (filter: string) => Contact[];
}


export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  teammates:[],
  data: [],
  totalRecords: 0,
  isLoading: false,
  error: null,


  getFilteredContacts: (filter: string) => {
    const state = get();
    if (!filter) return state.contacts;

    return state.contacts.filter(call =>
      call.contactName?.includes(filter) ||
      call.contactNumber?.toLowerCase().includes(filter.toLowerCase())
    );
  },
  
  getFilteredTeams: (filter: string) => {
    const state = get();
    if (!filter) return state.teammates;

    return state.teammates.filter(call =>
      call.contactName?.includes(filter) ||
      call.contactNumber?.toLowerCase().includes(filter.toLowerCase())
    );
  },

  fetchContacts: async (pageNumber = 1, pageSize = 1000) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.post('/vmapi/contacts/calltransfercontacts/', {
        pageNumber,
        pageSize
      });

      if (response.data.success) {
        set({
          data: response.data.contacts,
          contacts: response.data.contacts.filter(contact => contact.contactType === 'sip'),
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