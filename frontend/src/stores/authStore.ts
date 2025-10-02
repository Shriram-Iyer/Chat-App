"use client";

import { authApi } from '@/lib/api-config';
import { themedToast } from '@/lib/themed-toast';
import { create } from 'zustand';
import type { LoginRequest, RegisterRequest, ResponseError, UpdateUserRequest, UserResponse } from '@/types/user';
import { type Socket, io } from 'socket.io-client';

// Singleton socket instance for the tab
let globalSocket: Socket | null = null;


interface AuthState {
    authUser: UserResponse | null;
    onlineUsers: Array<string>;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    socket: Socket | null;
    checkAuth: () => Promise<void>;
    signUp: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    login: (data: LoginRequest) => Promise<void>;
    updateProfile: (data: UpdateUserRequest) => Promise<void>;
    connectSocket: () => void;
    disconnectSocket: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    authUser: null,
    onlineUsers: [],
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    socket: null,

    checkAuth: async () => {
        try {
            const user = await authApi.checkAuth();
            set({ authUser: user, isCheckingAuth: false });
        } catch (error) {
            console.error('Error checking auth:', error);
            set({ authUser: null, isCheckingAuth: false });
        }
    },
    signUp: async (data: RegisterRequest) => {
        set({ isSigningUp: true });
        try {
            const user = await authApi.register(data);
            if ((user as ResponseError)?.error === 'User with this email already exists.') {
                themedToast.error('User with this email already exists.');
            } else if (user as UserResponse) {
                set({ authUser: user as UserResponse });
                themedToast.success('Account creation successful');
            } else {
                themedToast.error('Account creation failure');
            }
        } catch (error) {
            console.error('Signup failed:', error);
            themedToast.error('Account creation failure');
        } finally {
            set({ isSigningUp: false });
        }
    },
    logout: async () => {
        try {
            await authApi.logout();
            set({ authUser: null });
            themedToast.success('Logged out successfully');
            get().disconnectSocket();
        } catch (error) {
            console.error('Logout failed:', error);
            themedToast.error('Logout failed');
        }
    },
    login: async (data: LoginRequest) => {
        set({ isLoggingIn: true });
        try {
            const user = await authApi.login(data);
            if ((user as ResponseError)?.error) {
                themedToast.error((user as ResponseError).error);
                set({ isLoggingIn: false });
                themedToast.error('Login failed');
                return;
            }
            set({ authUser: user as UserResponse });
            themedToast.success('Logged in successfully');
        } catch (error) {
            console.error('Login failed:', error);
            themedToast.error('Login failed');
        } finally {
            set({ isLoggingIn: false });
        }
    },
    updateProfile: async (data: UpdateUserRequest) => {
        set({ isUpdatingProfile: true });
        try {
            // Placeholder for future profile update function
            const updatedUser = await authApi.updateProfile(data);
            set({ authUser: updatedUser });
            themedToast.success('Profile updated successfully');
        } catch (error) {
            console.error('Profile update failed:', error);
            themedToast.error('Profile update failed');
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
    connectSocket: () => {
        const { authUser } = get();
        if (!authUser) {
            return;
        }
        // If already connected and userId matches, do nothing
        if (globalSocket && globalSocket.connected && globalSocket.io.opts.query?.userId === authUser._id) {
            set({ socket: globalSocket });
            return;
        }
        // If socket exists but userId changed or not connected, disconnect first
        if (globalSocket) {
            globalSocket.disconnect();
            globalSocket = null;
        }
        console.log('Connecting socket for user:', authUser._id); // Debug log
        globalSocket = io(process.env.NEXT_PUBLIC_API, {
            query: { user_id: authUser._id },
        });
        globalSocket.connect();
        globalSocket.on('get_online_users', (user_ids: Array<string>) => {
            console.log('Online users updated:', user_ids); // Debug log
            set({ onlineUsers: user_ids });
        });
        set({ socket: globalSocket });
    },
    disconnectSocket: () => {
        if (globalSocket) {
            globalSocket.disconnect();
            globalSocket = null;
        }
        set({ socket: null });
    }

}))