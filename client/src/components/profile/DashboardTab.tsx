import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import type { RootState } from "../../app/store";
import {
    MdCheckCircle,
    MdAccessTime,
    MdMessage,
    MdCalendarToday,
    MdArrowForward
} from "react-icons/md";

interface BookingItem {
    _id: string;
    subject: string;
    date: string;
    dayName: string;
    timeSlot: string;
    status: "pending" | "confirmed" | "rejected" | "cancelled";
    student: {
        _id: string;
        name: string;
        profilePicture?: string;
    };
    tutor: {
        _id: string;
        name: string;
        profilePicture?: string;
        price?: number;
    };
}

interface DashboardTabProps {
    setActiveTab: (tab: string) => void;
}

const formatShortDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const [, month, day] = dateStr.split("-");
    return `${day}/${month}`;
};

// Obtenemos la fecha de hoy en formato "YYYY-MM-DD" para filtrar clases que ya pasaron
const getTodayString = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const DashboardTab: React.FC<DashboardTabProps> = ({ setActiveTab }) => {
    const { token, user } = useSelector((state: RootState) => state.auth);
    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [conversationsCount, setConversationsCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const isTutor = user?.role === "tutor";
    const todayStr = getTodayString();

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) return;
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [bookingsRes, conversationsRes] = await Promise.all([
                    axios.get("http://localhost:5001/api/bookings/my-bookings", config),
                    axios.get("http://localhost:5001/api/messages/conversations", config)
                ]);

                setBookings(bookingsRes.data);
                setConversationsCount(Array.isArray(conversationsRes.data) ? conversationsRes.data.length : 0);
            } catch (error) {
                console.error("Error al cargar datos del dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    // Guarda el contacto de la reserva y abre ChatTab directo en su conversación
    const handleOpenChat = (counterpart?: { _id: string; name: string; profilePicture?: string }) => {
        if (!counterpart?._id) return;
        localStorage.setItem(
            "activeChatContact",
            JSON.stringify({
                _id: counterpart._id,
                name: counterpart.name,
                profilePicture: counterpart.profilePicture,
                role: isTutor ? "student" : "tutor"
            })
        );
        setActiveTab("messages");
    };

    // Filtramos solo las clases confirmadas cuya fecha sea hoy o futura, ordenadas cronológicamente
    const upcomingConfirmed = bookings
        .filter((b) => b.status === "confirmed" && b.date >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot));

    const pendingBookings = bookings.filter((b) => b.status === "pending");

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Cargando resumen de actividad...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Encabezado de bienvenida */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    ¡Hola, {user?.name || "Usuario"}!
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    {isTutor
                        ? "Este es el resumen de tus próximas clases, solicitudes pendientes y mensajes con alumnos."
                        : "Acá podés ver tus próximas clases confirmadas y el estado de tus solicitudes."}
                </p>
            </div>

            {/* Tarjetas de resumen rápido */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-50 text-green-600">
                        <MdCheckCircle className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Próximas clases</p>
                        <p className="text-2xl font-bold text-gray-900">{upcomingConfirmed.length}</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setActiveTab("agenda")}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 text-left hover:border-primary transition-colors cursor-pointer"
                >
                    <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
                        <MdAccessTime className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            {isTutor ? "Solicitudes por aprobar" : "Pendientes de confirmar"}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">{pendingBookings.length}</p>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("messages")}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 text-left hover:border-primary transition-colors cursor-pointer"
                >
                    <div className="p-3 rounded-full bg-blue-50 text-primary">
                        <MdMessage className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Chats activos</p>
                        <p className="text-2xl font-bold text-gray-900">{conversationsCount}</p>
                    </div>
                </button>
            </div>

            {/* Banner si hay solicitudes pendientes */}
            {pendingBookings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-sm text-yellow-800">
                        {isTutor
                            ? `Tenés ${pendingBookings.length} solicitud(es) de clase esperando tu confirmación.`
                            : `Tenés ${pendingBookings.length} solicitud(es) esperando que el profesor confirme el horario.`}
                    </p>
                    <button
                        type="button"
                        onClick={() => setActiveTab("agenda")}
                        className="text-sm font-semibold text-yellow-900 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                        Revisar en Agenda <MdArrowForward />
                    </button>
                </div>
            )}

            {/* Listado de próximas clases confirmadas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <MdCalendarToday className="text-primary" /> Próximas Clases Confirmadas
                    </h3>
                    <button
                        type="button"
                        onClick={() => setActiveTab("agenda")}
                        className="text-sm text-primary font-medium hover:underline cursor-pointer"
                    >
                        Ver todas
                    </button>
                </div>

                {upcomingConfirmed.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        {isTutor
                            ? "No tenés clases próximas confirmadas."
                            : "No tenés clases próximas confirmadas. Explorá profesores para reservar tu primera clase."}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {upcomingConfirmed.map((booking) => {
                            const counterpart = isTutor ? booking.student : booking.tutor;

                            return (
                                <div
                                    key={booking._id}
                                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={
                                                counterpart?.profilePicture ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(counterpart?.name || "U")}&background=random`
                                            }
                                            alt={counterpart?.name}
                                            className="h-11 w-11 rounded-full object-cover border border-gray-200"
                                        />
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">
                                                {booking.subject} —{" "}
                                                {isTutor
                                                    ? `Alumno: ${counterpart?.name}`
                                                    : `Profesor: ${counterpart?.name}`}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {booking.dayName} {formatShortDate(booking.date)} a las {booking.timeSlot} hs
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleOpenChat(counterpart)}
                                        className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                    >
                                        <MdMessage className="h-3.5 w-3.5" />
                                        <span>Enviar mensaje</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardTab;