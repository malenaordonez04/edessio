import { Router } from "express";
import { getAllSubjects, createSubject } from "../controllers/subject.controller";

const router = Router();
router.get('/', getAllSubjects);
router.post('/', createSubject);
export default router;