import { Router } from "express";
import { updateUserProfile, getUserProfile, changePassword } from "../controllers/profile.controller";
import { protect } from "../middleware/auth.middleware";

import { upload } from "../middleware/upload.middleware";
const router = Router();

//Aseguramos la ruta con protect para verificar que el usuario tenga los permisos necesarios para actualizar el perfil.
router.get('/', protect, getUserProfile);
router.put('/', protect, upload.single("profilePicture"), updateUserProfile);

router.put('/password', protect, changePassword)

export default router;