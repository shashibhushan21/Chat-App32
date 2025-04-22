import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    addContact,
    getMessages, 
    getUsersForSidebar, 
    markMessageAsRead,
    sendMessage 
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users",protectRoute,getUsersForSidebar);
router.get("/:id",protectRoute,getMessages);

router.post("/send/:id",protectRoute, sendMessage)

// Put routes
router.put("/markAsRead/:messageId", protectRoute, markMessageAsRead);

router.post("/add-contact", protectRoute, addContact);

export default router;