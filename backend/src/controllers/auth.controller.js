import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudnary.js";


export const signup = async (req, res) => {
    // const { fullName, email, password } = req.body;
    try {
        const { fullName, email, password,contactNumber } = req.body;
        if(!fullName || !email || !password || !contactNumber) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }
        //hash password
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const user = await User.findOne({ $or: [{ email }, { contactNumber }] });

        if (user) {
          return res.status(400).json({ 
            error: "User already exists with this email or contact number" 
          });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
            contactNumber,
            profilePic: []
        });


        if(newUser){
            //generate jwt token here
            generateToken(newUser._id,res)
            await newUser.save();
            return res.status(201).json({ 
                _id: newUser._id,
                 fullName: newUser.fullName,
                 email: newUser.email,
                 profilePic: newUser.profilePic,
                 contactNumber: newUser.contactNumber,
                message: "User created successfully",
                 user: newUser });
        }else{
            return res.status(400).json({ message: "User not created or Invalid user Data" });
        }
        

    } catch(error) {
        console.log("Error in signup controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const  login = async (req, res) => {
    const { email, password } = req.body;
   try{
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "User not found or invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        } else {
            //generate jwt token here
            generateToken(user._id,res)
            return res.status(200).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
                createdAt: user.createdAt,
                message: "User logged in successfully",
                
            });
        }
    // });
   }
   catch (error){
    console.log("Error in login controller", error.message);    
    return res.status(500).json({ message: "Internal server error" });
   }
};

export const logout = (req, res) => {
   try{
        res.cookie("jwt", "",{maxAge:0});
        return res.status(200).json({ message: "User logged out successfully" });
   }
   catch (error){
        console.log("Error in logout controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
   }
};

export const updateProfile = async (req, res) => {
    try{
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic) {
            return res.status(400).json({ message: "Please provide a profile picture" });
        }
        //upload image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(userId, {
            $push: {
              profilePic: {
                $each: [
                  {
                    url: uploadResponse.secure_url,
                    createdAt: new Date()
                  }
                ],

                $position: 0,
                
              },
            }
          }
          , { new: true });

        if (!updatedUser) {
            return res.status(400).json({ message: "User not found" });
        }
        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                _id: updatedUser._id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                contactNumber: updatedUser.contactNumber,
                profilePic: updatedUser.profilePic,
                createdAt: updatedUser.createdAt
            }
        });

    }
    catch(error){
        console.log("Error in updateProfile controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const checkAuth = async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            message: "User is authenticated",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
                contactNumber: user.contactNumber,
                createdAt: user.createdAt
            }
        });
    }
    catch(error){
        console.log("Error in checkAuth controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};


