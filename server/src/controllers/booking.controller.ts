import { Request, Response } from "express";
import { Availability, Booking } from "../models/booking.model";

// Nombres de los días ordenados según lo que devuelve JavaScript en date.getDay() (0 = Domingo)
const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Extrae el ID del usuario autenticado que inyecta el middleware JWT
const getUserId = (req: Request): string => {
    const user = (req as any).user;
    return user?.id || user?._id;
};

// Convierte un objeto Date local al formato "YYYY-MM-DD" sin problemas de desfase horario UTC
const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

//Obtener los horarios reales disponibles de un profesor para los próximos 14 días (Público)
export const getTutorAvailability = async (req: Request, res: Response) => {
    try {
        const { tutorId } = req.params;

        // Buscamos la plantilla semanal del profesor
        const availability = await Availability.findOne({ tutor: tutorId });
        if (!availability || availability.schedule.length === 0) {
            return res.json([]);
        }

        const now = new Date();
        const todayStr = formatLocalDate(now);
        // Calculamos los minutos transcurridos en el día de hoy para filtrar horas que ya pasaron
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Traemos todas las reservas activas (pendientes o confirmadas) de este profesor desde hoy en adelante
        const activeBookings = await Booking.find({
            tutor: tutorId,
            date: { $gte: todayStr },
            status: { $in: ["pending", "confirmed"] }
        });

        // Creamos un Set de búsqueda rápida con formato "YYYY-MM-DD|HH:MM" para saber qué turnos están ocupados
        const occupiedSlots = new Set(
            activeBookings.map((b) => `${b.date}|${b.timeSlot}`)
        );

        const upcomingAvailability: { date: string; dayName: string; slots: string[] }[] = [];

        // Recorremos los próximos 14 días (desde i = 0 que es hoy hasta i = 13)
        for (let i = 0; i < 14; i++) {
            const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
            const dateStr = formatLocalDate(targetDate);
            const dayName = DAY_NAMES[targetDate.getDay()];

            // Buscamos si el profesor trabaja ese día de la semana en su plantilla
            const dayTemplate = availability.schedule.find((d) => d.day === dayName);
            if (!dayTemplate || dayTemplate.slots.length === 0) continue;

            // Filtramos los horarios de ese día dejando solo los que estén realmente libres
            const freeSlots = dayTemplate.slots.filter((slot) => {
                // Si el turno ya tiene una reserva pendiente o confirmada en esa fecha exacta, lo ocultamos
                if (occupiedSlots.has(`${dateStr}|${slot}`)) {
                    return false;
                }

                // Si la fecha evaluada es HOY (i === 0), ocultamos horarios que ya pasaron
                if (i === 0) {
                    const [hours, minutes] = slot.split(":").map(Number);
                    const slotMinutes = hours * 60 + minutes;
                    if (slotMinutes <= currentMinutes) {
                        return false;
                    }
                }

                return true;
            });

            // Solo agregamos el día a la lista si quedó al menos un horario disponible
            if (freeSlots.length > 0) {
                upcomingAvailability.push({
                    date: dateStr,
                    dayName,
                    slots: freeSlots
                });
            }
        }

        res.json(upcomingAvailability);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la disponibilidad", error });
    }
};

// Obtener la plantilla semanal guardada del profesor logueado (Privado)
export const getMyAvailability = async (req: Request, res: Response) => {
    try {
        const tutorId = getUserId(req);
        const availability = await Availability.findOne({ tutor: tutorId });

        // Devolvemos directamente el array [{ day: "Lunes", slots: ["09:00", ...] }]
        res.json(availability ? availability.schedule : []);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener tu plantilla de disponibilidad", error });
    }
};


//Guardar o actualizar la plantilla semanal del profesor logueado
export const updateAvailability = async (req: Request, res: Response) => {
    try {
        const tutorId = getUserId(req);
        const { schedule } = req.body;

        const updated = await Availability.findOneAndUpdate(
            { tutor: tutorId },
            { tutor: tutorId, schedule },
            { new: true, upsert: true }
        );

        res.json(updated.schedule);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar disponibilidad", error });
    }
};

