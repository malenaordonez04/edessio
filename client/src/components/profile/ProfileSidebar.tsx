//Menú lateral.
import React from "react";
import {
    MdDashboard, 
    MdCalendarToday, 
    MdMessage, 
    MdPerson, 
    MdFavorite, 
    MdAccessTime 
} from "react-icons/md";

//¿Que debe recibir el componente ProfileSidebar?
interface ProfileSidebarProps {
    activeTab: string; //Nos dice que pestaña está abierta actualmente.
    setActiveTab: (tab: string) => void; // Función para determinar la pestaña actual.
    userRole: 'student' | 'tutor' | undefined; //Para saber que tabs mostrar.
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeTab, setActiveTab, userRole }) => {

    const tabs = userRole === 'tutor' ? [
        { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
        { id: 'agenda', label: 'Agenda', icon: MdCalendarToday },
        { id: 'messages', label: 'Mensajes', icon: MdMessage },
        { id: 'profile', label: 'Mi Perfil', icon: MdPerson },
    ] : [
        { id: 'dashboard', label: 'Mis Clases', icon: MdCalendarToday },
        { id: 'messages', label: 'Mensajes', icon: MdMessage },
        { id: 'favorites', label: 'Favoritos', icon: MdFavorite },
        { id: 'profile', label: 'Mi Perfil', icon: MdPerson },
    ];

    return(
     <aside className="w-full lg:w-64">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 sticky top-4">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
                <h2 className="font-semibold text-gray-700">Menú</h2>
            </div>
            <nav className="p-2 space-y-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200 text-sm font-medium text-left ${activeTab === tab.id ? 'bg-primary text-white shadow-md translate-x-1' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <tab.icon className={`flex-shrink-0 h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`}/>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>
        </div>
     </aside>   
    )
}

export default ProfileSidebar