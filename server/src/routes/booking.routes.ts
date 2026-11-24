import { Router } from "express";
import {
    getTutorAvailability,
    updateAvailability,
    createBooking,
    getMyBookings,
    updateBookingStatus,
    markBookingsAsSeen,
    deletePendingBooking,
    getMyAvailability
} from "../controllers/booking.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Ruta pública: devuelve los turnos reales libres de los próximos 14 días para un profesor
router.get("/availability/:tutorId", getTutorAvailability);

// Rutas protegidas (requieren usuario autenticado):
router.put("/availability", protect, updateAvailability);       // Profesor guarda su plantilla semanal
router.post("/", protect, createBooking);                        // Alumno crea solicitud de reserva
router.get("/my-bookings", protect, getMyBookings);              // Lista todas las reservas del usuario
router.patch("/mark-seen", protect, markBookingsAsSeen);         // Apaga el globito de aviso al abrir Agenda
router.patch("/:id/status", protect, updateBookingStatus);       // Confirma, rechaza (con motivo) o cancela
router.delete("/:id", protect, deletePendingBooking);            // Borra solicitud pending si el alumno se arrepiente
router.get("/availability", protect, getMyAvailability);

export default router;