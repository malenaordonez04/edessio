import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import type { RootState } from "../../app/store";
import { MdAccessTime, MdCheckCircle } from "react-icons/md";

interface DaySchedule {
    day: string;
    slots: string[];
}

interface AvailabilityTabProps {
    tutorId: string;
}

// Grilla base de días y franjas horarias disponibles en la plataforma
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const AvailabilityTab: React.FC<AvailabilityTabProps> = ({ tutorId }) => {
    const { token } = useSelector((state: RootState) => state.auth);

    // Inicializamos el estado con los días de la semana vacíos
    const [schedule, setSchedule] = useState<DaySchedule[]>(
        DAYS.map((day) => ({ day, slots: [] }))
    );
    const [saving, setSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);

    // Traemos la plantilla semanal guardada del profesor logueado
    useEffect(() => {
        const fetchMyAvailability = async () => {
            if (!token) return;
            try {
                const res = await axios.get("http://localhost:5001/api/bookings/availability", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (Array.isArray(res.data) && res.data.length > 0) {
                    const merged = DAYS.map((day) => {
                        const found = res.data.find((d: DaySchedule) => d.day === day);
                        return found ? { day: found.day, slots: found.slots || [] } : { day, slots: [] };
                    });
                    setSchedule(merged);
                }
            } catch (error) {
                console.error("Error al cargar disponibilidad:", error);
            }
        };
        fetchMyAvailability();
    }, [token, tutorId]);

    // Función tipo interruptor: si la hora ya estaba seleccionada la saca; si no estaba, la agrega
    const toggleSlot = (dayName: string, hour: string) => {
        setSavedSuccess(false);
        setSchedule((prev) =>
            prev.map((item) => {
                if (item.day !== dayName) return item;
                const exists = item.slots.includes(hour);
                return {
                    ...item,
                    slots: exists
                        ? item.slots.filter((h) => h !== hour)
                        : [...item.slots, hour].sort()
                };
            })
        );
    };

    // Envía la grilla actualizada al backend
    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        setSavedSuccess(false);
        try {
            const filteredSchedule = schedule.filter((d) => d.slots.length > 0);
            await axios.put(
                "http://localhost:5001/api/bookings/availability",
                { schedule: filteredSchedule },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSavedSuccess(true);
        } catch (error) {
            console.error("Error al guardar disponibilidad", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MdAccessTime className="text-primary" /> Mi Disponibilidad Semanal
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Seleccioná los bloques horarios en los que podés dar clases.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-white font-medium px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                    {saving ? "Guardando..." : "Guardar horarios"}
                </button>
            </div>

            {savedSuccess && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm">
                    <MdCheckCircle className="h-5 w-5" />
                    ¡Tus horarios disponibles se actualizaron correctamente!
                </div>
            )}

            {/* Renderizamos cada día con sus botones de horarios */}
            <div className="space-y-6">
                {schedule.map((dayItem) => (
                    <div key={dayItem.day} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <h3 className="font-semibold text-gray-800 mb-3">{dayItem.day}</h3>
                        <div className="flex flex-wrap gap-2">
                            {HOURS.map((hour) => {
                                const isSelected = dayItem.slots.includes(hour);
                                return (
                                    <button
                                        key={hour}
                                        type="button"
                                        onClick={() => toggleSlot(dayItem.day, hour)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                                            isSelected
                                                ? "bg-primary text-white shadow-2xs"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                    >
                                        {hour} hs
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AvailabilityTab;