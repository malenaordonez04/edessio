import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { RootState } from "../app/store";

// Estructura que devuelve GET /api/bookings/availability/:tutorId
interface AvailableDay {
    date: string;    // Ej: "2026-11-23"
    dayName: string; // Ej: "Lunes"
    slots: string[]; // Ej: ["10:00", "14:00"]
}

interface TutorAvailabilitySectionProps {
    tutorId: string;
    // Recibimos las materias del profesor (pueden venir como objetos { _id, name } o como strings)
    subjects?: Array<{ _id?: string; name: string } | string>;
}

// Función auxiliar para pasar de "2026-11-23" a "23/11" sin problemas de zona horaria
const formatShortDate = (dateStr: string): string => {
    const [, month, day] = dateStr.split("-");
    return `${day}/${month}`;
};

const TutorAvailabilitySection: React.FC<TutorAvailabilitySectionProps> = ({ tutorId, subjects = [] }) => {
    const { token, user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    // Normalizamos las materias a un arreglo simple de textos (ej: ["Matemática", "Física"])
    const subjectNames = subjects.map((s) => (typeof s === "string" ? s : s.name));

    const [schedule, setSchedule] = useState<AvailableDay[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedSlot, setSelectedSlot] = useState<string>("");
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    // Si el profesor tiene materias cargadas, preseleccionamos la primera automáticamente
    useEffect(() => {
        if (subjectNames.length > 0 && !selectedSubject) {
            setSelectedSubject(subjectNames[0]);
        }
    }, [subjects]);

    // Cargamos los turnos reales disponibles de los próximos 14 días
    useEffect(() => {
        const fetchAvailability = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5001/api/bookings/availability/${tutorId}`);
                const activeDays: AvailableDay[] = res.data || [];
                setSchedule(activeDays);

                // Preseleccionamos la primera fecha disponible
                if (activeDays.length > 0) {
                    setSelectedDate(activeDays[0].date);
                }
            } catch (error) {
                console.error("Error al obtener disponibilidad del profesor:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAvailability();
    }, [tutorId]);

    // Envía la solicitud de clase al servidor
    const handleBookClass = async () => {
        if (!user || !token) {
            navigate("/login");
            return;
        }
        if (!selectedDate || !selectedSlot) return;

        // Buscamos el objeto del día elegido para obtener su dayName ("Lunes", "Martes", etc.)
        const chosenDayObj = schedule.find((d) => d.date === selectedDate);
        if (!chosenDayObj) return;

        setSubmitting(true);
        setFeedback(null);
        try {
            await axios.post(
                "http://localhost:5001/api/bookings",
                {
                    tutorId,
                    subject: selectedSubject || "Clase particular",
                    date: selectedDate,
                    dayName: chosenDayObj.dayName,
                    timeSlot: selectedSlot
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setFeedback({
                type: "success",
                text: `¡Solicitud enviada para el ${chosenDayObj.dayName} ${formatShortDate(selectedDate)} a las ${selectedSlot} hs! Podés seguir el estado en "Mis Reservas".`
            });

            // Actualizamos el estado local para ocultar inmediatamente el turno recién reservado
            setSchedule((prev) =>
                prev
                    .map((dayItem) => {
                        if (dayItem.date !== selectedDate) return dayItem;
                        return {
                            ...dayItem,
                            slots: dayItem.slots.filter((s) => s !== selectedSlot)
                        };
                    })
                    // Si ese día se quedó sin horarios libres, también lo sacamos de la lista
                    .filter((dayItem) => dayItem.slots.length > 0)
            );

            setSelectedSlot("");
        } catch (error: any) {
            setFeedback({
                type: "error",
                text: error.response?.data?.message || "No se pudo realizar la reserva."
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <p className="text-gray-400 text-left ml-4 mt-2">Cargando horarios disponibles...</p>;
    }

    if (schedule.length === 0) {
        return (
            <p className="text-gray-400 text-left ml-4 mt-2">
                Este profesor no tiene horarios disponibles en los próximos 14 días. Podés consultarle por mensaje directo.
            </p>
        );
    }

    // Obtenemos los horarios libres correspondientes a la fecha seleccionada
    const currentDaySlots = schedule.find((d) => d.date === selectedDate)?.slots || [];

    return (
        <div className="mx-4 mt-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-2xs text-left">
            {/* Paso 1: Elegir materia (solo se muestra si el profesor dicta más de una) */}
            {subjectNames.length > 1 && (
                <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-3">1. Elegí la materia:</p>
                    <div className="flex flex-wrap gap-2">
                        {subjectNames.map((subj) => (
                            <button
                                key={subj}
                                type="button"
                                onClick={() => setSelectedSubject(subj)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                                    selectedSubject === subj
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {subj}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Paso 2: Elegir fecha real */}
            <p className="text-sm text-gray-500 mb-3">
                {subjectNames.length > 1 ? "2. Elegí una fecha disponible:" : "1. Elegí una fecha disponible:"}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
                {schedule.map((item) => (
                    <button
                        key={item.date}
                        type="button"
                        onClick={() => {
                            setSelectedDate(item.date);
                            setSelectedSlot(""); // Reseteamos el horario al cambiar de fecha
                            setFeedback(null);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                            selectedDate === item.date
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        {item.dayName} {formatShortDate(item.date)}
                    </button>
                ))}
            </div>

            {/* Paso 3: Elegir horario libre */}
            <p className="text-sm text-gray-500 mb-3">
                {subjectNames.length > 1 ? "3. Seleccioná el horario:" : "2. Seleccioná el horario:"}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
                {currentDaySlots.map((slot) => (
                    <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                            selectedSlot === slot
                                ? "bg-accent border-primary text-primary font-bold"
                                : "border-gray-200 text-gray-700 hover:border-primary"
                        }`}
                    >
                        {slot} hs
                    </button>
                ))}
            </div>

            {/* Cartel de confirmación o error */}
            {feedback && (
                <div
                    className={`p-3 rounded-lg text-sm mb-4 ${
                        feedback.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                >
                    {feedback.text}
                </div>
            )}

            {/* Botón final de reserva */}
            {selectedSlot && (
                <button
                    type="button"
                    onClick={handleBookClass}
                    disabled={submitting}
                    className="bg-primary text-white font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                    {submitting
                        ? "Reservando..."
                        : `Solicitar clase (${formatShortDate(selectedDate)} - ${selectedSlot} hs)`}
                </button>
            )}
        </div>
    );
};

export default TutorAvailabilitySection;