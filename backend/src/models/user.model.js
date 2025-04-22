import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePic: [{
            url: {
                type: String,
                default: "/avatar.png",
            }

        }],
        contactNumber: {
            type: String,
            required: [true, "Contact number is required"],
            unique: true,
        },
        contacts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]



    }, {
    timestamps: true,
}
);
const User = mongoose.model('User', userSchema);
export default User;