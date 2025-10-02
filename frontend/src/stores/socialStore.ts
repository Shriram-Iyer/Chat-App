import { userApi, messageApi } from "@/lib/api-config";
import { themedToast } from "@/lib/themed-toast";
import { ChatMessage } from "@/types/message";
import { type OutgoingRequest, type IncomingRequest, type UserResponse } from "@/types/user";
import { create } from "zustand";
import { useAuthStore } from "./authStore";

interface SocialState {
    friendRequestsSent: Array<IncomingRequest>
    outgoingFriendRequests: Array<OutgoingRequest>
    allUsers: Array<UserResponse>
    friends: Array<UserResponse>
    messages: Array<ChatMessage>
    selectedFriendId?: string;
    isFetching: boolean
    isSendingRequest: boolean
    isMessagesFetching: boolean
    isFriendsFetching: boolean
    fetchAllFriends: () => Promise<void>;
    fetchAllUsers: () => Promise<void>;
    fetchFriendRequests: () => Promise<void>;
    fetchOutgoingFriendRequests: () => Promise<void>;
    sendFriendRequest: (recipient_id: string) => Promise<void>;
    acceptFriendRequest: (request_id: string) => Promise<void>;
    rejectFriendRequest: (request_id: string) => Promise<void>;
    fetchConversation: (friendId: string) => Promise<void>;
    sendMessage: (text?: string, image?: string, video?: string) => Promise<void>;
    setSelectedFriendId: (id: string | undefined) => void;
    unSubscribeFromNewMessages: () => void;
    subscribeToNewMessages: () => void;
}

export const useSocialStore = create<SocialState>((set, get) => ({
    friendRequestsSent: [],
    outgoingFriendRequests: [],
    allUsers: [],
    friends: [],
    messages: [],
    selectedFriendId: undefined,
    isFetching: false,
    isSendingRequest: false,
    isMessagesFetching: false,
    isFriendsFetching: false,
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
    },
    fetchConversation: async (friendId: string) => {
        set({ isMessagesFetching: true });
        try {
            const messages = await messageApi.getConversation(friendId);
            set({ messages });
            themedToast.success('Fetched conversation', 'global-fetch-status');
        } catch (error) {
            console.error('Failed to fetch conversation:', error);
            themedToast.error('Failed to fetch conversation');
        } finally {
            set({ isMessagesFetching: false });
        }
    },
    sendMessage: async (text, image, video) => {
        const friendId = get().selectedFriendId;
        if (!friendId) return;
        try {
            const newMessage = await messageApi.sendMessage(friendId, { text, image, video });
            set((state) => ({ messages: [...state.messages, newMessage] }));
        } catch (error) {
            console.error('Failed to send message:', error);
            themedToast.error('Failed to send message');
        }
    },
    subscribeToNewMessages: () => {
        const {selectedFriendId} = get();
        if(!selectedFriendId) return;
        const {socket} = useAuthStore.getState();
        socket?.on('new_message', (message: ChatMessage) => {
            if(message.sender_id !== selectedFriendId) return;
            set((state) => ({ messages: [...state.messages, message] }));
        })
    },
    unSubscribeFromNewMessages: () => {
        const {socket} = useAuthStore.getState();
        socket?.off('new_message');
    },
    setSelectedFriendId: (id) => set({ selectedFriendId: id }),
}))