import { Response } from "express";
import User from "../models/user.model";
import { AuthRequest } from "../middleware/auth.middleware";

//Controller que maneja las funciones para editar y ver la informacion propia de los perfiles.

//Creamos endpooint para obtener la informacion del perfil
export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!.id).populate('subjects'); // Hacemos populate para conseguir el texto de subjects ya que sino nos trae el id porque es otra colección.
        if (!user) {
            return res.status(404).json({message: 'Usuario no encontrado'});
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({message: 'Usuario no encontrado'});
    }

}

//Creamos endpoint para actualizar el perfil
export const updateUserProfile = async ( req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!.id);

        //Chequeemos que exista el usuario y actualizamos los datos con lo que se recibe del req.body. || Si se recibe algo nuevo, se actualiza, si no se recibe nada, se deja el valor que ya estaba.
        if (user) {
            user.name = req.body.name || user.name;
            user.location = req.body.location || user.location;
            user.bio = req.body.bio || user.bio;
            user.profilePicture = req.body.profilePicture || user.profilePicture;

        // Si el rol es tutor, se permite actualizar los subjects también.
        if (user.role === 'tutor') {
            user.subjects = req.body.subjects || user.subjects;
            user.price = req.body.price || user.price;
            user.modality = req.body.modality || user.modality;
        }
        //Guardamos los datos en una variable nueva y se los mandamos a moongoose.  
        const updatedUser = await user.save();


        await updatedUser.populate('subjects'); //Forzamos buscar el objeto completo y no solo los IDs para el frontend.
        //Mandamos al frontend la nueva información para poder actualizar la parte visual.
        res.json(updatedUser)
        } else {
            res.status(401).json({message: 'Usuario no encontrado'});
        }
    } catch (error) {
        res.status(500).json({message: 'Error en el servidor'});
    }
}