import React, {useState, useEffect} from "react";
import axios from "axios";
import TutorCard from "../components/TutorCard";
import type { Tutor } from "../types";
import useDebounce from "../hooks/useDebounce";

interface ISubject {
    _id: string;
    name: string;
}

const FindTutorList = () => {
    //Creamos el estado para guardar la lista de los tutors. Especificamos que cada elemento adentro del array tiene que tener la interface de Tutor. Al principio el array está vacío.
    const [tutors, setTutors] = useState<Tutor[]>([]);

    //Creamos un estado para saber si estamos cargando los datos.
    const [loading, setLoading] = useState(true);

    //Creamos los estados para los filtros.
    const [searchQuery, setSearchQuery] = useState('');
    const [subject, setSubject] = useState('');
    const [modality, setModality] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const [allSubjects, setAllSubjects] = useState<ISubject[]>([]);

    //Creamos el estado retrasado (debounced), le decimos que observe searchQuery y que espere 500ms.
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const debouncedMinPrice = useDebounce(minPrice, 1500);
    const debouncedMaxPrice = useDebounce(maxPrice, 1500);

    //UseEffect para cargar las materias.
    useEffect(() => {
        const fetchAllSubjects = async () => {
            try {
                const response = await axios.get("http://localhost:5001/api/subjects");
                setAllSubjects(response.data);
            } catch (error) {
                console.error('Error al cargar las materias', error);
                
            }
        };
        fetchAllSubjects();
    }, []) //Se ejecuta solo una vez al cargar la página.

    //UseEffect para cargar los profesores (filtrados).
    useEffect(() => {
        const fetchTutors = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();

                //Añadimos los parámetros solo si tienen valor
                //Usamos el valor retrasado. DebouncedSearchQuery observa todos los cambios de searchQuery.
                if (debouncedSearchQuery) {
                    params.append('search', debouncedSearchQuery);
                }
                if (subject) {
                    params.append('subject', subject);
                }

                if (modality) {
                    params.append('modality', modality);
                }

                if (debouncedMinPrice) params.append('minPrice', debouncedMinPrice);
                if (debouncedMaxPrice) params.append('maxPrice', debouncedMaxPrice);
                //Buscamos los datos en la API pasando los parámetros.
                const response = await axios.get("http://localhost:5001/api/tutors", {params});

                setTutors(response.data) //Guardamos la lista de tutors en el estado.                
                
            } catch (error) {
                console.error('Error al obtener los tutores:', error);
            } finally {
                setLoading(false); //Dejamos de cargar, teniendo éxito o no.
            };
        };

        fetchTutors(); //Llamamos a la función        
    }, [debouncedSearchQuery, subject, modality, debouncedMaxPrice, debouncedMinPrice]); // Se ejecuta cada vez que searchQuery y subject cambian.

    if (loading) {
        return <p className="text-center mt-10">Cargando profesores...</p>
    };

    return(
        <div>
            <h2 className="text-3xl md:text-4xl font-base my-6 text-left ml-4 p-2">¡Encontrá el profesor que <a className="font-medium text-secondary">necesitas</a>!</h2>

            <div className="flex flex-col md:flex-row gap-4 mx-8 mb-6">
                <input 
                type="text"
                placeholder="Buscar por nombre..."
                className="flex-grow p-2 border border-gray-300 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                className="p-2 border border-gray-300 rounded-md"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}  
                >
                    <option value="">Todas las materias</option>
                    {allSubjects.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                </select>
                <div>
                    <label className="block text-xs font-bol text-gray-500 mb-1 uppercase">Modalidad</label>
                    <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={modality}
                    onChange={(e) => setModality(e.target.value)}
                    >
                        <option value="">Cualquiera</option>
                        <option value="remote">Online</option>
                        <option value="in-person">Presencial</option>
                        <option value="hybrid">Híbrido</option>
                    </select>
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-2 flex gap-2 items-end">
                    <div className="w-1/2">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Precio Mín ($)</label>
                        <input 
                        type="number"
                        placeholder="0"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        />
                    </div>
                    <div className="w-1/2">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Precio Máx ($)</label>
                        <input 
                        type="number"
                        placeholder="Sin límite"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                </div> 
                <div className="flex items-end">
                    <button
                    onClick={() => {
                        setSearchQuery('');
                        setSubject('');
                        setModality('');
                        setMinPrice('');
                        setMaxPrice('');
                    }}
                    className="w-full p-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        Limpiar Filtros
                    </button>
                </div>
            </div>
            
            {loading ? (
                <p className="text-center mt-10">Cargando profesores...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-8">
                    {tutors.length > 0 ? (
                        tutors.map(tutor => (
                            <TutorCard key={tutor._id} tutor={tutor} />
                        ))
                    ) : (
                        <p className="text-center col-span-full mt-10">No se encontraron profesores</p>
                    )}
                </div>
            ) }
        </div>
    )
};

export default FindTutorList