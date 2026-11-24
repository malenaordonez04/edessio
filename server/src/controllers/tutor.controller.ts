import { Request, Response } from "express";
import User from "../models/user.model";
import Review from "../models/review.model";

//Pagina que muestra los profesores a los alumnos.

export const getTutors = async (req: Request, res: Response) => {
    try {
        //Obtenemos los filtros de la URL.
        const { search, subject, minPrice, maxPrice, modality } = req.query;

        //Objeto de filtro base. Es type any para decirle a TypeScript que los valores son flexibles para poder agregarle propiedades como 'name' o 'subjects'. EJ:{role: 'tutor', name: 'male'}
        const query: any = {role: 'tutor'};

        console.log('filtros recibidos', req.query);
        
        //Creo el filtro de búsqueda por nombre (si existe).
        //RegExp nos permite encontrar un texto dentro de un string 'i' hace que sea insensible a mayúsculas/minúsculas.
        if (search) {
            query.name = new RegExp(search as string, 'i');
        }

        //Buscamos coincidencia exacta con las modalidades.
        if (modality && typeof modality === 'string' && modality.trim() !== '') {
        query.modality = modality;
        }

        if (minPrice || maxPrice) {
            query.price = {} //Inicializamos el objeto de filtro para 'price.
            if (minPrice) {
                query.price.$gte = Number(minPrice) //$gte = greater than or equal.
            }
            if (maxPrice) {
                query.price.$lte = Number(maxPrice); //$lte = less than or equal.
            }
        }

        //Buscamos cualquier documento donde el array de subjects contenga el string "subject". No usamos RegExp porque estamos encontrando valores dentro de un array de strings.
        if (subject) {
            query.subjects = subject as string;
        }

        console.log("Query final a MongoDB:", JSON.stringify(query, null, 2));

        //Buscamos todos los usuarios con el filtro dinamico.
        const tutors = await User.find(query).select('-password').populate('subjects', 'name') //Rellenamos las materias con los nombres asi  no se muestran los ids.

        // 2. Calculamos en MongoDB el promedio ($avg) y la cantidad ($sum) de reseñas agrupadas por profesor.
        // Usamos $ifNull por si en tu modelo Review el campo que apunta al profesor se llama 'tutor' o 'tutorId'.
        const ratings = await Review.aggregate([
            {
                $group: {
                    _id: { $ifNull: ["$tutor", "$tutorId"]},
                    averageRating: { $avg: "$rating"},
                    reviewCount: {$sum: 1}
                }
            }
        ]);

        //Guardamos los resultados en un Map
        const ratingsMap = new Map(
            ratings.filter((r) => r._id) //Evitamos nulos por seguridad
            .map((r) => [
                r._id.toString(),
                {
                    //.toFixed(1) devuelve un texto ("4.7"), por eso lo envovlemos en Number()
                    averageRating: Number(r.averageRating.toFixed(1)),
                    reviewCount: r.reviewCount
                }
            ])
        );

        const tutorWithRatings = tutors.map((tutor) => {
            const stats = ratingsMap.get(tutor._id.toString());
            return {
                ...tutor.toObject(),
                averageRating: stats ? stats.averageRating : 0,
                reviewCount: stats ? stats.reviewCount : 0
            };
        });
        //Respondemos con una lista de todos los profesores.
        res.status(200).json(tutorWithRatings);
    } catch (error) {
        //Si hay algun error, devolvemos un mensaje de error.
        res.status(500).json({message: 'Error en el servidor'}); 
    };
};  

export const getTutorById = async (req: Request, res: Response) => {
    try {
        const tutorId = req.params.id;

        const tutor = await User.findOne({_id: tutorId, role: 'tutor'}).select('-password').populate('subjects', 'name');

        if (!tutor) {
            return res.status(404).json({message: 'No se encontró el profesor'})
        };

        res.status(200).json(tutor);
    } catch (error) {
        res.status(500).json({message: 'Error en el servidor'});
    }
}