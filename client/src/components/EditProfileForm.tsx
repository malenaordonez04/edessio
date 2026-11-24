import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { type RootState } from "../app/store";
import { login } from "../features/auth/authSlice";
import type { Tutor, ISubject } from "../types";
import {
    MdPhotoCamera,
    MdClose,
    MdCheck,
    MdPerson,
    MdLocationOn,
    MdAttachMoney,
    MdAdd,
    MdSearch
} from "react-icons/md";

type EditProfileFormProps = {
    onClose: () => void;
    onProfileUpdate: (updatedUser: Tutor) => void;
    currentProfile: Tutor;
};

// Sin "as const", TypeScript piensa que 'value' puede ser cualquier texto (string) y da error al guardarlo en formData.modality.
// Con "as const", le aseguramos que los valores son fijos y exactos ("remote" | "in-person" | "hybrid").
const MODALITY_OPTIONS = [
    { value: "remote", label: "Online" },
    { value: "in-person", label: "Presencial" },
    { value: "hybrid", label: "Híbrido" }
] as const;

// Normaliza textos quitando tildes y mayúsculas para comparar sin duplicar materias (ej: "matematica" === "Matemática")
const normalizeText = (text: string) =>
    text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

const EditProfileForm: React.FC<EditProfileFormProps> = ({
    onClose,
    onProfileUpdate,
    currentProfile
}) => {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    const [allSubjects, setAllSubjects] = useState<ISubject[]>([]);

    // Estados del buscador/creador unificado de materias
    const [subjectSearch, setSubjectSearch] = useState("");
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
    const [addingSubject, setAddingSubject] = useState(false);
    const [subjectError, setSubjectError] = useState("");
    const subjectBoxRef = useRef<HTMLDivElement>(null);

    // Normalizamos las materias actuales del profesor a un array de IDs (strings)
    const getSubjectIds = (subjects: any[] | undefined): string[] => {
        if (!subjects || !Array.isArray(subjects)) return [];
        return subjects
            .map((s) => {
                if (typeof s === "string") return s;
                if (s && typeof s === "object" && s._id) return s._id;
                return null;
            })
            .filter((id): id is string => Boolean(id));
    };

    const [formData, setFormData] = useState({
        name: currentProfile.name || "",
        location: currentProfile.location || "",
        bio: currentProfile.bio || "",
        price: currentProfile.price || 0,
        modality: currentProfile.modality || "remote",
        subjects: getSubjectIds(currentProfile.subjects)
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(currentProfile.profilePicture || "");

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">("");

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await axios.get("http://localhost:5001/api/subjects");
                setAllSubjects(response.data);
            } catch (error) {
                console.error("Error al cargar las materias", error);
            }
        };
        if (user?.role === "tutor") {
            fetchSubjects();
        }
    }, [user?.role]);

    // Cierra el desplegable de sugerencias si el usuario hace clic afuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                subjectBoxRef.current &&
                e.target instanceof Node &&
                !subjectBoxRef.current.contains(e.target)
            ) {
                setIsSubjectDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const toggleSubject = (subjectId: string) => {
        setFormData((prev) => {
            const exists = prev.subjects.includes(subjectId);
            return {
                ...prev,
                subjects: exists
                    ? prev.subjects.filter((id) => id !== subjectId)
                    : [...prev.subjects, subjectId]
            };
        });
    };

    // Crea una materia nueva en la BDD o selecciona la existente si ya estaba cargada
    const handleCreateOrSelectSubject = async () => {
        const trimmed = subjectSearch.trim();
        if (!trimmed) return;

        setSubjectError("");
        const normalizedQuery = normalizeText(trimmed);

        // Si ya existe en la BDD (ignorando tildes y mayúsculas), la seleccionamos sin duplicar
        const existing = allSubjects.find((s) => normalizeText(s.name) === normalizedQuery);
        if (existing) {
            if (!formData.subjects.includes(existing._id)) {
                setFormData((prev) => ({
                    ...prev,
                    subjects: [...prev.subjects, existing._id]
                }));
            }
            setSubjectSearch("");
            setIsSubjectDropdownOpen(false);
            return;
        }

        setAddingSubject(true);
        try {
            const res = await axios.post(
                "http://localhost:5001/api/subjects",
                { name: trimmed },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const createdSubject: ISubject = res.data;
            setAllSubjects((prev) => [...prev, createdSubject]);
            setFormData((prev) => ({
                ...prev,
                subjects: [...prev.subjects, createdSubject._id]
            }));
            setSubjectSearch("");
            setIsSubjectDropdownOpen(false);
        } catch (error: any) {
            setSubjectError(
                error.response?.data?.message || "No se pudo agregar la materia. Intentá de nuevo."
            );
        } finally {
            setAddingSubject(false);
        }
    };

    // Resolvemos los objetos completos de las materias ya elegidas para mostrarlas como chips arriba
    const selectedSubjectObjects: ISubject[] = formData.subjects.map((id) => {
        const fromAll = allSubjects.find((s) => s._id === id);
        if (fromAll) return fromAll;
        const fromProfile = Array.isArray(currentProfile.subjects)
            ? (currentProfile.subjects as any[]).find((s) => typeof s === "object" && s._id === id)
            : null;
        return fromProfile || { _id: id, name: "..." };
    });

    // Filtramos las opciones del desplegable:
    // - Si el buscador está vacío, mostramos hasta 6 sugerencias no seleccionadas aún
    // - Si hay texto escrito, mostramos todas las coincidencias que contengan ese texto
    const normalizedQuery = normalizeText(subjectSearch);
    const filteredSuggestions = normalizedQuery
        ? allSubjects.filter((s) => normalizeText(s.name).includes(normalizedQuery))
        : allSubjects.filter((s) => !formData.subjects.includes(s._id)).slice(0, 6);

    const hasExactMatch =
        normalizedQuery.length > 0 &&
        allSubjects.some((s) => normalizeText(s.name) === normalizedQuery);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const payload = new FormData();
            payload.append("name", formData.name);
            payload.append("location", formData.location);
            payload.append("bio", formData.bio);

            if (selectedFile) {
                payload.append("profilePicture", selectedFile);
            }

            if (user?.role === "tutor") {
                payload.append("modality", formData.modality);
                payload.append("price", String(formData.price));
                payload.append("subjects", JSON.stringify(formData.subjects));
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const response = await axios.put("http://localhost:5001/api/profile", payload, config);
            setMessage("¡Perfil actualizado con éxito!");
            setMessageType("success");

            if (token) {
                dispatch(login({ user: response.data, token }));
            }

            onProfileUpdate(response.data);

            setTimeout(() => {
                onClose();
            }, 1100);
        } catch (error) {
            setMessage("No se pudo actualizar el perfil. Intentá nuevamente.");
            setMessageType("error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-h-[85vh] overflow-y-auto pr-1">
            {/* Encabezado */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Editar Perfil</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Personalizá cómo te ven los demás usuarios en la plataforma.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    aria-label="Cerrar"
                >
                    <MdClose className="h-5 w-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                {/* Bloque superior: Avatar interactivo */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                    <label
                        htmlFor="profilePictureInput"
                        className="relative group cursor-pointer flex-shrink-0"
                        title="Cambiar foto de perfil"
                    >
                        <img
                            src={
                                previewUrl ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || "U")}&background=random`
                            }
                            alt="Vista previa"
                            className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-sm group-hover:opacity-80 transition-opacity"
                        />
                        <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-white shadow-md group-hover:scale-105 transition-transform">
                            <MdPhotoCamera className="h-4 w-4" />
                        </span>
                    </label>

                    <div className="flex-grow">
                        <label
                            htmlFor="profilePictureInput"
                            className="inline-block text-sm font-semibold text-primary hover:underline cursor-pointer"
                        >
                            {selectedFile ? "Cambiar imagen seleccionada" : "Subir nueva foto de perfil"}
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {selectedFile
                                ? `Archivo listo: ${selectedFile.name}`
                                : "Elegí una imagen JPG, PNG o WEBP desde tu dispositivo."}
                        </p>
                        <input
                            id="profilePictureInput"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Nombre y Ubicación */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-600 mb-1.5">
                            <MdPerson className="text-gray-400 h-4 w-4" /> Nombre
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Tu nombre completo"
                            className="w-full px-3.5 py-2.5 text-sm bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-600 mb-1.5">
                            <MdLocationOn className="text-gray-400 h-4 w-4" /> Ubicación
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Ej: Buenos Aires, Madrid..."
                            className="w-full px-3.5 py-2.5 text-sm bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* Biografía */}
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="bio" className="text-xs font-bold uppercase tracking-wide text-gray-600">
                            Biografía
                        </label>
                        <span className="text-[11px] text-gray-400">{formData.bio.length}/300</span>
                    </div>
                    <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        maxLength={300}
                        rows={3}
                        placeholder="Contá un poco sobre vos, tus intereses o tu experiencia..."
                        className="w-full p-3.5 text-sm bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                    />
                </div>

                {/* Sección exclusiva para Profesores */}
                {user?.role === "tutor" && (
                    <div className="pt-4 border-t border-gray-100 space-y-5">
                        {/* Modalidad y Precio */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1.5">
                                    Modalidad
                                </label>
                                <div className="flex gap-1.5">
                                    {MODALITY_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, modality: opt.value })}
                                            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                                formData.modality === opt.value
                                                    ? "bg-primary text-white border-primary shadow-2xs"
                                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-600 mb-1.5">
                                    <MdAttachMoney className="text-gray-400 h-4 w-4" /> Precio por hora
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    min={0}
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2 text-sm bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        {/* Materias seleccionadas + Buscador con autocompletado */}
                        <div className="space-y-2.5" ref={subjectBoxRef}>
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold uppercase tracking-wide text-gray-600">
                                    Materias que enseñás
                                </label>
                                <span className="text-[11px] text-gray-400">
                                    {selectedSubjectObjects.length} seleccionada
                                    {selectedSubjectObjects.length === 1 ? "" : "s"}
                                </span>
                            </div>

                            {/* Chips de materias activas (con botón × para quitar) */}
                            {selectedSubjectObjects.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedSubjectObjects.map((subject) => (
                                        <span
                                            key={subject._id}
                                            className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-2xs"
                                        >
                                            <span>{subject.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => toggleSubject(subject._id)}
                                                aria-label={`Quitar ${subject.name}`}
                                                className="p-0.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                                            >
                                                <MdClose className="h-3.5 w-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Input único para buscar entre materias existentes o crear una nueva */}
                            <div className="relative">
                                <div className="relative flex items-center">
                                    <MdSearch className="h-4 w-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={subjectSearch}
                                        onFocus={() => setIsSubjectDropdownOpen(true)}
                                        onChange={(e) => {
                                            setSubjectSearch(e.target.value);
                                            setIsSubjectDropdownOpen(true);
                                            setSubjectError("");
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleCreateOrSelectSubject();
                                            }
                                        }}
                                        placeholder="Buscá una materia o escribí una nueva (ej. Física)..."
                                        className="w-full pl-9 pr-8 py-2.5 text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                    {subjectSearch && (
                                        <button
                                            type="button"
                                            onClick={() => setSubjectSearch("")}
                                            className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                                            aria-label="Limpiar búsqueda"
                                        >
                                            <MdClose className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Desplegable con coincidencias y opción de crear */}
                                {isSubjectDropdownOpen && (
                                    <div className="mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                                        {!normalizedQuery && filteredSuggestions.length > 0 && (
                                            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50/80">
                                                Sugerencias rápidas
                                            </div>
                                        )}

                                        {filteredSuggestions.map((subj) => {
                                            const isAlreadySelected = formData.subjects.includes(subj._id);
                                            return (
                                                <button
                                                    key={subj._id}
                                                    type="button"
                                                    onClick={() => {
                                                        toggleSubject(subj._id);
                                                        setSubjectSearch("");
                                                        setIsSubjectDropdownOpen(false);
                                                    }}
                                                    className="w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-blue-50/60 transition-colors cursor-pointer"
                                                >
                                                    <span className="font-medium text-gray-800">
                                                        {subj.name}
                                                    </span>
                                                    {isAlreadySelected ? (
                                                        <span className="inline-flex items-center gap-1 text-primary font-semibold">
                                                            <MdCheck className="h-4 w-4" /> Seleccionada
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">+ Agregar</span>
                                                    )}
                                                </button>
                                            );
                                        })}

                                        {/* Si escribió algo que no existe exactamente, ofrecemos crearlo directo */}
                                        {normalizedQuery.length > 0 && !hasExactMatch && (
                                            <button
                                                type="button"
                                                onClick={handleCreateOrSelectSubject}
                                                disabled={addingSubject}
                                                className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-primary bg-blue-50/50 hover:bg-blue-50 flex items-center gap-2 transition-colors cursor-pointer"
                                            >
                                                <MdAdd className="h-4 w-4 flex-shrink-0" />
                                                <span>
                                                    {addingSubject
                                                        ? "Creando materia..."
                                                        : `Crear y agregar "${subjectSearch.trim()}"`}
                                                </span>
                                            </button>
                                        )}

                                        {normalizedQuery.length === 0 && filteredSuggestions.length === 0 && (
                                            <p className="px-3.5 py-2.5 text-xs text-gray-400">
                                                Escribí el nombre de una materia para buscar o crearla.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {subjectError && <p className="text-xs text-red-600">{subjectError}</p>}
                        </div>
                    </div>
                )}

                {/* Feedback de guardado */}
                {message && (
                    <div
                        className={`text-xs font-medium p-3 rounded-xl ${
                            messageType === "success"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                    >
                        {message}
                    </div>
                )}

                {/* Pie del formulario */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-primary hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                        {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfileForm;