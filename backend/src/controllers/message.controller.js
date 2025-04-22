import User from "../models/user.model.js";

import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudnary.js"

import { getReceiverSocketId, io } from "../lib/socket.js";
// import cloudinary from "../lib/cloudinary.js";
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Get the current user with populated contacts
    const currentUser = await User.findById(loggedInUserId)
      .populate({
        path: 'contacts',
        select: '-password -contacts' // Exclude sensitive data
      });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send only the contacts array
    res.status(200).json({ 
      users: currentUser.contacts || [] 
    });

  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
    try {

        const { id: userToChatId } = req.params;
        const myId = req.user._id;
        const message = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        });

        res.status(200).json(message);
    }
    catch (error) {
        console.log("Error in getMessages controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, images } = req.body; // Change from image to images
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrls = [];
        if (images && images.length > 0) {
            // Upload all images in parallel
            const uploadPromises = images.map(image => 
                cloudinary.uploader.upload(image)
            );
            
            // Wait for all uploads to complete
            const uploadResponses = await Promise.all(uploadPromises);
            // toast.loading("Loading......");
            // Get all image URLs
            imageUrls = uploadResponses.map(response => response.secure_url);
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            images: imageUrls ,
            isDelivered: true,

        });


        //todo : realtime functionality goes here => socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Add new controller for marking messages as read
export const markMessageAsRead = async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user._id;
  
      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
  
      // Only recipient can mark message as read
      if (message.receiverId.toString() !== userId.toString()) {
        return res.status(403).json({ error: "Not authorized" });
      }
  
      message.isRead = true;
      await message.save();
  
      // Emit socket event for real-time updates
      if (req.io) {
        req.io.to(`user_${message.senderId}`).emit("messageRead", {
          messageId,
          readBy: userId
        });
      }
  
      res.status(200).json({ 
        success: true, 
        message: "Message marked as read" 
      });
  
    } catch (error) {
      console.error("Error in markMessageAsRead:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };


export const addContact = async (req, res) => {
    try {
      const { contactNumber } = req.body;
      const userId = req.user._id;
  
      // Find user by contact number
      const contactUser = await User.findOne({ 
        contactNumber,
        _id: { $ne: userId } // Exclude current user
      }).select('-password');
  
      if (!contactUser) {
        return res.status(404).json({ 
          success: false,
          message: "No user found with this contact number" 
        });
      }
  
      // Add contact to user's contacts array
      const currentUser = await User.findByIdAndUpdate(
        userId,
        { 
          $addToSet: { contacts: contactUser._id } 
        },
        { new: true }
      ).populate('contacts', '-password');
  
      res.status(200).json({
        success: true,
        user: contactUser,
        users: currentUser.contacts,
        message: "Contact added successfully"
      });
  
    } catch (error) {
      console.error("Error in addContact:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to add contact" 
      });
    }
  };