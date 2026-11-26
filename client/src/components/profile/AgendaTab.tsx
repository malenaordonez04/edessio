import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import type { RootState } from "../../app/store";
import { MdCalendarToday, MdCheck, MdClose, MdInfoOutline, MdMessage } from "react-icons/md";

interface BookingItem {
    _id: string;
    subject: string;
    date: string;
    dayName: string;
    timeSlot: string;
    status: "pending" | "confirmed" | "rejected" | "cancelled";
    reason?: string;
    seenByTutor: boolean;
    seenByStudent: boolean;
    student: {
        _id: string;
        name: string;
        email: string;
        profilePicture?: string;
    };
    tutor: {
        _id: string;
        name: string;
        email: string;
        profilePicture?: string;
        price?: number;
    };
}

interface AgendaTabProps {
    // Callback opcional para avisarle a ProfilePage que apague el globito rojo del menú lateral
    onBookingsSeen?: () => void;
    // Función para cambiar a la pestaña de mensajes al tocar "Enviar mensaje"
    setActiveTab?: (tab: string) => void;
}

const formatShortDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const [, month, day] = dateStr.split("-");
    return `${day}/${month}`;
};

const AgendaTab: React.FC<AgendaTabProps> = ({ onBookingsSeen, setActiveTab }) => {
    const { token, user } = useSelector((state: RootState) => state.auth);
    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para abrir un cuadro de texto inline cuando se rechaza o cancela una clase
    const [activeReasonBox, setActiveReasonBox] = useState<{
        bookingId: string;
        targetStatus: "rejected" | "cancelled";
    } | null>(null);
    const [reasonText, setReasonText] = useState("");

    const isTutor = user?.role === "tutor";

    useEffect(() => {
        const fetchAndMarkSeen = async () => {
            if (!token) return;
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get("http://localhost:5001/api/bookings/my-bookings", config);
                const loadedBookings: BookingItem[] = res.data;
                setBookings(loadedBookings);

                // Verificamos si había alguna notificación sin leer para este usuario
                const hasUnread = loadedBookings.some((b) =>
                    isTutor ? !b.seenByTutor : !b.seenByStudent
                );

                // Si había novedades sin leer, las marcamos como vistas en la BDD y apagamos el globito
                if (hasUnread) {
                    await axios.patch("http://localhost:5001/api/bookings/mark-seen", {}, config);
                    onBookingsSeen?.();
                }
            } catch (error) {
                console.error("Error al cargar reservas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAndMarkSeen();
    }, [token]);

    // Abre ChatTab directamente con la persona de esa reserva
    const handleOpenChat = (counterpart?: { _id: string; name: string; profilePicture?: string }) => {
        if (!counterpart?._id || !setActiveTab) return;
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

    // Cambia el estado de la reserva (confirmar, rechazar con motivo o cancelar post-confirmación)
    const handleStatusChange = async (
        bookingId: string,
        status: "confirmed" | "rejected" | "cancelled",
        reason?: string
    ) => {
        if (!token) return;
        try {
            const res = await axios.patch(
                `http://localhost:5001/api/bookings/${bookingId}/status`,
                { status, reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBookings((prev) => prev.map((b) => (b._id === bookingId ? res.data : b)));
            setActiveReasonBox(null);
            setReasonText("");
        } catch (error) {
            console.error("Error al actualizar estado de la reserva:", error);
        }
    };

    // Si el estudiante se arrepiente mientras sigue "pending", la eliminamos por completo de MongoDB
    const handleCancelPending = async (bookingId: string) => {
        if (!token) return;
        try {
            await axios.delete(`http://localhost:5001/api/bookings/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings((prev) => prev.filter((b) => b._id !== bookingId));
        } catch (error) {
            console.error("Error al eliminar solicitud pendiente:", error);
        }
    };

    const getStatusBadge = (status: BookingItem["status"]) => {
        switch (status) {
            case "confirmed":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Confirmada</span>;
            case "rejected":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">No aceptada</span>;
            case "cancelled":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">Cancelada</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Pendiente</span>;
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Cargando tu agenda...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                <MdCalendarToday className="text-primary" /> {isTutor ? "Agenda de Clases" : "Mis Reservas"}
            </h2>

            {bookings.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                    Todavía no tenés clases agendadas ni solicitudes pendientes.
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => {
                        const counterpart = isTutor ? booking.student : booking.tutor;
                        const wasUnread = isTutor ? !booking.seenByTutor : !booking.seenByStudent;
                        const isEditingReason = activeReasonBox?.bookingId === booking._id;

                        return (
                            <div
                                key={booking._id}
                                className={`p-4 rounded-xl border transition-colors ${
                                    wasUnread
                                        ? "border-primary/40 bg-blue-50/30"
                                        : "border-gray-100 hover:bg-gray-50/50"
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={
                                                counterpart?.profilePicture ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(counterpart?.name || "U")}&background=random`
                                            }
                                            alt={counterpart?.name}
                                            className="h-12 w-12 rounded-full object-cover border border-gray-200"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-gray-900">
                                                    {isTutor
                                                        ? `Alumno: ${counterpart?.name}`
                                                        : `Profesor: ${counterpart?.name}`}
                                                </p>
                                                {wasUnread && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-white">
                                                        Nuevo
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Materia: <span className="font-semibold">{booking.subject}</span> •{" "}
                                                <span className="font-semibold">
                                                    {booking.dayName} {formatShortDate(booking.date)}
                                                </span>{" "}
                                                a las <span className="font-semibold">{booking.timeSlot} hs</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
                                        {/* Botón directo para abrir chat con el alumno o profesor */}
                                        {setActiveTab && counterpart?._id && (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenChat(counterpart)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                                title="Enviar mensaje"
                                            >
                                                <MdMessage className="h-3.5 w-3.5" />
                                                <span>Mensaje</span>
                                            </button>
                                        )}

                                        {getStatusBadge(booking.status)}

                                        {/* ACCIONES DEL PROFESOR cuando la solicitud está pendiente */}
                                        {isTutor && booking.status === "pending" && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleStatusChange(booking._id, "confirmed")}
                                                    className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors cursor-pointer"
                                                    title="Aceptar clase"
                                                >
                                                    <MdCheck className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setActiveReasonBox({ bookingId: booking._id, targetStatus: "rejected" });
                                                        setReasonText("");
                                                    }}
                                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                                                    title="Rechazar solicitud"
                                                >
                                                    <MdClose className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}

                                        {/* ACCIÓN DEL ALUMNO si se arrepiente mientras sigue pendiente (se borra de BDD) */}
                                        {!isTutor && booking.status === "pending" && (
                                            <button
                                                onClick={() => handleCancelPending(booking._id)}
                                                className="text-xs text-red-500 hover:underline cursor-pointer"
                                            >
                                                Cancelar solicitud
                                            </button>
                                        )}

                                        {/* ACCIÓN PARA AMBOS si la clase ya estaba confirmada y necesitan bajarla */}
                                        {booking.status === "confirmed" && (
                                            <button
                                                onClick={() => {
                                                    setActiveReasonBox({ bookingId: booking._id, targetStatus: "cancelled" });
                                                    setReasonText("");
                                                }}
                                                className="text-xs text-gray-500 hover:text-red-500 hover:underline cursor-pointer"
                                            >
                                                Cancelar clase
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Cuadro desplegable para escribir el motivo de rechazo o cancelación */}
                                {isEditingReason && (
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={reasonText}
                                            onChange={(e) => setReasonText(e.target.value)}
                                            placeholder={
                                                activeReasonBox.targetStatus === "rejected"
                                                    ? "Motivo opcional para el alumno (ej: Ese horario se me superpone)..."
                                                    : "Motivo de la cancelación (ej: Surgió un imprevisto)..."
                                            }
                                            className="flex-grow px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleStatusChange(
                                                        booking._id,
                                                        activeReasonBox.targetStatus,
                                                        reasonText.trim()
                                                    )
                                                }
                                                className="px-4 py-2 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 cursor-pointer"
                                            >
                                                Confirmar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveReasonBox(null)}
                                                className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 cursor-pointer"
                                            >
                                                Volver
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Cartel informativo cuando la clase fue rechazada o cancelada */}
                                {(booking.status === "rejected" || booking.status === "cancelled") && (
                                    <div className="mt-3 p-3 rounded-lg bg-red-50/70 border border-red-100 flex items-start gap-2 text-xs text-red-800">
                                        <MdInfoOutline className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">
                                                {booking.status === "rejected"
                                                    ? "El profesor no pudo aceptar este horario."
                                                    : "Esta clase confirmada fue cancelada."}
                                            </p>
                                            {booking.reason && (
                                                <p className="mt-0.5 text-red-700">Motivo: "{booking.reason}"</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AgendaTab;