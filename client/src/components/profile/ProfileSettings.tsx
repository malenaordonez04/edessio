//Vista de datos y formulario para editarlos.
import React from "react";
import { MdEdit } from "react-icons/md";
import type { Tutor } from "../../types";
import { translateModality } from "../../utils/textFormatters";

interface ProfileSettingsProps {
    profile: Tutor;
    userRole: 'student' | 'tutor' | undefined;
    onEditClick: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({profile, userRole, onEditClick }) => {
    return(
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="flex-shrink-0">
                    <img 
                        src={profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.name}&background=random`} 
                        alt={`Foto de perfil de ${profile.name}`}
                        className="h-48 w-48 rounded-full object-cover border-4 border-gray-100 shadow-md" 
                    />
                </div>

                <div className="flex-grow w-full">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Información Personal</h2>
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-full hover:bg-primary hover:text-white transition-colors shadow-sm font-medium text-sm"
                            onClick={onEditClick}
                        >
                            <MdEdit /> 
                            <span className="hidden sm:inline">Editar Perfil</span>
                        </button>
                    </div>

                    <div className="space-y-4 text-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <p className="font-light"><span className="font-bold text-gray-700 block text-sm uppercase tracking-wide">Nombre</span> {profile.name}</p>      
                            <p className="font-light"><span className="font-bold text-gray-700 block text-sm uppercase tracking-wide">Localidad</span> {profile.location || 'No especificada'}</p>
                        </div>
                        <p className="font-light"><span className="font-bold text-gray-700 block text-sm uppercase tracking-wide">Email</span> {profile.email}</p>
                        
                        {profile.bio && (
                            <div className="mt-4">
                                <span className="font-bold text-gray-700 block text-sm uppercase tracking-wide mb-1">Biografía</span>
                                <p className="font-light text-gray-600 bg-gray-50 p-4 rounded-md italic border-l-4 border-secondary">{profile.bio}</p>
                            </div>
                        )}

                        {userRole === 'tutor' && (
                            <div className="pt-6 mt-6 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Detalles de Tutor</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                    <p className="font-light">
                                        <span className="font-bold text-gray-700 block text-sm uppercase tracking-wide">Precio por Hora</span> 
                                        <span className="text-green-600 font-semibold text-xl">${profile.price?.toLocaleString() || 0}</span>
                                    </p>
                                    <p className="font-light">
                                        <span className="font-bold text-gray-700 block text-sm uppercase tracking-wide">Modalidad</span> 
                                        <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                                            {translateModality(profile.modality)}
                                        </span>
                                    </p>
                                </div>
                                
                                <span className="font-bold text-gray-700 block text-sm uppercase tracking-wide mb-2">Mis Materias</span>
                                {profile.subjects && profile.subjects.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {profile.subjects.map((subject: any, index: number) => (
                                            <span key={index} className="border border-gray-200 bg-white text-gray-700 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                                                {typeof subject === 'string' ? subject : subject.name}
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
    )
}

export default ProfileSettings