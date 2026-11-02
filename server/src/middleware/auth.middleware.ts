import { Request, Response, NextFunction } from "express";
import jwt  from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {id: string};
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    //Buscamos el token. El token se manda en una cabecera llamada authorization que empieza con bearer.
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            //Separamos la palabra bearer y nos quedamos solo con el token.
            token = req.headers.authorization.split(' ')[1];
            //Verificamos el token.
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {id: string};
            //Si el token es válido, lo guardamos en el objeto request.
            req.user = {id: decoded.id };
            next();
        } catch (error) {
            res.status(401).json({message: 'El token no válido, autorización denegada'});
        }
    } 
    if (!token) {
        res.status(401).json({message: 'No hay token, autorización denegada'});
    }
}