import { Router } from "express";
import { getTutors, getTutorById } from "../controllers/tutor.controller";

const router = Router();

//Cuando llegue la petición GET a /, se ejecutará la función getAllTutor.
router.get('/', getTutors);

//LLamamos según el id como parámetro variable.
router.get('/:id', getTutorById);

export default router;