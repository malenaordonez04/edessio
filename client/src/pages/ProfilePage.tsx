import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

import { MdFavorite } from "react-icons/md";

import type { Tutor } from "../types";
import { type RootState } from "../app/store";

import Modal from "../components/Modal";
import EditProfileForm from "../components/EditProfileForm";
import Alert from "../components/Alert";

import ProfileSettings from "../components/profile/ProfileSettings";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import PlaceholderView from "../components/profile/PlaceholderView";
import ChatTab from "../components/ChatTab";
import AvailabilityTab from "../components/profile/AvailabilityTab";
import AgendaTab from "../components/profile/AgendaTab";
import DashboardTab from "../components/profile/DashboardTab";

const ProfilePage = () => {
    // 1. Leemos los datos del usuario desde Redux
    const { token, user: authUser } = useSelector((state: RootState) => state.auth);
    

    // 2. Hook para leer y actualizar el parámetro ?tab= de la URL (ej: /profile?tab=messages)
    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get("tab");

    // 3. Estados para los datos actualizados del perfil
    const [profile, setProfile] = useState<Tutor | null>(null);
    const [loading, setLoading] = useState(true);

    // 4. Estados para el modal, la alerta y las notificaciones sin leer
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAlertVisible, setIsAlertVisible] = useState(true);
    const [unreadBookingsCount, setUnreadBookingsCount] = useState(0);

    // 5. Inicializamos la pestaña activa:
    // Primero revisa si vino un ?tab= desde la Navbar; si no, si hay un chat pendiente; y por defecto 'dashboard'
    const [activeTab, setActiveTab] = useState(() => {
        if (tabFromUrl) return tabFromUrl;
        return localStorage.getItem("activeChatTutorId") ? "messages" : "dashboard";
    });

    // 6. Si el usuario hace clic en otro enlace de la Navbar (cambia ?tab= en la URL), sincronizamos la pestaña
    useEffect(() => {
        if (tabFromUrl) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl]);

    // 7. Efecto para contar las reservas sin leer (globito del menú lateral)
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (!token || !authUser) return;
            try {
                const res = await axios.get("http://localhost:5001/api/bookings/my-bookings", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const isTutor = authUser.role === "tutor";
                const unread = res.data.filter((b: any) =>
                    isTutor ? !b.seenByTutor : !b.seenByStudent
                ).length;
                setUnreadBookingsCount(unread);
            } catch (error) {
                console.error("Error al contar notificaciones:", error);
            }
        };
        fetchUnreadCount();
    }, [token, authUser]);

    // 8. Función y efecto para cargar los datos del perfil cuando abre la página
    const fetchProfile = async () => {
        if (!token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get("http://localhost:5001/api/profile", config);
            setProfile(response.data);
        } catch (error) {
            console.error("Error al cargar el perfil", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [token]);

    // 9. Verificamos si al perfil le faltan datos para mostrar el banner superior
    const isProfileIncomplete = useMemo(() => {
        if (!profile) return false;

        const hasNoBioOrPicture = !profile.bio || !profile.profilePicture;
        const isTutorWithNoSubjects =
            authUser?.role === "tutor" && (!profile.subjects || profile.subjects.length === 0);

        return hasNoBioOrPicture || isTutorWithNoSubjects;
    }, [profile, authUser]);

    // === TODOS LOS HOOKS TERMINAN ACÁ ARRIBA, ANTES DE CUALQUIER RETURN ===

    if (loading) return <div className="text-center mt-10">Cargando perfil...</div>;
    if (!profile) return <div className="text-center mt-10">No se pudo cargar el perfil.</div>;

    // Función auxiliar: cambia la pestaña y actualiza ?tab= en la URL para mantener sincronizada la Navbar
    const handleTabChange: React.Dispatch<React.SetStateAction<string>> = (value) => {
        const nextTab = typeof value === "function" ? value(activeTab) : value;
        setActiveTab(nextTab);
        setSearchParams({ tab: nextTab });
    };

    const handleProfileUdpate = (updatedUser: Tutor) => {
        setProfile(updatedUser);
        setIsModalOpen(false);
    };

    return (
        <div className="px-4 py-8">
            {isProfileIncomplete && isAlertVisible && (
                <div className="mb-6">
                    <Alert
                        message={
                            authUser?.role === "tutor"
                                ? "Añadir una biografía, foto y tus materias va a ayudar a que los estudiantes te encuentren."
                                : "Añadir una biografía y una foto de perfil va a hacer que tu perfil se vea mejor."
                        }
                        onDismiss={() => setIsAlertVisible(false)}
                    />
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Barra lateral sincronizada con la URL */}
                <ProfileSidebar
                    activeTab={activeTab}
                    setActiveTab={handleTabChange}
                    userRole={authUser?.role as "student" | "tutor" | undefined}
                    unreadBookingsCount={unreadBookingsCount}
                />

                {/* Contenido principal */}
                <main className="flex-grow">
                    <div className="transition-opacity duration-300 ease-in-out">
                        {activeTab === "profile" && (
                            <ProfileSettings
                                profile={profile}
                                userRole={authUser?.role as "student" | "tutor" | undefined}
                                onEditClick={() => setIsModalOpen(true)}
                            />
                        )}

                        {activeTab === "dashboard" && <DashboardTab setActiveTab={handleTabChange} />}

                        {activeTab === "agenda" && (
                            <AgendaTab onBookingsSeen={() => setUnreadBookingsCount(0)} />
                        )}

                        {activeTab === "availability" && <AvailabilityTab tutorId={profile._id} />}

                        {activeTab === "messages" && <ChatTab currentUserId={profile._id} />}

                        {activeTab === "favorites" && (
                            <PlaceholderView
                                title="Favoritos"
                                icon={MdFavorite}
                                message="Los profesores que guardes aparecerán en esta lista."
                            />
                        )}
                    </div>
                </main>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <EditProfileForm
                    onClose={() => setIsModalOpen(false)}
                    onProfileUpdate={handleProfileUdpate}
                    currentProfile={profile!}
                />
            </Modal>
        </div>
    );
};

export default ProfilePage;