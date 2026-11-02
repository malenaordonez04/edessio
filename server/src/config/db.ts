import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Obtenemos la URL de conexión desde las variables de entorno
    const mongoUri = process.env.MONGO_URI;

    // Si la variable no existe, es un error crítico.
    if (!mongoUri) {
      console.error('Error: La variable de entorno MONGO_URI no está definida.');
      process.exit(1);
    }

    // Intentamos conectar a la base de datos
    const conn = await mongoose.connect(mongoUri);

    // Si la conexión es exitosa, lo mostramos en la consola
    console.log(`MongoDB conectado exitosamente.`);
  } catch (error) {
    // Si hay un error durante la conexión, lo mostramos y terminamos el proceso
    console.error(`Error al conectar a MongoDB: ${error instanceof Error ? error.message : error}`);
    process.exit(1); // Detiene la aplicación si no se puede conectar a la DB
  }
};

export default connectDB;