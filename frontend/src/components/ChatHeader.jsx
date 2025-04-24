import { Video, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";
import VideoCall from "./VideoCall";
import toast from 'react-hot-toast';

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  // Properly destructure socket from auth store
  const { onlineUsers, socket } = useAuthStore();
  const [showVideoCall, setShowVideoCall] = useState(false);

  const handleStartCall = () => {
    if (!onlineUsers.includes(selectedUser._id)) {
      toast.error('User is offline');
      return;
    }

    if (!socket) {
      toast.error('Connection not available');
      return;
    }

    try {
      socket.emit("initiateCall", {
        to: selectedUser._id
      });
      setShowVideoCall(true);
    } catch (error) {
      console.error('Call initiation error:', error);
      toast.error('Failed to start call');
    }
  };

  return (
    <>
      <div className="sticky top-0 z-10 bg-base-100 p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img 
                  src={selectedUser?.profilePic?.[0]?.url || "/avatar.png"} 
                  alt={selectedUser?.fullName} 
                />
              </div>
            </div>

            <div>
              <h3 className="font-medium">{selectedUser?.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser?._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleStartCall}
              className="btn btn-ghost btn-sm btn-circle"
              disabled={!onlineUsers.includes(selectedUser?._id) || !socket}
            >
              <Video className="size-5" />
            </button>

            <button 
              onClick={() => setSelectedUser(null)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <X />
            </button>
          </div>
        </div>
      </div>

      {showVideoCall && (
        <VideoCall onClose={() => setShowVideoCall(false)} />
      )}
    </>
  );
};

export default ChatHeader;