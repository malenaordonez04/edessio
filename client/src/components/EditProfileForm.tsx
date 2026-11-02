import React, {useEffect, useState} from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "../app/store";
import axios from "axios";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { login } from "../features/auth/authSlice"; //Usamos login para actualizar el estado global.
import type { Tutor, ISubject } from "../types";
import { current } from "@reduxjs/toolkit";

type EditProfileFormProps = {
    onClose: () => void; //Prop para cerrar el modal.
    onProfileUpdate: (updatedUser: Tutor) => void;
    currentProfile: Tutor;
};

const EditProfileForm: React.FC<EditProfileFormProps> = ({onClose, onProfileUpdate, currentProfile}) => {
   const { user, token } = useSelector((state: RootState) => state.auth);


   const [allSubjects, setAllSubjects] = useState<ISubject[]>([]);


  const getSubjectIds = (subjects: any[] | undefined): string[] => {
    if (!subjects || !Array.isArray(subjects)) return [];
    
    return subjects.map(s => {
      // Caso 1: Ya es un ID (string)
      if (typeof s === 'string') return s;
      // Caso 2: Es un objeto poblado (tiene _id)
      if (s && typeof s === 'object' && s._id) return s._id;
      return null;
    }).filter((id): id is string => Boolean(id)); // Eliminamos nulos
  };

   //Estado local para el formulario.
   const [formData, setFormData] = useState({
    name: currentProfile.name || '',
    location: currentProfile.location || '',
    bio: currentProfile.bio || '',
    profilePicture: currentProfile.profilePicture || '',
    price: currentProfile.price || 0,
    modality: currentProfile.modality || 'online',
    subjects: getSubjectIds(currentProfile.subjects),
   });

   const [message, setMessage] = useState('');
   //El messageType puede ser o success, o error, o "". Por defecto está en "".
   const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

   //Funcion para cargar las materias disponibles.
   useEffect(() => {
    const fetchSubjects = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/subjects')
            setAllSubjects(response.data)
        } catch (error) {
            console.error('Error al cargar las materias', error);
        }
    };
    fetchSubjects();
   }, []);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
        ...formData,
        [e.target.name] : e.target.value,
    });
   };

   //Agrega o quita el ID de la materia del array según si se marca o desmarca la casilla.
   const handleSubjectChange = (subjectId: string) => {
    setFormData(prev => {
        const currentSubjects = prev.subjects;
        if (currentSubjects.includes(subjectId)) {
            return {...prev, subjects: currentSubjects.filter(id => id !== subjectId)} //Si esta el id(la casilla esta marcada) Se saca.
        } else {
            return {...prev, subjects: [...currentSubjects, subjectId]}; //Si no esta el id, se agrega.
        }
    })
   }

   const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
   }
   
   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
        const config = {headers: {Authorization: `Bearer ${token}`}};

        const response = await axios.put('http://localhost:5001/api/profile', formData, config);
        setMessage('Perfil actualizado con éxito');
        setMessageType('success')

        //Actualizamos el estado global.
        // if (token) {
        //     dispatch(login({user: response.data, token}));
        // }

        //Avisamos al estado local para que se refresque visualmente.
        onProfileUpdate(response.data)

        setTimeout(() => {
            onClose();
        }, 1500)
    } catch (error) {
        setMessage('Error al actualizar el perfil.');
        setMessageType('error')
    };
   };

   return(
    <div>
        <h2 className="text-3xl font-bold mb-2 text-gray-900">Editar Perfil</h2>
        <form onSubmit={handleSubmit} className="space-y-2">
            <InputField label="Nombre" name="name" type="text" value={formData.name} onChange={handleChange}/>
            <InputField label="Ubicación" name="location" type="text" value={formData.location} onChange={handleChange}/>
            <InputField label="URL de la Foto de Perfil" name="profilePicture" type="text" value={formData.profilePicture} onChange={handleChange}/>
            <div>
                <label htmlFor="bio" className="mb-2 text-lg">Biografía</label>
                <textarea 
                    id="bio" 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm" 
                />
            </div>
            {user?.role === 'tutor' && (
                <>
                <div>
                <label className="mb-2 text-lg"> Materias que enseñas </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border rounded-md bg-gray-50">
                    {allSubjects.map((subject) => (
                        <label key={subject._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                            <input
                                type="checkbox"
                                checked={formData.subjects.includes(subject._id)}
                                onChange={() => handleSubjectChange(subject._id)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                            <span className="text-sm text-gray-700">{subject.name}</span>
                        </label>
                    ))}
                    {allSubjects.length === 0 && <p className="text-sm text-gray-500">Cargando materias...</p>}
                </div>
                <p className="text-xs text-gray-500 mt-1">Selecciona todas las que apliquen.</p>
            </div>
            <div>
                <label className="mb-2 text-lg">Modalidad</label>
                <select 
                name="modality" 
                id="modality"
                value={formData.modality}
                onChange={handleSelectChange}
                className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="remote">Online</option>
                    <option value="in-person">Presencial</option>
                    <option value="hybrid">Híbrido</option>
                </select>
            </div>
            
                <InputField label="Precio por hora" name="price" type="number" value={formData.price} onChange={handleChange}/>
                </>
            )}
            {message && (<p className={`my-2 text-start text-sm p-3 rounded-xl ${messageType === 'success' ? 'text-primary bg-green-500' : 'text-white bg-red-500'}`}>{message}</p>)}
            <div className="flex gap-2">
                <Button type="submit">Guardar Cambios</Button>
                <button type="button" onClick={onClose} className="rounded-xl p-3 mt-4 border border-red-300 shadow-sm text-gray-700 hover:bg-red-500 hover:text-white transition duration-300 ease-in-out"> Cancelar </button>
            </div>
        </form>
    </div>
   );
};

export default EditProfileForm
