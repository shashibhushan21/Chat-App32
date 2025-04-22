import React, { useEffect, useRef } from 'react'
import { useChatStore } from '../store/useChatStore'
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './skeletons/MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from '../lib/utils';
import { Check } from 'lucide-react';

const ChatContainer = () => {
  // const {messages, getMessages,isMessagesLoading, selectedUser} = useChatStore();

  const { 
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessageAsRead 
  } = useChatStore();


  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null)

  // useEffect(() => {
  //   console.log("Auth User Profile:", authUser?.profilePic);
  //   console.log("Selected User Profile:", selectedUser?.profilePic);
  // }, [authUser, selectedUser]);

  useEffect(() => {
    getMessages(selectedUser._id)

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if(messageEndRef.current && messages){
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    const markMessagesAsRead = async () => {
      const unreadMessages = messages.filter(
        msg => msg.senderId !== authUser._id && !msg.isRead
      );

      if (unreadMessages.length > 0) {
        for (const msg of unreadMessages) {
          await markMessageAsRead(msg._id);
        }
      }
    };

    markMessagesAsRead();
  }, [messages, authUser._id, markMessageAsRead]);




  if (isMessagesLoading) {
    return (
      <div className='flex h-full flex-col w-full'>
        <ChatHeader />
        <MessageSkeleton />

        <MessageInput />

      </div>
    );
  }

//   console.log("Auth Users:", authUser.profilePic[0]);
// console.log("Selected User:", selectedUser);

  return (
    <div className='flex h-full flex-col w-full'>
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"} `}
            ref={messageEndRef}
          >

            {/* ...existing message content... */}
            <div className="chat-footer opacity-50 flex items-center gap-1">
              <time className="text-xs">{formatMessageTime(message.createdAt)}</time>
              {message.senderId === authUser._id && (
                <span className="flex ml-1">
                  {message.isRead ? (
                    <div className="flex items-center">
                      <Check className="size-3 text-blue-500" />
                      <Check className="size-3 -ml-1.5 text-blue-500" />
                    </div>
                  ) : message.isDelivered ? (
                    <Check className="size-3" />
                  ) : (
                    <Check className="size-3 opacity-50" />
                  )}
                </span>
              )}
            </div>

            <div className=" chat-image avatar ">
              <div className="size-7 rounded-full border overflow-hidden">
                <img
                  src={
                    message.senderId === authUser?._id
                      ? (selectedUser?.profilePic?.[0]?.url || "/avatar.png")
                      : (selectedUser?.profilePic?.[0]?.url || "/avatar.png")
                  }
                  alt="profile pic"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Failed to load profile image");
                    e.target.src = "/avatar.png";
                  }}
                  loading="lazy"
                />
              </div>
            </div>

            <div className="chat-bubble flex flex-col gap-2">
              {/* Display multiple images if present */}
              {message.images && message.images.length > 0 && (
                <div className="flex flex-wrap gap-3 flex-col">
                  {message.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Attachment ${index + 1}`}
                      className="max-w-[200px] rounded-md"
                    />
                  ))}
                </div>
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />

    </div>
  )
}

export default ChatContainer
