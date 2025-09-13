import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, PaginatedResponse } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { API_CONFIG } from '@/constants/network';

// Create axios instance with auto-detected URL
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
        ]);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Generic API functions
export const apiClient = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await api.get(url);
    return response.data;
  },

  post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await api.post(url, data);
    return response.data;
  },

  put: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await api.put(url, data);
    return response.data;
  },

  patch: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await api.patch(url, data);
    return response.data;
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await api.delete(url);
    return response.data;
  },

  getPaginated: async <T>(url: string, params?: Record<string, any>): Promise<PaginatedResponse<T>> => {
    const response = await api.get(url, { params });
    return response.data;
  },

  postFormData: async <T>(url: string, formData: FormData): Promise<ApiResponse<T>> => {
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Authentication API
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    return apiClient.post('/auth/login', credentials);
  },

  signup: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    return apiClient.post('/auth/signup', userData);
  },

  logout: async () => {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const response = await apiClient.post('/auth/logout', { refreshToken });
    
    // Clear tokens
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
    
    return response;
  },

  refreshToken: async (refreshToken: string) => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  verifyOtp: async (data: { phone: string; otp: string }) => {
    return apiClient.post('/auth/verify-otp', data);
  },

  resendOtp: async (phone: string) => {
    return apiClient.post('/auth/resend-otp', { phone });
  },

  forgotPassword: async (email: string) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (data: { token: string; password: string }) => {
    return apiClient.post('/auth/reset-password', data);
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return apiClient.post('/auth/change-password', data);
  },

  getProfile: async () => {
    return apiClient.get('/auth/profile');
  },

  updateProfile: async (data: any) => {
    return apiClient.patch('/auth/profile', data);
  },
};

// Listings API
export const listingsApi = {
  getListings: async (params?: Record<string, any>) => {
    return apiClient.getPaginated('/listings', params);
  },

  getListing: async (id: string) => {
    return apiClient.get(`/listings/${id}`);
  },

  createListing: async (data: FormData) => {
    return apiClient.postFormData('/listings', data);
  },

  updateListing: async (id: string, data: any) => {
    return apiClient.patch(`/listings/${id}`, data);
  },

  deleteListing: async (id: string) => {
    return apiClient.delete(`/listings/${id}`);
  },

  toggleFavorite: async (id: string) => {
    return apiClient.post(`/listings/${id}/favorite`);
  },

  getFavorites: async () => {
    return apiClient.getPaginated('/listings/favorites');
  },

  searchListings: async (params: Record<string, any>) => {
    return apiClient.getPaginated('/listings/search', params);
  },
};

// Offers API
export const offersApi = {
  getOffers: async (params?: Record<string, any>) => {
    return apiClient.getPaginated('/offers', params);
  },

  getOffer: async (id: string) => {
    return apiClient.get(`/offers/${id}`);
  },

  createOffer: async (data: any) => {
    return apiClient.post('/offers', data);
  },

  updateOfferStatus: async (id: string, status: string) => {
    return apiClient.patch(`/offers/${id}/status`, { status });
  },

  counterOffer: async (id: string, data: any) => {
    return apiClient.post(`/offers/${id}/counter`, data);
  },

  acceptOffer: async (id: string) => {
    return apiClient.post(`/offers/${id}/accept`);
  },

  rejectOffer: async (id: string) => {
    return apiClient.post(`/offers/${id}/reject`);
  },
};

// Chat API
export const chatApi = {
  getChats: async () => {
    return apiClient.getPaginated('/chat');
  },

  getChat: async (id: string) => {
    return apiClient.get(`/chat/${id}`);
  },

  getMessages: async (chatId: string, params?: Record<string, any>) => {
    return apiClient.getPaginated(`/chat/${chatId}/messages`, params);
  },

  sendMessage: async (data: any) => {
    return apiClient.post('/chat/messages', data);
  },

  markAsRead: async (chatId: string) => {
    return apiClient.patch(`/chat/${chatId}/read`);
  },
};

// Wallet API
export const walletApi = {
  getWallet: async () => {
    return apiClient.get('/wallet');
  },

  getTransactions: async (params?: Record<string, any>) => {
    return apiClient.getPaginated('/wallet/transactions', params);
  },

  topup: async (data: { amount: number; paymentMethod: string }) => {
    return apiClient.post('/wallet/topup', data);
  },

  withdraw: async (data: { amount: number; bankDetails: any }) => {
    return apiClient.post('/wallet/withdraw', data);
  },

  transfer: async (data: { recipientId: string; amount: number; description?: string }) => {
    return apiClient.post('/wallet/transfer', data);
  },
};

// Notifications API
export const notificationsApi = {
  getNotifications: async (params?: Record<string, any>) => {
    return apiClient.getPaginated('/notifications', params);
  },

  markAsRead: async (id: string) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return apiClient.patch('/notifications/read-all');
  },

  deleteNotification: async (id: string) => {
    return apiClient.delete(`/notifications/${id}`);
  },

  updatePushToken: async (token: string) => {
    return apiClient.post('/notifications/push-token', { token });
  },
};

export default api;