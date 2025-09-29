import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { type OutgoingRequest, type IncomingRequest, type LoginRequest, type RegisterRequest, type ResponseError, type UpdateUserRequest, type UserResponse, type ResponseSuccess } from '@/types/user';
import { ChatMessage } from '@/types/message';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API}/api` || 'http://localhost:5000/api',
  withCredentials: true, // Include cookies in requests
});

// Request interceptor for adding auth tokens or other headers
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize common fields
    const status = error?.response?.status as number | undefined;
    const statusText = error?.response?.statusText as string | undefined;
    const method = error?.config?.method as string | undefined;
    const url = error?.config?.url as string | undefined;
    const code = error?.code as string | undefined;
    const data = error?.response?.data as unknown;

    // Helpers
    const hasNonEmptyObject = (val: unknown) => {
      if (!val) return false;
      if (typeof val !== 'object') return true; // primitives/strings worth logging
      try {
        return Object.keys(val as Record<string, unknown>).length > 0;
      } catch {
        return false;
      }
    };
    const safeBodyPreview = (val: unknown, max = 300): string => {
      try {
        if (val == null) return '';
        if (typeof val === 'string') return val.length ? ` body="${val.slice(0, max)}${val.length > max ? '…' : ''}"` : '';
        if (!hasNonEmptyObject(val)) return '';
        const json = JSON.stringify(val);
        if (!json || json === '{}' || json === '[]') return '';
        return ` body=${json.length > max ? json.slice(0, max) + '…' : json}`;
      } catch {
        return '';
      }
    };

    // Build a compact message to avoid empty object logs like {}
    const parts: string[] = [];
    if (typeof status === 'number') parts.push(`status=${status}`);
    if (statusText) parts.push(`statusText=${statusText}`);
    if (method) parts.push(`method=${String(method).toUpperCase()}`);
    if (url) parts.push(`url=${url}`);
    if (code) parts.push(`code=${code}`);
    const compactMsg = parts.length ? `HTTP error (${parts.join(' ')})` : 'HTTP error';

    // 401s are expected during auth checks; keep noise low
    if (status === 401) {
      // ...existing code...
    } else if (typeof status === 'number') {
      const body = safeBodyPreview(data);
      console.error(`${compactMsg}${body}`);
    } else if (error.request) {
      // No response received (network/CORS/DNS)
      const nparts: string[] = [];
      if (method) nparts.push(`method=${String(method).toUpperCase()}`);
      if (url) nparts.push(`url=${url}`);
      if (code) nparts.push(`code=${code}`);
      if (error.message) nparts.push(`message="${error.message}"`);
      console.error(`Network error (${nparts.join(' ')})`);
    } else {
      const msg = error?.message ? ` message="${error.message}"` : '';
      console.error(`Unexpected error${msg}`);
    }

    return Promise.reject(error);
  }
);

// API wrapper functions
export const api = {
  // Generic request method
  request: async <T = unknown>(config: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.request(config);
    return response.data;
  },

  // GET request
  get: async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get(url, config);
    return response.data;
  },

  // POST request
  post: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post(url, data, config);
    return response.data;
  },

  // PUT request
  put: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete(url, config);
    return response.data;
  },
};

// Auth API functions using Axios
export const authApi = {
  // Check if user is authenticated
  checkAuth: async (): Promise<UserResponse | null> => {
    try {
      // Skip if no API URL configured
      if (!process.env.NEXT_PUBLIC_API) {
        return null;
      }

      const data = await api.get<UserResponse>('/user/me');
      return data || null;
    } catch (error) {
      const err = error as AxiosError;
      const status = err.response?.status;
      if (status === 401) {
        // Expected when user is not logged in; keep noise low
  // ...existing code...
      } else if (process.env.NODE_ENV === 'development') {
        // Network/no-backend or other errors in dev
        // ...existing code...
      } else {
        console.error('Auth check failed:', error);
      }
      return null;
    }
  },

  // Login user
  login: async (data: LoginRequest) => {
    try {
      const response = await api.post<UserResponse | ResponseError>('/auth/login', data);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Register user
  register: async (userData: RegisterRequest) => {
    try {
      const data = await api.post<UserResponse | ResponseError>('/auth/signup', userData);
      return data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (data: UpdateUserRequest) => {
    try {
      const updatedUser = await api.post<UserResponse | ResponseError>('/user/update-profile', data);
      if ((updatedUser as ResponseError)?.error) {
        throw new Error((updatedUser as ResponseError).error);
      }
      return updatedUser as UserResponse;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  },
};

export const userApi = {
  // Fetch all users
  getAllUsers: async () => {
    try {
      const data = await api.get<Array<UserResponse> | ResponseError>('/user/get-all');
      if ((data as ResponseError)?.error) {
        throw new Error((data as ResponseError).error);
      }
      return data as Array<UserResponse>;
    } catch (error) {
      console.error('Failed to fetch all users:', error);
      throw error;
    }
  },

  // Fetch current user's friends
  getFriends: async () => {
    try {
      const data = await api.get<Array<UserResponse> | ResponseError>('/user/get-friends');
      if ((data as ResponseError)?.error) {
        throw new Error((data as ResponseError).error);
      }
      return data as Array<UserResponse>;
    } catch (error) {
      console.error('Failed to fetch friends:', error);
      throw error;
    }
  },

  getIncomingFriendRequests: async () => {
    try {
      const data = await api.get<Array<IncomingRequest> | ResponseError>('/user/friend-requests');
      if ((data as ResponseError)?.error) {
        throw new Error((data as ResponseError).error);
      }
      return data as Array<IncomingRequest>;
    } catch (error) {
      console.error('Failed to fetch incoming friend requests:', error);
      throw error;
    }
  },

  getOutgoingFriendRequests: async () => {
    try {
      const data = await api.get<Array<OutgoingRequest> | ResponseError>('/user/outgoing-friend-requests');
      if ((data as ResponseError)?.error) {
        throw new Error((data as ResponseError).error);
      }
      return data as Array<OutgoingRequest>;
    } catch (error) {
      console.error('Failed to fetch outgoing friend requests:', error);
      throw error;
    }
  },

  sendFriendRequest: async (recipient_id: string) => {
    try {
      const data = await api.post<OutgoingRequest | ResponseError>(`/user/friend-request/${recipient_id}`);
      if ((data as ResponseError)?.error) {
        throw new Error((data as ResponseError).error);
      }
      return data as OutgoingRequest;
    } catch (error) {
      console.error('Failed to send friend request:', error);
      throw error;
    }
  },

  acceptFriendRequest: async (request_id: string) => {
    try {
      const data = await api.put<ResponseSuccess | ResponseError>(`/user/friend-request/${request_id}/accept`);
      if ((data as ResponseError)?.error) {
        throw new Error((data as ResponseError).error);
      }
      return data as ResponseSuccess;
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      throw error;
    }
  },

  rejectFriendRequest: async (request_id: string) => {
    try {
      const data = await api.put<ResponseSuccess | ResponseError>(`/user/friend-request/${request_id}/reject`);
      if ((data as ResponseError)?.error) {
        throw new Error((data as ResponseError).error);
      }
      return data as ResponseSuccess;
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      throw error;
    }
  },
}

export const messageApi = {
  // Get conversation between current user and a friend
  getConversation: async (friendId: string) => {
    try {
      const data = await api.get<Array<ChatMessage> | ResponseError>(`/chat/${friendId}`);
      if ((data as ResponseError)?.error) {
        throw new Error((data as ResponseError).error);
      }
      return data as Array<ChatMessage>;
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      throw error;
    }
  },

  // Send a message to a friend (text-only for now)
  sendMessage: async (friendId: string, payload: { text?: string; image?: string; video?: string }) => {
    try {
      const data = await api.post<ChatMessage | ResponseError>(`/chat/send/${friendId}`, payload);
      if ((data as ResponseError)?.error) {
        throw new Error((data as ResponseError).error);
      }
      return data as ChatMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },
};