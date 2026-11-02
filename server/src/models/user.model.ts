import { Schema, model, Types } from "mongoose";
import { ref } from "process";

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,  //Elimina espacios en blanco al inicio y al final
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["student", "tutor"], //Solo puede tener uno de estos valores.
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    modality: {
        type: String,
        enum: ["in-person", "remote", "hybrid"],
        required: false, //Para que no sea necesario para los alumnos
    },
    bio: {
        type: String,
        trim: true,
        default: '',
    },
    subjects: {
        type: [{type: Types.ObjectId, ref: 'Subject'}], //Array de strings.
        default: [],
    },
    profilePicture: {
        type: String,
        default: '',
    },
    price: {
        type: Number,
        default: 0
    }
},
    {
        //Mongoose crea dos campos automáticamente, createdAt y updatedAt.
        timestamps: true,
    }
);

//Creamos el modelo y 'User' será el nombre de la colleción en la base de datos
const User = model('User', userSchema);

export default User;