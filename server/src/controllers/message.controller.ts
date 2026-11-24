import { Response } from "express";
import Message from "../models/message.model";
import { AuthRequest } from "../middleware/auth.middleware";

// Obtener los mensajes entre el usuario logueado y otro usuario específico
export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const myId = req.user?.id;
        const { otherUserId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: otherUserId },
                { sender: otherUserId, receiver: myId }
            ]
        }).sort({ createdAt: 1 }); // Ordenados del más antiguo al más reciente

        res.json(messages);
    } catch (error) {
        console.error("Error al obtener mensajes:", error);
        res.status(500).json({ message: "Error al obtener los mensajes" });
    }
};

// Obtener la lista de usuarios con los que tengo chats (para armar la barra lateral de contactos)
export const getConversations = async (req: AuthRequest, res: Response) => {
    try {
        const myId = req.user?.id;

        // Buscamos todos los mensajes donde participo y extraemos los IDs únicos de los otros usuarios
        const messages = await Message.find({
            $or: [{ sender: myId }, { receiver: myId }]
        }).populate('sender receiver', 'name profilePicture role');

        const contactMap = new Map();

        messages.forEach((msg: any) => {
            const senderId = msg.sender._id.toString();
            const receiverId = msg.receiver._id.toString();
            const otherUser = senderId === myId ? msg.receiver : msg.sender;
            
            if (otherUser && otherUser._id) {
                contactMap.set(otherUser._id.toString(), otherUser);
            }
        });

        res.json(Array.from(contactMap.values()));
    } catch (error) {
        console.error("Error al obtener conversaciones:", error);
        res.status(500).json({ message: "Error al obtener las conversaciones" });
    }
};