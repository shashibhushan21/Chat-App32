import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useState } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import VideoCall from './VideoCall';
import toast from 'react-hot-toast';

const IncomingCallAlert = () => {
  const { socket } = useAuthStore();
  const { selectedUser } = useChatStore();
  const [showCall, setShowCall] = useState(false);

  const handleAccept = () => {
    setShowCall(true);
  };

  const handleDecline = () => {
    if (socket && selectedUser) {
      socket.emit("endCall", { to: selectedUser._id });
    }
    toast.error('Call declined');
  };

  if (!selectedUser) return null;

  return (
    <>
      {socket?.incomingCall && !showCall && (
        <div className="fixed bottom-4 right-4 bg-base-200 p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-4">
            <div>
              <p className="font-medium">{selectedUser.fullName}</p>
              <p className="text-sm text-base-content/70">Incoming video call...</p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleAccept}
                className="btn btn-success btn-sm btn-circle"
              >
                <Phone className="size-4" />
              </button>
              
              <button 
                onClick={handleDecline}
                className="btn btn-error btn-sm btn-circle"
              >
                <PhoneOff className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showCall && (
        <VideoCall onClose={() => setShowCall(false)} />
      )}
    </>
  );
};

export default IncomingCallAlert;