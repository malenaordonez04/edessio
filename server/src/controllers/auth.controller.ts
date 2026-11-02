import { Request, Response } from "express"; //Petición y respuesta.
import User from "../models/user.model";    
import bcrypt from 'bcryptjs'; //Encriptamos contraseñas
import jwt from 'jsonwebtoken'; //Para crear tokens de sesión.

export const registerUser = async (req: Request, res: Response) => {
try {
    const {email, password, role, name, location, modality} = req.body; // Obtenemos los datos.

    //Verificamos que el usuario no exista.
    const userExists = await User.findOne({email});
    if (userExists) {
        return res.status(400).json({ message: 'El email ya está en uso' })
    }

    //Encriptamos la contraseña.
    const salt = await bcrypt.genSalt(10); //Generamos un salt para hacer la encriptación más segura.
    const hashedPassword = await bcrypt.hash(password, salt); //Encriptamos

    //Creamos el usuario
    const newUser = new User({
        email, 
        password: hashedPassword, 
        role,
        name,
        location,
        ...(role === 'tutor' && {modality}),
    });

    //Guardamos el usuario en la BDD
    await newUser.save();

    res.status(201).json({message: 'El usuario se ha creado correctamente'});

} catch (error) {
    console.error(error);
    
    res.status(500).json({message: 'Error en el servidor.', error});
}
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        //Obtenemos email y contraseña de la petición
        const {email, password} = req.body;

        //Buscamos que el email exista.
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({message: 'Credenciales inválidas'});
        }

        //Si el usuario existe, comparamos contraseñas para ver si hay match.
        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            return res.status(400).json({message: 'Credenciales inválidas.'})
        }

        //Si todo es correcto, creamos un token de sesión.
        const payload = {id: user._id, role: user.role}; //Información que guardamos adentro del token.
        const token = jwt.sign(payload, process.env.JWT_SECRET!, {expiresIn: '1d'}); //Generamos el token.

        //Enviamos el token al frontend. Antes solo mandabamos el token y daba error con Redux, ahora mandamos token y user.
        res.status(200).json({
            token,
            user: {
                email: user.email,
                name: user.name,
                role: user.role,
            }
        });

    } catch (error) {
        res.status(500).json({message: 'Error en el servidor.', error});
    }
}