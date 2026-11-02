import { Request, Response } from "express";
import Subject from "../models/subject.model";

export const getAllSubjects = async (req: Request, res: Response) => {
    try {
        const subjects = await Subject.find().sort('name');
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener materias'});
    }
}