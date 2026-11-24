import { Router } from "express";
import { getMessages, getConversations } from "../controllers/message.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Todas las rutas de mensajes requieren que el usuario esté logueado (protect)
router.get("/conversations", protect, getConversations);
router.get("/:otherUserId", protect, getMessages);

export default router;