import { Schema, model, Types } from "mongoose";
import { ref } from "process";

const reviewSchema = new Schema(
    {
        student: {
            type: Types.ObjectId, //Guardamos una referencia al ID del usuario
            ref: 'User', //Referenciamos a la colección User para luego poder conectar la reseña con un documento de la colección.
            required: true,
        },
        tutor: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            // required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            // required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Review = model('Review', reviewSchema);

export default Review;