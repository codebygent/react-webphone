import { create } from 'zustand';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { User, AuthUser, WebRTCCredential, BusinessNumber } from '../types/user.types';
import api from './axios.config';
import { InitUi } from './uj-phone';
import { message } from 'antd';

const API_URL = (import.meta as any).env.VITE_API_URL;

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: string | null;
  isLoggedIn: boolean;
  userDetails: User | null;
  activeBusinessNumber: BusinessNumber | null;
  businessNumbers: BusinessNumber[] | null;
  webrtcCredentials: WebRTCCredential | null;
  checkEmailPreLogin: (email: string) => Promise<any>;
  loginWithEmailPassword: (email: string, password: string) => Promise<any>;
  sendPinCode: (mobileNumber: string) => Promise<any>;
  loginWithMobilePincode: (contactNumber: string, pincode: string) => Promise<any>;
  recoverPassword: (email: string) => Promise<any>;
  setoutgoingbusinessnumber: (businessNumberId: string) => Promise<any>;
  logout: () => void;
  getUserDetails: () => Promise<any>;
  setStatus: (status: string) => void;
  webrtcProvisioning: (extensionId: string) => Promise<any>;
  getBusinessNumbers: (extensionId: string) => Promise<any>;
  initializeUserServices: () => Promise<void>;
}

const objectToFormData = (obj: Record<string, string>) => {
  const params = new URLSearchParams();
  Object.keys(obj).forEach(key => {
    params.append(key, obj[key]);
  });
  return params;
};



