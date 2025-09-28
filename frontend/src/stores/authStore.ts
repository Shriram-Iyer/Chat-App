"use client";

import { authApi } from '@/lib/api-config';
import { themedToast } from '@/lib/themed-toast';
import { create } from 'zustand';
import type { LoginRequest, RegisterRequest, ResponseError, UpdateUserRequest, UserResponse } from '@/types/user';


interface AuthState {
    authUser: UserResponse | null;
    onlineUsers: Array<UserResponse>;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    checkAuth: () => Promise<void>;
    signUp: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    login: (data: LoginRequest) => Promise<void>;
    updateProfile: (data: UpdateUserRequest) => Promise<void>; // Placeholder for future profile update function
}

export const useAuthStore = create<AuthState>((set) => ({
    authUser: null,
    onlineUsers: [],
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            // Skip API call if no backend URL is configured
            if (!process.env.NEXT_PUBLIC_API) {
                console.warn('No API URL configured, skipping auth check');
                set({ authUser: null, isCheckingAuth: false });
                return;
            }

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
    }
}))