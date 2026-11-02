import { Response } from "express";
import Review from "../models/review.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const createReview = async (req: AuthRequest, res: Response) => {
    //Obtenemos los datos del cuerpo de la petición.
    const {tutorId, rating, comment} = req.body;

    //Obtenemos el id del estudiante del token que conseguimos por el middleware.
    const studentId = req.user!.id

    if (!rating && !comment) {
        return res.status(400).json({message: 'Se requiere una calificación o reseña'});
    }
    try {
        const newReview = new Review({
            student: studentId,
            tutor: tutorId,
            rating,
            comment
        });

        await newReview.save();
        res.status(201).json({message: 'Reseña creada con éxito'});
    } catch (error) {
        res.status(500).json({message: 'Error en el servidor'});
    }
};

//Función para obtener las reviews de un tutor específico.
export const getReviewsForTutor = async (req: AuthRequest, res: Response) => {
    try {
        const reviews = await Review.find({tutor: req.params.tutorId}).populate('student', 'name email');
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({message: 'Error en el servidor'});
    }
};