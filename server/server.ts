import express , { Express, Request, Response } from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from "./src/config/db";
import authRoutes from './src/routes/auth.routes';
import tutorRoutes from './src/routes/tutor.routes';
import profileRoutes from './src/routes/profile.routes';
import reviewRoutes from './src/routes/review.routes';
import subjectRoutes from './src/routes/subject.routes';
import messageRoutes from './src/routes/message.routes';
import bookingRoutes from './src/routes/booking.routes';
import path from "path";

import Message from "./src/models/message.model";

import { createServer } from "http";
import { Server } from "socket.io";
// import { Socket } from "dgram";

//Ejecutamos funcion para leer archivo .env para acceder a las variables.
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5001;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', //Permitimos conexión desde el frontend.
    methods: ["GET", "POST"]
  }
})

//Tenemos que hacer una función para que forzar a que el servidor se "prenda" solo cuando la función async de connectDB haya terminado.
const startServer = async () => {
  try {
    //Conectamos con la BDD. El await forza a que lo demás se haga una vez que la función ya haya terminado, es decir, que la conexión con la BDD este lista.
    await connectDB();
    
    //Middlewares
    app.use(cors());
    app.use(express.json());
    //Así el navegador puede acceder a las fotos guardadas.
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    //Probamos que el servidor funciona
    app.get('/', (req: Request, res: Response) => {
      res.send('¡La API de Edessio está funcionando correctamente!');
    });
    
    //Usamos las rutas de autenticación para las URL que empiecen con /api/auth.
    app.use('/api/auth', authRoutes);
    app.use('/api/tutors', tutorRoutes);
    app.use('/api/profile', profileRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/subjects', subjectRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/bookings', bookingRoutes);

    //Mapa para asociar el ID del usuario con su socket.id actual
    const activeUsers = new Map<string, string>();

    io.on("connection", (socket) => {
      console.log(`Usuario conectado al chat: ${socket.id}`);

      //Registrar al usuario cuando abre la pestaña del chat
      socket.on("register", (userId: string) => {
        if (userId) {
          activeUsers.set(userId, socket.id);
          console.log(`Usuario registrado en Socket.io: ID ${userId} -> Socket ${socket}`);

          //Enviamos a todos la lista actualizada de IDs conectados para poder saber si en el chat, los usuarios estan online o no.
          io.emit("online_users", Array.from(activeUsers.keys()))
        }
      });

      //Manejar el envío de mensajes privados en tiempo real
      socket.on("send_message", async (data: {sender: string; receiver: string; content: string}) => {
        try {
          //Guardar el mensaje en MongoDB
          const newMessage = await Message.create({
            sender: data.sender,
            receiver: data.receiver,
            content: data.content
          });

          //Buscar si el receptor está conectado
          const receiverSocketId = activeUsers.get(data.receiver);

          //Emitir el mensaje al recepto si está online
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("receive_message", newMessage);
          }

          //Devolverlo también al emisor para actualizar su pantalla al instante
          socket.emit("receive_message", newMessage)
        } catch (error) {
          console.error("Error al enviar mensaje por socket:", error);
        }
      })

      socket.on("disconnect", () => {
        //Limpiamos el mapa de usuarios activos
        for (const [userId, socketId] of activeUsers.entries()) {
          if (socketId === socket.id) {
            activeUsers.delete(userId);
            console.log(`Usuario desconectado: ID ${userId}`);
            break
          }
        }
      });
    });


    //Iniciamos el servidor. Antes era con app.listen, ahora con el servidor híbrido.
    httpServer.listen(port, () => {
        console.log(`Servidor (HTTP + Socket) funcionando en el puerto ${port}`);
    })

  } catch (error) {
   console.error('No se pudo iniciar el servidor', error);
  }
}

//Llamamos a la función.
startServer();


