import { create } from 'zustand';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { User, AuthUser, WebRTCCredential } from '../types/user.types';
import api from './axios.config';
import { InitUi } from './uj-phone';
import { message } from 'antd';

const API_URL = (import.meta as any).env.VITE_API_URL;

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  userDetails: User | null;
  webrtcCredentials: WebRTCCredential | null;
  checkEmailPreLogin: (email: string) => Promise<any>;
  loginWithEmailPassword: (email: string, password: string) => Promise<any>;
  sendPinCode: (mobileNumber: string) => Promise<any>;
  loginWithMobilePincode: (contactNumber: string, pincode: string) => Promise<any>;
  recoverPassword: (email: string) => Promise<any>;
  logout: () => void;
  getUserDetails: () => Promise<any>;
  webrtcProvisioning: (extensionId: string) => Promise<any>;
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
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    userDetails: null as User | null,
    webrtcCredentials: null as WebRTCCredential | null,
  };

  if (state.isLoggedIn && state.token) {
    setTimeout(() => {
      useAuthStore.getState().getUserDetails();
      if (state.user) {
        useAuthStore.getState().webrtcProvisioning(state.user.extensionId);
      }
    }, 0);
  }
  return state;
};
export const useAuthStore = create<AuthState>((set, get) => ({
  ...getInitialState(),

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
      const payload = objectToFormData({
        email: email.trim(),
        password: CryptoJS.MD5(password).toString()
      });

      const response = await axios.post<any>(
        `${API_URL}/vmapi/user/login/loginwithgooglerecaptcha/`,
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
          email,
          role: data.role,
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
        get().getUserDetails();
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
        get().getUserDetails();
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
}));
