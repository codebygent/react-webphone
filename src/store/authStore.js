import { create } from 'zustand';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_URL = import.meta.env.VITE_API_URL;

const objectToFormData = (obj) => {
  const params = new URLSearchParams();
  Object.keys(obj).forEach(key => {
    params.append(key, obj[key]);
  });
  return params;
};

const getInitialState = () => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
  userDetails: null, // Add this line
});

export const useAuthStore = create((set, get) => ({
  ...getInitialState(),

  checkEmailPreLogin: async (email) => {
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

  loginWithEmailPassword: async (email, password) => {
    try {
      const payload = objectToFormData({
        email: email.trim(),
        password: CryptoJS.MD5(password).toString()
      });

      const response = await axios.post(
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
        set({
          user: {
            email,
            lang: data.lang,
            voiceMailbox: data.voiceMailbox,
            active: data.active,
            extensionId: data.extensionId,
          },
          token: data.token,
          isLoggedIn: true,
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          email,
          lang: data.lang,
          voiceMailbox: data.voiceMailbox,
          active: data.active,
          extensionId: data.extensionId,
        }));
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

  sendPinCode: async (mobileNumber) => {
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

  loginWithMobilePincode: async (contactNumber, pincode) => {
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
        set({
          user: {
            mobile: contactNumber,
            lang: data.lang,
            voiceMailbox: data.voiceMailbox,
            active: data.active,
            extensionId: data.extensionId,
          },
          token: data.token,
          isLoggedIn: true,
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          mobile: contactNumber,
          lang: data.lang,
          voiceMailbox: data.voiceMailbox,
          active: data.active,
          extensionId: data.extensionId,
        }));
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

  recoverPassword: async (email) => {
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
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No token found' };
      }

      const response = await axios.get(
        `${API_URL}/vmapi/user/getuser/`,
        {
          params: { token },
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const data = response.data;
      if (data.success) {
        set({ userDetails: data.user });
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Get user details error:', error);
      return { success: false, message: 'Server Error' };
    }
  },

  // // Utility functions
  // validateEmail: (email) => {
  //   const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //   return emailRegex.test(email);
  // },

  // validateMobileNumber: (number) => {
  //   const numberRegex = /^[+]?([0-9]*[\.\s\-\(\)]|[0-9]+){8,24}$/;
  //   return numberRegex.test(number);
  // }
}));
