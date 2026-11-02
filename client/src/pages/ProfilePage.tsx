import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";


import { MdEdit,  MdDashboard, MdCalendarToday, MdMessage, MdFavorite, MdAccessTime} from "react-icons/md";

import type { Tutor } from "../types";
import { type RootState } from "../app/store";
import { login, updateUser } from "../features/auth/authSlice";

import Modal from "../components/Modal";
import EditProfileForm from "../components/EditProfileForm";
import Alert from "../components/Alert";

import { translateModality } from "../utils/textFormatters";

import ProfileSettings from "../components/profile/ProfileSettings";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import PlaceholderView from "../components/profile/PlaceholderView";

const ProfilePage = () => {
    //Leemos los datos del usuario desde Redux para mostrarlos.
   const {token, user: authUser} = useSelector((state: RootState) => state.auth);
   const dispatch = useDispatch();

   //Estados para los datos actualizados del perfil
   const [profile, setProfile] = useState<Tutor | null>(null);
   const [loading, setLoading] = useState(true);


   //Estados para el modal y la alerta.
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAlertVisible, setIsAlertVisible] = useState(true); 

    const [activeTab, setActiveTab] = useState('dashboard');



    //Función para buscar el perfil actualizado.
    const fetchProfile = async () => {
        if (!token) return;
        try {
            const config = {headers: {Authorization : `Bearer ${token}`}};
            const response = await axios.get('http://localhost:5001/api/profile', config);
            setProfile(response.data); //Guardamos los datos actualizados.
        } catch (error) {
            console.error('Error al cargar el perfil', error);
        } finally {
            setLoading(false);
        }
    }

    //Función para cargar los datos cuando la página abre.
    useEffect(() => {
        fetchProfile();
    }, [token]); //Se ejecuta cuando se encuentra el token.


    //Función para manejar la actualización
    const handleProfileUdpate = (updatedUser: Tutor) => {
        setProfile(updatedUser); //Actualiza el estado local inmediatamente.
        setIsModalOpen(false);
    }

    //Verificamos si la información del usuario esta incompleta para determinar si hace falta mostrar el alert.
    const isProfileIncomplete = useMemo(() => {
        if (!profile) return false; //Verificamos que exista usuario.

        const hasNoBioOrPicture =  !profile.bio || !profile.profilePicture //Verifica si no hay bio o picture.

        //Usamos authUser ya que eso es fijo y datos de profile(Cambian).
        const isTutorWithNoSubjects = authUser?.role === 'tutor' && (!profile.subjects || profile.subjects.length === 0); //Verifica que si es profesor, si tiene materias o no.

        return hasNoBioOrPicture || isTutorWithNoSubjects //Se devuelve un booleano true si cualquiera de las dos condiciones se cumple.
    }, [profile, authUser]) //[user]. Solo se vuelve a ejecutar la función si se cambia algo en user. Si no, useMemo recuerda el estado anterior. 

    if (loading) return <div className="text-center mt-10">Cargando perfil...</div>
    if (!profile) return <div className="text-center mt-10">No se pudo cargar el perfil.</div>

    return(
        <div className="px-4 py-8">
            {/* Solo si isProfileIncomplete y isAlertVisible(que el usuario no la haya cerrado) son true, se muestra la alerta.*/}
            {isProfileIncomplete && isAlertVisible && (
                <div className="mb-6">
                    <Alert
                    message={
                        authUser?.role === 'tutor'
                        ? 'Añadir una biografía, foto y tus materias va a ayudar a que los estudiantes te encuentren.'
                        : 'Añadir una biografía y una foto de perfil va a hacer que tu perfil se vea mejor.'
                    }
                    onDismiss={() => setIsAlertVisible(false)}
                    />
                </div>
            )}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/*Barra lateral*/}
                    <ProfileSidebar 
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        userRole={authUser?.role as 'student' | 'tutor' | undefined}
                    />

                    {/*Contenido principal*/}
                    <main className="flex-grow">
                        <div className="transition-opacity duration-300 ease-in-out">
                            {activeTab === 'profile' && (
                                <ProfileSettings 
                                    profile={profile}
                                    userRole={authUser?.role as 'student' | 'tutor' | undefined}
                                    onEditClick={() => setIsModalOpen(true)}
                                />
                            )}

                            {activeTab === 'dashboard' && <PlaceholderView title={authUser?.role === 'tutor' ? 'Panel de control' : 'Mis Clases'} icon={MdDashboard} message="Aquí verás un resumen de tu actividad y tus próximas clases."/>}
                            {activeTab === 'agenda' && <PlaceholderView title='Agenda de clases' icon={MdCalendarToday} message="Gestioná tus horarios y solicitudes de reserva."/>}
                            {activeTab === 'availability' && <PlaceholderView title='Disponibilidad' icon={MdAccessTime} message="Configura tus horarios disponibles para la semana."/>}
                            {activeTab === 'messages' && <PlaceholderView title='Mensajes' icon={MdMessage} message="Aquí verás tus conversaciones"/>}
                            {activeTab === 'favorites' && <PlaceholderView title='Favoritos' icon={MdFavorite} message="Los profesores que guardes aparecerán en esta lista."/>}
                        </div>
                    </main>
                </div>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <EditProfileForm onClose={() => setIsModalOpen(false)} onProfileUpdate={handleProfileUdpate} currentProfile={profile!}/>
                </Modal>
        </div>
    );
};

export default ProfilePage;