const getInitialState = () => {
  const state = {
    user: JSON.parse(localStorage.getItem('user') || 'null') as AuthUser | null,
    token: localStorage.getItem('token') || null,
    status: 'available',
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    userDetails: null as User | null,
    webrtcCredentials: JSON.parse(localStorage.getItem('webrtcCredentials') || 'null') as WebRTCCredential | null,
    activeBusinessNumber: null as BusinessNumber | null,
    businessNumbers: [] as BusinessNumber[],
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
    } catch (error) {
      console.error('Failed to initialize user services:', error);
      message.error('Failed to initialize user services');
    }
  },

  setStatus: (status: string) => { set({ status }); },

  checkEmailPreLogin: async (email: string) => {
    try {
      const payload = objectToFormData({
        email: email.trim()
      });

      const response = await axios.post(
        `${API_URL}/vmapi/user/login/doprelogin/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Pre-login check error:', error);
      return { success: false, message: 'Server Error' };
    }
  },

  loginWithEmailPassword: async (email: string, password: string) => {
    try {
      const payload = {
        email: email.trim(),
        password: password
      };

      const response = await axios.post<any>(
        `https://pbx.kasookoo.com/api/v1/users/provision`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'bb2540d6-2458-4d08-ae6c-faaa98b8d9cc',
          }
        }
      );

      let data = response.data;
      if (data.success) {
        const ext = data.extension_data;

        // Map to AuthUser
        const userData: AuthUser = {
          email: email,
          role: ext.role,
          lang: ext.extension_language || ext.lang,
          voiceMailbox: ext.voiceMailbox,
          active: ext.enabled === 'true' || ext.active,
          extensionId: ext.extensionId || ext.extension_uuid,
          permissions: ext.permissions,
        };

        // Map to WebRTCCredential
        const webrtcCredentials: WebRTCCredential = {
          wsDomain: 'wss://' + ext.accountcode,
          password: ext.password,
          sipDomain: ext.accountcode || '',
          mobileNumber: '', // Not present in extension_data
          userDisplayName: ext.effective_caller_id_name,
          transport: '', // Not present in extension_data
          username: ext.extension,
        };

        // Optionally map to Extension (from contact.types.ts) if needed elsewhere
        // const extensionObj: Extension = {
        //   extensionTypeId: '',
        //   extension: ext.extension,
        //   role: ext.role,
        //   formattedMobileNumber: '',
        //   extensionTypeName: '',
        //   mobileNumber: '',
        //   extensionTypePricePlan: 0,
        //   callLimit: ext.limit_max ? parseInt(ext.limit_max) : 0,
        //   registered: false,
        //   userAgent: '',
        //   isAdmin: false,
        //   avatar: '',
        //   type: '',
        //   agentStatus: undefined as any,
        //   sipUserName: ext.extension,
        //   countryPhoneCode: '',
        //   remainingCallLimit: 0,
        //   pinCode: null,
        //   name: ext.effective_caller_id_name,
        //   extensionId: ext.extensionId || ext.extension_uuid,
        //   email: ext.description,
        //   status: ext.enabled,
        //   isCallRecordingEnabled: false,
        // };

        set({
          user: userData,
          token: ext.token,
          isLoggedIn: true,
          webrtcCredentials: webrtcCredentials
        });

        localStorage.setItem('token', ext.token);
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

  sendPinCode: async (mobileNumber: string) => {
    try {
      const payload = objectToFormData({
        mobileNumber: mobileNumber.trim()
      });

      const response = await axios.post(
        `${API_URL}/vmapi/user/login/sendpincodeviasms/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Send PIN code error:', error);
      return { success: false, message: 'Server Error' };
    }
  },

  loginWithMobilePincode: async (contactNumber: string, pincode: string) => {
    try {
      const payload = objectToFormData({
        userName: contactNumber.trim(),
        pinCode: pincode.trim()
      });

      const response = await axios.post(
        `${API_URL}/vmapi/user/login/loginwithpincode/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );

      const data = response.data;
      if (data.success) {
        const userData: AuthUser = {
          mobile: contactNumber,
          lang: data.lang,
          voiceMailbox: data.voiceMailbox,
          active: data.active,
          extensionId: data.extensionId,
          permissions: data.permissions,
        };

        set({
          user: userData,
          token: data.token,
          isLoggedIn: true,
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        await get().initializeUserServices();
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Mobile login error:', error);
      return { success: false, message: 'Server Error' };
    }
  },

  recoverPassword: async (email: string) => {
    try {
      const payload = objectToFormData({
        email: email.trim()
      });

      const response = await axios.post(
        `${API_URL}/vmapi/user/password/reset/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Password recovery error:', error);
      return { success: false, message: 'Server Error' };
    }
  },

  setoutgoingbusinessnumber: async (businessNumberId: string) => {
    try {
      const extensionId = get().user?.extensionId;
      const response = await api.post(
        `${API_URL}/vmapi/planupdate/setoutgoingbusinessnumber/`,
        {
          businessNumberId,
          agentExtensionId: extensionId
        }
      );
      if (!response.data.success) {
        message.error("Set primary business number error.");
      } else {
        message.success("Set primary business number successfully.");
        await get().getBusinessNumbers(extensionId || '');
      }
      return response.data;
    } catch (error) {
      message.error("Set primary business number error.");
      console.error('Set primary business number error:', error);
      return { success: false, message: 'Server Error' };
    }
  },

  logout: () => {
    set({ user: null, token: null, isLoggedIn: false });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  },

  getUserDetails: async () => {
    try {
      const response = await api.get('/vmapi/user/getuser/');
      const data = response.data;
      if (data.success) {
        set({ userDetails: data.user });
      } else {
      }
    } catch (error) {
      console.error('Get user details error:', error);
    }
  },

  webrtcProvisioning: async (extensionId: string) => {
    try {
      const response = await api.get('/vmapi/user/webrtcProvisioning/', {
        params: { extensionId }
      });

      const data = response.data.credential;
      if (data) {
        set({ webrtcCredentials: data });
        data.extensionId = extensionId
        InitUi(data);
      } else {
        message.error("WebRTC provisioning error.")
      }
    } catch (error) {
      console.error('WebRTC provisioning error:', error);
    }
  },

  getBusinessNumbers: async (extensionId: string) => {
    try {
      const response = await api.post('/vmapi/planupdate/getuserbusinessnumbers/', {
        agentExtensionId: extensionId
      });

      const data = response.data.businessNumberList;
      if (data) {
        const activeBusinessNumber = data.find((num: BusinessNumber) => num.isPrimary) || null;
        console.log('Business numbers retrieved:', data);
        console.log('Active business number:', activeBusinessNumber);
        set({
          activeBusinessNumber,
          businessNumbers: data
        });
      } else {
        message.error("Business numbers retrieval error.")
      }
    } catch (error) {
      console.error('Business numbers retrieval error:', error);
    }
  },
}));
