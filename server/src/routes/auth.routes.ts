import { Router } from "express"; 
import { registerUser, loginUser } from "../controllers/auth.controller";

//Creamos instancia del router.
const router = Router();

//Definimos las rutas.
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router