import mongoose, { Schema, Document } from "mongoose";

// Estructura de cada día en la plantilla semanal del profesor (ej: Lunes -> ["09:00", "10:00"])
export interface IDaySchedule {
    day: string;
    slots: string[];
}

// Documento de Disponibilidad: guarda la plantilla semanal base de cada profesor
export interface IAvailability extends Document {
    tutor: mongoose.Types.ObjectId;
    schedule: IDaySchedule[];
}

const AvailabilitySchema = new Schema<IAvailability>(
    {
        // unique: true garantiza que cada profesor tenga un único esquema semanal guardado
        tutor: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        schedule: [
            {
                day: { type: String, required: true },
                slots: [{ type: String }]
            }
        ]
    },
    { timestamps: true }
);

// Documento de Reserva: guarda cada clase puntual solicitada para una fecha real
export interface IBooking extends Document {
    student: mongoose.Types.ObjectId;
    tutor: mongoose.Types.ObjectId;
    subject: string;       
    date: string;          
    dayName: string;       
    timeSlot: string;      
    status: "pending" | "confirmed" | "rejected" | "cancelled";
    reason?: string;       
    seenByTutor: boolean;  // false = el profesor todavía no vio esta solicitud/novedad (activa su globito)
    seenByStudent: boolean;// false = el alumno todavía no vio la respuesta del profesor (activa su globito)
}

const BookingSchema = new Schema<IBooking>(
    {
        student: { type: Schema.Types.ObjectId, ref: "User", required: true },
        tutor: { type: Schema.Types.ObjectId, ref: "User", required: true },
        subject: { type: String, required: true },
        date: { type: String, required: true },
        dayName: { type: String, required: true },
        timeSlot: { type: String, required: true },
        status: {
            type: String,
            // Separamos los 4 estados reales del ciclo de vida de una clase:
            // - pending: recién pedida por el alumno (si se arrepiente acá, se borra de la BDD)
            // - confirmed: aceptada por el profesor
            // - rejected: rechazada por el profesor antes de confirmarse
            // - cancelled: cancelada luego de haber estado confirmada
            enum: ["pending", "confirmed", "rejected", "cancelled"],
            default: "pending"
        },
        reason: { type: String, default: "" },
        // Cuando nace la reserva, el profesor aún no la vio (false) y el alumno ya la conoce (true)
        seenByTutor: { type: Boolean, default: false },
        seenByStudent: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export const Availability = mongoose.model<IAvailability>("Availability", AvailabilitySchema);
export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);