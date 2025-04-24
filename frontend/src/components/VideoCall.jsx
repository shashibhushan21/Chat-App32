import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const VideoCall = ({ onClose }) => {
  const { authUser } = useAuthStore();
  const { selectedUser } = useChatStore();
  const containerRef = useRef(null);

  useEffect(() => {
    const initCall = async () => {
      try {
        // Verify credentials
        const appID = import.meta.env.VITE_ZEGO_APP_ID;
        const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

        console.log('Checking ZEGO credentials:', {
          hasAppId: !!appID,
          hasServerSecret: !!serverSecret
        });

        if (!appID || !serverSecret) {
          throw new Error('ZEGO credentials missing. Check your .env file.');
        }

        // Verify users
        if (!authUser?._id || !selectedUser?._id) {
          throw new Error('User information incomplete');
        }

        const roomID = [authUser._id, selectedUser._id].sort().join('-');

        const kitToken = await ZegoUIKitPrebuilt.generateKitTokenForTest(
          parseInt(appID),
          serverSecret,
          roomID,
          authUser._id,
          authUser.fullName
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);

        if (!containerRef.current) {
          throw new Error('Video container not found');
        }

        await zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          showScreenSharingButton: true,
          showPreJoinView: true,
          turnOnCameraWhenJoining: true,
          turnOnMicrophoneWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          onLeave: () => {
            console.log('User left the call');
            onClose();
          },
        });

      } catch (error) {
        console.error('Video call initialization failed:', error);
        toast.error(error.message || 'Failed to start video call');
        onClose();
      }
    };

    initCall();

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [authUser, selectedUser, onClose]);

  return (
    <div className="fixed inset-0 bg-base-300 z-50">
      <div className="absolute right-4 top-4">
        <button 
          onClick={onClose}
          className="btn btn-circle btn-ghost"
        >
          ✕
        </button>
      </div>
      <div
        ref={containerRef}
        className="h-full w-full"
      />
    </div>
  );
};

export default VideoCall;