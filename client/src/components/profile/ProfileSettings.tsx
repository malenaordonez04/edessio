// Vista de datos personales, detalles de tutor y seguridad de la cuenta (cambio de contraseña).
import React, { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { MdEdit, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import type { Tutor } from "../../types";
import type { RootState } from "../../app/store";
import { translateModality } from "../../utils/textFormatters";

interface ProfileSettingsProps {
    profile: Tutor;
    userRole: "student" | "tutor" | undefined;
    onEditClick: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, userRole, onEditClick }) => {
    // Obtenemos el token desde Redux para autenticar la petición al backend
    const { token } = useSelector((state: RootState) => state.auth);

    // Estados para desplegar y controlar los campos de contraseña
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false); // Alterna entre texto visible y puntos (***)

    // Estados para feedback visual y bloqueo del botón mientras guarda
    const [passwordFeedback, setPasswordFeedback] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const [savingPassword, setSavingPassword] = useState(false);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordFeedback(null);

        // Validaciones rápidas en el frontend antes de llamar al servidor
        if (newPassword !== confirmPassword) {
            setPasswordFeedback({ type: "error", text: "Las contraseñas nuevas no coinciden." });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordFeedback({ type: "error", text: "La nueva contraseña debe tener al menos 6 caracteres." });
            return;
        }

        setSavingPassword(true);
        try {
            const res = await axios.put(
                "http://localhost:5001/api/profile/password",
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPasswordFeedback({ type: "success", text: res.data.message });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // Cerramos el formulario automáticamente tras confirmar el cambio
            setTimeout(() => {
                setShowPasswordForm(false);
                setPasswordFeedback(null);
            }, 1500);
        } catch (error: any) {
            setPasswordFeedback({
                type: "error",
                text: error.response?.data?.message || "No se pudo actualizar la contraseña."
            });
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* TARJETA 1: INFORMACIÓN PERSONAL Y DETALLES DE TUTOR */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    <div className="flex-shrink-0">
                        <img
                            src={
                                profile.profilePicture ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`
                            }
                            alt={`Foto de perfil de ${profile.name}`}
                            className="h-44 w-44 rounded-full object-cover border-4 border-gray-100 shadow-md"
                        />
                    </div>

                    <div className="flex-grow w-full">
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Información Personal</h2>
                                <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                    Cuenta de {userRole === "tutor" ? "Profesor" : "Estudiante"}
                                </span>
                            </div>

                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-full hover:bg-primary hover:text-white transition-colors shadow-sm font-medium text-sm cursor-pointer"
                                onClick={onEditClick}
                            >
                                <MdEdit />
                                <span>Editar Perfil</span>
                            </button>
                        </div>

                        <div className="space-y-4 text-base">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <p className="font-light">
                                    <span className="font-bold text-gray-700 block text-xs uppercase tracking-wide">
                                        Nombre
                                    </span>
                                    {profile.name}
                                </p>
                                <p className="font-light">
                                    <span className="font-bold text-gray-700 block text-xs uppercase tracking-wide">
                                        Localidad
                                    </span>
                                    {profile.location || "No especificada"}
                                </p>
                            </div>

                            <p className="font-light">
                                <span className="font-bold text-gray-700 block text-xs uppercase tracking-wide">
                                    Email
                                </span>
                                {profile.email}
                            </p>

                            <div className="mt-4">
                                <span className="font-bold text-gray-700 block text-xs uppercase tracking-wide mb-1">
                                    Biografía
                                </span>
                                {profile.bio ? (
                                    <p className="font-light text-gray-600 bg-gray-50 p-4 rounded-md italic border-l-4 border-secondary">
                                        {profile.bio}
                                    </p>
                                ) : (
                                    <p className="text-gray-400 italic text-sm">
                                        Todavía no agregaste una biografía. Tocá "Editar Perfil" para presentarte.
                                    </p>
                                )}
                            </div>

                            {userRole === "tutor" && (
                                <div className="pt-6 mt-6 border-t border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Detalles de Tutor</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                        <p className="font-light">
                                            <span className="font-bold text-gray-700 block text-xs uppercase tracking-wide">
                                                Precio por Hora
                                            </span>
                                            <span className="text-green-600 font-semibold text-xl">
                                                ${profile.price?.toLocaleString() || 0}
                                            </span>
                                        </p>
                                        <p className="font-light">
                                            <span className="font-bold text-gray-700 block text-xs uppercase tracking-wide">
                                                Modalidad
                                            </span>
                                            <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                                                {translateModality(profile.modality)}
                                            </span>
                                        </p>
                                    </div>

                                    <span className="font-bold text-gray-700 block text-xs uppercase tracking-wide mb-2">
                                        Mis Materias
                                    </span>
                                    {profile.subjects && profile.subjects.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {profile.subjects.map((subject: any, index: number) => (
                                                <span
                                                    key={index}
                                                    className="border border-gray-200 bg-white text-gray-700 text-sm font-medium px-3 py-1 rounded-full shadow-2xs"
                                                >
                                                    {typeof subject === "string" ? subject : subject.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 italic text-sm">No has añadido ninguna materia.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* TARJETA 2: SEGURIDAD DE LA CUENTA Y CAMBIO DE CONTRASEÑA */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-full bg-gray-100 text-gray-700">
                            <MdLock className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Seguridad de la cuenta</h3>
                            <p className="text-xs text-gray-500">
                                Actualizá tu contraseña periódicamente para mantener tu cuenta protegida.
                            </p>
                        </div>
                    </div>

                    {!showPasswordForm && (
                        <button
                            type="button"
                            onClick={() => setShowPasswordForm(true)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:border-primary hover:text-primary transition-colors cursor-pointer self-start sm:self-center"
                        >
                            Cambiar contraseña
                        </button>
                    )}
                </div>

                {showPasswordForm && (
                    <form onSubmit={handlePasswordSubmit} className="mt-6 pt-6 border-t border-gray-100 space-y-4 max-w-md">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                                Contraseña actual
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {/* Botón para alternar visibilidad de las 3 contraseñas */}
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    aria-label="Mostrar u ocultar contraseñas"
                                >
                                    {showPasswords ? <MdVisibilityOff /> : <MdVisibility />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                                Nueva contraseña
                            </label>
                            <input
                                type={showPasswords ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                                Confirmar nueva contraseña
                            </label>
                            <input
                                type={showPasswords ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {passwordFeedback && (
                            <p
                                className={`text-xs p-3 rounded-lg ${
                                    passwordFeedback.type === "success"
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                            >
                                {passwordFeedback.text}
                            </p>
                        )}

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={savingPassword}
                                className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-full hover:opacity-90 disabled:opacity-50 cursor-pointer"
                            >
                                {savingPassword ? "Guardando..." : "Actualizar contraseña"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPasswordForm(false);
                                    setPasswordFeedback(null);
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-full hover:bg-gray-200 cursor-pointer"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfileSettings;