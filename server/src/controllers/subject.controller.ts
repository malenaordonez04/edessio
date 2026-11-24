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

export const createSubject = async (req: Request, res: Response) => {
    try {
        const rawName = req.body.name?.trim();
        if (!rawName) {
            return res.status(400).json({ message: "El nombre de la materia es obligatorio." });
        }

        // Capitalizamos la primera letra (ej: "física" -> "Física")
        const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

        // Si ya existe en MongoDB (ignorando mayúsculas/minúsculas), la devolvemos sin duplicar
        const existing = await Subject.findOne({
            name: { $regex: new RegExp(`^${formattedName}$`, "i") }
        });

        if (existing) {
            return res.status(200).json(existing);
        }

        const newSubject = await Subject.create({ name: formattedName });
        res.status(201).json(newSubject);
    } catch (error) {
        res.status(500).json({ message: "Error al crear la materia", error });
    }
};