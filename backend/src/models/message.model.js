import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,

        },
        images: [{
            type: String,
        }],
        isDelivered: {
            type: Boolean,
            default: false
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date,
        },
    }, {
    timestamps: true,
}
);
const Message = mongoose.model("Message", messageSchema);

export default Message;