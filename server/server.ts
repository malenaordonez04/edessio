import express , { Express, Request, Response } from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from "./src/config/db";
import authRoutes from './src/routes/auth.routes';
import tutorRoutes from './src/routes/tutor.routes';
import profileRoutes from './src/routes/profile.routes';
import reviewRoutes from './src/routes/review.routes';
import subjectRoutes from './src/routes/subject.routes';

import { createServer } from "http";
import { Server } from "socket.io";
import { Socket } from "dgram";

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

    io.on("connection", (socket) => {
      console.log(`Usuario conectado al chat: ${socket.id}`);

      socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
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


