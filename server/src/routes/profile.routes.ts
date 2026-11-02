import { Router } from "express";
import { updateUserProfile, getUserProfile } from "../controllers/profile.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

//Aseguramos la ruta con protect para verificar que el usuario tenga los permisos necesarios para actualizar el perfil.
router.get('/', protect, getUserProfile);
router.put('/', protect, updateUserProfile);

export default router;