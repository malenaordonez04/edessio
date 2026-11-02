import { Router } from "express";
import { createReview, getReviewsForTutor } from "../controllers/review.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

//Ruta para crear una reseña (Protegida, solo usuarios logueados pueden hacerlo).
router.post('/', protect, createReview);

router.get('/:tutorId', getReviewsForTutor);

export default router;