//Crear una solicitud de reserva para una fecha y materia concreta (Estudiante)
export const createBooking = async (req: Request, res: Response) => {
    try {
        const studentId = getUserId(req);
        const { tutorId, subject, date, dayName, timeSlot } = req.body;

        if (!tutorId || !subject || !date || !dayName || !timeSlot) {
            return res.status(400).json({ message: "Faltan datos obligatorios para agendar la clase." });
        }

        if (studentId === tutorId) {
            return res.status(400).json({ message: "No podés reservar una clase con vos mismo." });
        }

        // Doble validación en el servidor por si dos alumnos intentan reservar el mismo turno al mismo segundo
        const existing = await Booking.findOne({
            tutor: tutorId,
            date,
            timeSlot,
            status: { $in: ["pending", "confirmed"] }
        });

        if (existing) {
            return res.status(400).json({ message: "Este horario acaba de ser reservado por otro estudiante." });
        }

        const newBooking = await Booking.create({
            student: studentId,
            tutor: tutorId,
            subject,
            date,
            dayName,
            timeSlot,
            status: "pending",
            seenByTutor: false,  // Activa la notificación (globito) en la Agenda del profesor
            seenByStudent: true
        });

        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ message: "Error al crear la reserva", error });
    }
};

//Obtener todas las reservas del usuario logueado (Estudiante o Profesor)
export const getMyBookings = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);

        const bookings = await Booking.find({
            $or: [{ student: userId }, { tutor: userId }]
        })
            .populate("student", "name email profilePicture")
            .populate("tutor", "name email profilePicture price modality")
            .sort({ createdAt: -1 }); // Las solicitudes más recientes aparecen primero

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las reservas", error });
    }
};

//Cambiar estado de una reserva: confirmar, rechazar (con motivo) o cancelar post-confirmación
export const updateBookingStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const userId = getUserId(req);

        if (!["confirmed", "rejected", "cancelled"].includes(status)) {
            return res.status(400).json({ message: "Estado de reserva no válido." });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: "Reserva no encontrada." });
        }

        const isTutor = booking.tutor.toString() === userId;
        const isStudent = booking.student.toString() === userId;

        if (!isTutor && !isStudent) {
            return res.status(403).json({ message: "No tenés permiso para modificar esta reserva." });
        }

        // Solo el profesor puede confirmar o rechazar una solicitud pendiente
        if ((status === "confirmed" || status === "rejected") && !isTutor) {
            return res.status(403).json({ message: "Solo el profesor puede aceptar o rechazar solicitudes." });
        }

        booking.status = status;
        if (reason !== undefined) {
            booking.reason = reason;
        }

        // Actualizamos las banderas de notificación para avisar a la otra persona:
        if (isTutor) {
            // Si respondió el profesor, le activamos el globito al estudiante
            booking.seenByStudent = false;
            booking.seenByTutor = true;
        } else {
            // Si el alumno canceló una clase que ya estaba confirmada, le activamos el globito al profesor
            booking.seenByTutor = false;
            booking.seenByStudent = true;
        }

        await booking.save();

        // Volvemos a poblar los datos de usuario para devolver el objeto completo al frontend
        const populatedBooking = await Booking.findById(id)
            .populate("student", "name email profilePicture")
            .populate("tutor", "name email profilePicture price modality");

        res.json(populatedBooking);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la reserva", error });
    }
};

//Marcar todas las reservas del usuario como vistas (apaga el globito al entrar a la pestaña Agenda)
export const markBookingsAsSeen = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);

        // Actualizamos en paralelo tanto si tiene reservas como profesor o como estudiante
        await Promise.all([
            Booking.updateMany({ tutor: userId, seenByTutor: false }, { seenByTutor: true }),
            Booking.updateMany({ student: userId, seenByStudent: false }, { seenByStudent: true })
        ]);

        res.json({ message: "Notificaciones marcadas como leídas" });
    } catch (error) {
        res.status(500).json({ message: "Error al marcar reservas como vistas", error });
    }
};

//Eliminar por completo una solicitud pendiente si el alumno se arrepiente antes de que el profe responda
export const deletePendingBooking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: "Reserva no encontrada." });
        }

        // Verificamos que sea el mismo alumno que la creó
        if (booking.student.toString() !== userId) {
            return res.status(403).json({ message: "No tenés permiso para cancelar esta solicitud." });
        }

        // Solo se borra físicamente de la BDD si todavía está "pending"
        if (booking.status !== "pending") {
            return res.status(400).json({
                message: "La clase ya fue procesada por el profesor; usá la opción de cancelar reserva."
            });
        }

        await Booking.findByIdAndDelete(id);
        res.json({ message: "Solicitud eliminada correctamente", deletedId: id });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la solicitud pendiente", error });
    }
};