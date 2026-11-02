import { Router } from "express";
import { getAllSubjects } from "../controllers/subject.controller";

const router = Router();
router.get('/', getAllSubjects);
export default router;