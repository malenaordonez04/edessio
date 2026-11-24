import multer from "multer";
import path from "path";
import fs from "fs";

//Definimos la ruta absoluta hacia server/uploads
const uploadDir = path.join(__dirname, "../../uploads");

//Si la carpeta "Uploads" todavia no existe, Node la crea automaticamente para evitar errores.
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true});
}

//Configuramos dónde y con qué  nombre se guarda cada imagen en el disco
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        //Generamos un nombre único usando la fecha actual + un número aleatorio + la extensión original.
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${uniqueSuffix}${ext}`);
    }
});

//Filtro de seguridad para aceptar únicamente archivos de imagen
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else{
        cb(new Error("Solo se permiten archivos de imagen (JPG, PNG, WEBP."));
    }
};

//Exportamos la configuración lista con un límite máximo de 5MB por foto.
export const upload = multer({
    storage,
    fileFilter,
    limits: {fileSize: 5 * 1024 * 1024}
});

