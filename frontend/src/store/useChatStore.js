import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error("Failed to fetch contacts");
      console.error("Error fetching contacts:", error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message, "Error Response data get message");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message, " Error Response data Send message");
      throw error;
    }
  },

  addContact: async (contactNumber) => {
    try {
      const response = await axiosInstance.post("/messages/add-contact", {
        contactNumber
      });

      if (response.data.success) {
        set(state => ({
          users: {
            users: response.data.users
          }
        }));
        return response.data.user;
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add contact";
      throw new Error(message);
    }
  },

  updateMessages: (newMessage) => {
    set((state) => ({
      messages: [...state.messages, newMessage]
    }));
  },

  markMessageAsRead: async (messageId) => {
    try {
      // Updated endpoint path
      const response = await axiosInstance.put(`/messages/markAsRead/${messageId}`);
      
      if (response.data.success) {
        set(state => ({
          messages: state.messages.map(message => 
            message._id === messageId 
              ? { ...message, isRead: true }
              : message
          )
        }));
  
        const socket = useAuthStore.getState().socket;
        if (socket) {
          socket.emit('messageRead', messageId);
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
  
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
  
    // Add messageRead listener
    socket.on('messageRead', (messageId) => {
      set(state => ({
        messages: state.messages.map(message => 
          message._id === messageId 
            ? { ...message, isRead: true }
            : message
        )
      }));
    });
  
    // Update newMessage listener
    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;
  
      set(state => ({
        messages: [...state.messages, newMessage]
      }));
    });
  },
  
  // Update unsubscribe to remove both listeners
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("messageRead");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));