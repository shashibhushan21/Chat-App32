import express from 'express';
const router = express.Router();
import { checkAuth, login, logout, signup, updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
// import { addContact } from '../controllers/message.controller.js';



router.post("/signup",signup);

router.post("/login",login);

router.post("/logout",logout);

router.put("/update-profile",protectRoute,updateProfile);

router.get("/check",protectRoute,checkAuth)

// router.post("/add-contact", protectRoute, addContact);

export default router;