import { Response } from "express";
import User from "../models/user.model";
import { AuthRequest } from "../middleware/auth.middleware";
import bcrypt from "bcryptjs";

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

            if (req.file) {
                user.profilePicture = `http://localhost:5001/uploads/${req.file.filename}`;
            }

            // Si el rol es tutor, se permite actualizar los subjects también.
            if (user.role === 'tutor') {
                if (req.body.subjects) {
                    //Como usamos FormData para poder subir la foto de perfil, los arrays viajan coo texto.
                    //Si llega como texto, usamos JSON.parse para "desempaquetarlo" y volver a convertirlo en un array para Mongoose.
                    user.subjects = typeof req.body.subjects === 'string' ? JSON.parse(req.body.subjects) : req.body.subjects;
                }
                user.price = req.body.price || user.price;
                user.modality = req.body.modality || user.modality;
            }
            //Guardamos los datos en una variable nueva y se los mandamos a moongoose.  
            const updatedUser = await user.save();

            await updatedUser.populate('subjects'); //Forzamos buscar el objeto completo y no solo los IDs para el frontend.

            res.json(updatedUser)
        } else {
            res.status(401).json({message: 'Usuario no encontrado'});
        }
    } catch (error) {
        res.status(500).json({message: 'Error en el servidor'});
    }
}

export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const {currentPassword, newPassword} = req.body;

        //Validamos con typeof para asegurar que ambos son strings
        if (typeof currentPassword!== "string" || typeof newPassword !== "string" || !currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Completá la contraseña actual y la nueva.'});
        }

        if (newPassword.length < 6) {
            return res.status(400).json({message: 'La nueva contraseña debe tener al menos 6 caracteres.'});
        }

        const user = await User.findById(req.user!.id);

        if (!user || typeof user.password !== "string") {
            return res.status(404).json({message: 'Usuario no encontrado.'});
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({message: 'La contraseña actual es incorrecta.'});
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Contraseña actualizada correctamente'})
    } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        res.status(500).json({message: 'Error en el servidor al cambiar la contraseña'});
    }
}