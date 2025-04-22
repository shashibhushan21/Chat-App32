import {create} from 'zustand';
import { persist } from 'zustand/middleware'
import {axiosInstance} from '../lib/axios.js';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === " development"? "http://localhost:3000": "/";


export const useAuthStore = create(persist(
    (set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIng:false,
    isUpdatingProfile: false,
    onlineUsers: [],
    isCheckingAuth: true,
    socket:null,

    checkAuth: async () => {
        try {
          const res = await axiosInstance.get("/auth/check");
    
          if (res.data.user) {
            set({ 
              authUser: res.data.user,
              isCheckingAuth: false 
            });
            get().connectSocket();
          }
        } catch (error) {
          console.log("Error in checkAuth:", error);
          set({ 
            authUser: null, 
            isCheckingAuth: false 
          });
          throw error;
        } 
      },

    signup: async(data) => {
        set({isSigningUp: true});
        try {
            const res = await axiosInstance.post("/auth/signup", data); 
            if (res.data) {

              set({
                authUser: {
                    ...res.data,
                    contactNumber: res.data.contactNumber // Explicitly include contact number
                }
            });
                set({authUser: res.data});
                toast.success("Account created successfully!");
                get().connectSocket();
                return true;
            }
        } catch (error) {
            const message = error.response?.data?.message || "Error creating account";
            toast.error(message);
            console.error("Error in signup:", error);
            return false;
        } finally {
            set({isSigningUp: false});
        }
    },


    login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", data);
          set({ authUser: res.data });
          toast.success("Logged in successfully");
          get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message,"Somthing went wrong!");
        } finally {
          set({ isLoggingIn: false });
        }
      },

    logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          set({ authUser: null });
          toast.success("Logged out successfully");
          get().disconnectSocket();
        } catch (error) {
          toast.error(error.response.data.message,"Somthing went wrong!");
        }
      },

    updateProfile: async(data) =>{
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put("/auth/update-profile", data);
          set({ authUser: res.data });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.log("error in update profile:", error);
          toast.error(error.response.data.message,"error in update profile!");
        } finally {
          set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
      const { authUser } = get();
      if (!authUser || get().socket?.connected) return;
  
      const socket = io(BASE_URL, {
        query: {
          userId: authUser._id,
        },
      });
      socket.connect();
  
      set({ socket: socket });
  
      socket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });
    },
    disconnectSocket: () => {
      if (get().socket?.connected) get().socket.disconnect();
    },
    

}),
{
    name: 'auth-storage',
    partialize: (state) => ({
      // Only persist these fields
      authUser: state.authUser,
      onlineUsers: state.onlineUsers,
    }),
  }
));