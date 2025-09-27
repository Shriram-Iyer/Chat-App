import { userApi } from "@/lib/api-config";
import { themedToast } from "@/lib/themed-toast";
import { type OutgoingRequest, type IncomingRequest, type UserResponse } from "@/types/user";
import { create } from "zustand";

interface SocialState {
    friendRequestsSent: Array<IncomingRequest>
    outgoingFriendRequests: Array<OutgoingRequest>
    allUsers: Array<UserResponse>
    friends: Array<UserResponse> // Placeholder for future friends list
    isFetching: boolean
    isSendingRequest: boolean
    isFriendsFetching: boolean // Placeholder for future friends fetch state
    fetchAllFriends: () => Promise<void>; // Placeholder for future friends fetch function
    fetchAllUsers: () => Promise<void>;
    fetchFriendRequests: () => Promise<void>;
    fetchOutgoingFriendRequests: () => Promise<void>;
    sendFriendRequest: (recipient_id: string) => Promise<void>;
    acceptFriendRequest: (request_id: string) => Promise<void>;
    rejectFriendRequest: (request_id: string) => Promise<void>;
}

export const useSocialStore = create<SocialState>((set) => ({
    friendRequestsSent: [],
    outgoingFriendRequests: [],
    allUsers: [],
    friends: [], // Placeholder for future friends list
    isFetching: false,
    isSendingRequest: false,
    isFriendsFetching: false, // Placeholder for future friends fetch state
    fetchAllFriends: async () => {
        set({ isFriendsFetching: true });
        try {
            const friends = await userApi.getFriends();
            set({ friends });
            themedToast.success('Fetched all friends', 'global-fetch-status');
        } catch (error) {
            console.error('Failed to fetch all friends:', error);
            themedToast.error('Failed to fetch all friends');
        } finally {
            set({ isFriendsFetching: false });
        }
    },
    fetchAllUsers: async () => {
        set({ isFetching: true });
        try {
            const users = await userApi.getAllUsers();
            set({ allUsers: users });
            themedToast.success('Fetched all users', 'global-fetch-status');
        } catch (error) {
            console.error('Failed to fetch all users:', error);
            themedToast.error('Failed to fetch all users');
        } finally {
            set({ isFetching: false });
        }
    },
    fetchFriendRequests: async () => {
        set({ isFetching: true });
        try {
            const requests = await userApi.getIncomingFriendRequests();
            set({ friendRequestsSent: requests });
            themedToast.success('Fetched friend requests', 'global-fetch-status');
        } catch (error) {
            console.error('Failed to fetch friend requests:', error);
            themedToast.error('Failed to fetch friend requests');
        } finally {
            set({ isFetching: false });
        }
    },
    fetchOutgoingFriendRequests: async () => {
        set({ isFetching: true });
        try {
            const requests = await userApi.getOutgoingFriendRequests();
            set({ outgoingFriendRequests: requests });
            themedToast.success('Fetched outgoing friend requests', 'global-fetch-status');
        } catch (error) {
            console.error('Failed to fetch outgoing friend requests:', error);
            themedToast.error('Failed to fetch outgoing friend requests');
        } finally {
            set({ isFetching: false });
        }
    },
    sendFriendRequest: async (recipient_id: string) => {
        set({ isSendingRequest: true });
        try {
            const response = await userApi.sendFriendRequest(recipient_id);
            set((state) => ({ outgoingFriendRequests: [...state.outgoingFriendRequests, response] }));
            themedToast.success('Request sent successfully');
        } catch (error) {
            console.error('Failed to send friend request:', error);
            themedToast.error('Failed to send friend request');
        } finally {
            set({ isSendingRequest: false });
        }
    },
    acceptFriendRequest: async (request_id: string) => {
        set({ isSendingRequest: true });
        try {
            const response = await userApi.acceptFriendRequest(request_id);
            themedToast.success(response.message)
        } catch (error) {
            console.error('Failed to accept friend request:', error);
            themedToast.error('Failed to accept friend request');
        } finally {
            set({ isSendingRequest: false });
        }
    },
    rejectFriendRequest: async (request_id: string) => {
        set({ isSendingRequest: true });
        try {
            const response = await userApi.rejectFriendRequest(request_id);
            themedToast.success(response.message)
        } catch (error) {
            console.error('Failed to reject friend request:', error);
            themedToast.error('Failed to reject friend request');
        } finally {
            set({ isSendingRequest: false });
        }
    }
}))