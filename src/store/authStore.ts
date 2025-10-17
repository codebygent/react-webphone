import { create } from 'zustand';
import { AuthUser, WebRTCCredential } from '../types/user.types';
import { UserStatusResponse, AgentStatusMapping } from '../types/agent-status.types';
import api from './axios.config';
import { InitUi } from './uj-phone';
import { message } from 'antd';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: string | null;
  userStatus: UserStatusResponse | null;
  agentStatusMapping: AgentStatusMapping | null;
  isLoggedIn: boolean;
  webrtcCredentials: WebRTCCredential | null;
  loginWithEmailPassword: (email: string, password: string) => Promise<any>;
  logout: () => void;
  setStatus: (status: string) => void;
  initializeUserServices: () => Promise<void>;
  getUserStatusByExtension: (extension: string) => Promise<UserStatusResponse>;
  executeAgentAction: (action: string, agent: string, extension?: string, pause?: string, server?: string) => Promise<any>;
  getAgentStatusMapping: () => Promise<AgentStatusMapping>;
}

const getInitialState = () => {
  const state = {
    user: JSON.parse(localStorage.getItem('user') || 'null') as AuthUser | null,
    token: localStorage.getItem('token') || null,
    status: 'available',
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    webrtcCredentials: JSON.parse(localStorage.getItem('webrtcCredentials') || 'null') as WebRTCCredential | null,
    userStatus: null,
    agentStatusMapping: null,
  };

  if (state.isLoggedIn && state.token) {
    setTimeout(() => {
      useAuthStore.getState().initializeUserServices();
    }, 0);
  }
  return state;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...getInitialState(),


  initializeUserServices: async () => {
    try {
      InitUi(get().webrtcCredentials);
      let ext = get()?.user?.extension;
      if (ext) {
        await get().getUserStatusByExtension(ext);
        await get().getAgentStatusMapping();
      }
    } catch (error) {
      console.error('Failed to initialize user services:', error);
      message.error('Failed to initialize user services');
    }
  },

  setStatus: (status: string) => { set({ status }); },

  loginWithEmailPassword: async (email: string, password: string) => {
    try {

      const response = await api.post(`/api/v1/users/provision`, {
        email: email.trim(),
        password: password
      });

      let data = response.data;
      if (data.success) {
        const ext = data.extension_data;

        // Map to AuthUser
        const userData: AuthUser = ext;

        // Map to WebRTCCredential
        const webrtcCredentials: WebRTCCredential = {
          wsDomain: 'wss://' + ext.accountcode + ':7443',
          password: ext.password,
          sipDomain: ext.accountcode || '',
          mobileNumber: '', // Not present in extension_data
          userDisplayName: ext.effective_caller_id_name,
          transport: '', // Not present in extension_data
          username: ext.extension,
        };

        set({
          user: userData,
          token: ext.token,
          isLoggedIn: true,
          webrtcCredentials: webrtcCredentials
        });

        localStorage.setItem('token', ext.token || "No Token Needed");
        localStorage.setItem('webrtcCredentials', JSON.stringify(webrtcCredentials));
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        await get().initializeUserServices();
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Server Error' };
    }
  },


  getUserStatusByExtension: async (extension: string) => {
    try {
      const response = await api.get(`/api/v1/users/user-status`, {
        params: { extension }
      });
      const userStatusResponse = response.data as UserStatusResponse;
      set({ userStatus: userStatusResponse });
      return userStatusResponse;
    } catch (error) {
      console.error('Get user status error:', error);
      message.error('Failed to get user status');
      return { success: false, message: 'Server Error' } as UserStatusResponse;
    }
  },

  executeAgentAction: async (action: string, agent: string, pause?: string, server?: string) => {
    try {
      const response = await api.post('/api/v1/users/agent-action', {
        action,
        agent,
        extension: get().user?.extension || '',
        pause: pause || '',
        server: server || ''
      });
      return response.data;
    } catch (error) {
      console.error('Execute agent action error:', error);
      message.error('Failed to execute agent action');
      return { success: false, message: 'Server Error' };
    }
  },

  getAgentStatusMapping: async () => {
    try {
      const response = await api.get('/api/v1/users/agent-status-mapping');
      const agentStatusMapping = response.data as AgentStatusMapping;
      set({ agentStatusMapping });
      return agentStatusMapping;
    } catch (error) {
      console.error('Get agent status mapping error:', error);
      message.error('Failed to get agent status mapping');
      return { success: false, message: 'Server Error' } as AgentStatusMapping;
    }
  },


  logout: () => {
    set({ user: null, token: null, isLoggedIn: false });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  },


}));
