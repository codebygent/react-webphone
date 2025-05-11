import { create } from 'zustand';
import api from './axios.config';

interface Contact {
  contactName: string;
  contactNumber: string;
  contactType: 'sip' | 'pstn';
}

interface ContactsState {
  contacts: Contact[];
  totalRecords: number;
  isLoading: boolean;
  error: string | null;
  fetchContacts: (pageNumber?: number, pageSize?: number) => Promise<void>;
}


export const useContactsStore = create<ContactsState>((set) => ({
  contacts: [],
  totalRecords: 0,
  isLoading: false,
  error: null,

  fetchContacts: async (pageNumber = 1, pageSize = 1000) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.post('/vmapi/contacts/calltransfercontacts/', {
        pageNumber,
        pageSize
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