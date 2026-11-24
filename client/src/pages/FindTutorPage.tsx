import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import {
    MdSearch,
    MdClose,
    MdFilterList,
    MdSchool,
    MdAttachMoney,
    MdSearchOff,
    MdRefresh,
    MdExpandMore,
    MdCheck
} from "react-icons/md";
import TutorCard from "../components/TutorCard";
import type { Tutor } from "../types";
import useDebounce from "../hooks/useDebounce";

interface ISubject {
    _id: string;
    name: string;
}

const MODALITY_FILTERS = [
    { value: "", label: "Todas" },
    { value: "remote", label: "Online" },
    { value: "in-person", label: "Presencial" },
    { value: "hybrid", label: "Híbrido" }
] as const;

const normalizeText = (text: string) =>
    text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

const FindTutorList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialSearchParam = searchParams.get("search") || "";

    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [searchQuery, setSearchQuery] = useState(initialSearchParam);
    const [subject, setSubject] = useState("");
    const [modality, setModality] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const [allSubjects, setAllSubjects] = useState<ISubject[]>([]);
    const [urlParamProcessed, setUrlParamProcessed] = useState(false);

    // Estados del desplegable buscable de materias
    const [isSubjectMenuOpen, setIsSubjectMenuOpen] = useState(false);
    const [subjectFilterInput, setSubjectFilterInput] = useState("");
    const subjectDropdownRef = useRef<HTMLDivElement>(null);

    const debouncedSearchQuery = useDebounce(searchQuery, 450);
    const debouncedMinPrice = useDebounce(minPrice, 800);
    const debouncedMaxPrice = useDebounce(maxPrice, 800);

    // Cargamos las materias y sincronizamos ?search= si vino desde la Home
    useEffect(() => {
        const fetchAllSubjects = async () => {
            try {
                const response = await axios.get("http://localhost:5001/api/subjects");
                const loadedSubjects: ISubject[] = response.data;
                setAllSubjects(loadedSubjects);

                if (initialSearchParam && !urlParamProcessed) {
                    const matchedSubject = loadedSubjects.find(
                        (s) => normalizeText(s.name) === normalizeText(initialSearchParam)
                    );
                    if (matchedSubject) {
                        setSubject(matchedSubject._id);
                        setSearchQuery("");
                    }
                    setUrlParamProcessed(true);
                }
            } catch (error) {
                console.error("Error al cargar las materias:", error);
            }
        };
        fetchAllSubjects();
    }, [initialSearchParam, urlParamProcessed]);

    // Cierra el desplegable de materias al hacer clic afuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                subjectDropdownRef.current &&
                e.target instanceof Node &&
                !subjectDropdownRef.current.contains(e.target)
            ) {
                setIsSubjectMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Buscamos profesores filtrados
    useEffect(() => {
        const fetchTutors = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();

                if (debouncedSearchQuery.trim()) {
                    params.append("search", debouncedSearchQuery.trim());
                }
                if (subject) {
                    params.append("subject", subject);
                }
                if (modality) {
                    params.append("modality", modality);
                }
                if (debouncedMinPrice) {
                    params.append("minPrice", debouncedMinPrice);
                }
                if (debouncedMaxPrice) {
                    params.append("maxPrice", debouncedMaxPrice);
                }

                const response = await axios.get("http://localhost:5001/api/tutors", { params });
                setTutors(response.data);
            } catch (error) {
                console.error("Error al obtener los tutores:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTutors();
    }, [debouncedSearchQuery, subject, modality, debouncedMinPrice, debouncedMaxPrice]);

    // Nombre de la materia seleccionada actualmente para mostrarlo en el botón
    const selectedSubjectName =
        allSubjects.find((s) => s._id === subject)?.name || "Todas las materias";

    // Lista de materias filtrada dentro del desplegable
    const filteredDropdownSubjects = allSubjects.filter((s) =>
        normalizeText(s.name).includes(normalizeText(subjectFilterInput))
    );

    const activeFiltersCount = [
        searchQuery.trim(),
        subject,
        modality,
        minPrice,
        maxPrice
    ].filter(Boolean).length;

    const handleClearFilters = () => {
        setSearchQuery("");
        setSubject("");
        setModality("");
        setMinPrice("");
        setMaxPrice("");
        setSubjectFilterInput("");
        if (searchParams.has("search")) {
            setSearchParams({});
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/60 pb-16">
            {/* ================= CABECERA CON TONO CERCANO Y HUMANO ================= */}
            <section className="relative bg-slate-50 border-b border-gray-200/70 pt-10 pb-14">
                <div
                    className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                        backgroundImage: "radial-gradient(#cbd5e1 1.25px, transparent 1.25px)",
                        backgroundSize: "24px 24px"
                    }}
                />
                <div className="relative container mx-auto px-4 max-w-6xl">
                    <span className="inline-block bg-blue-100/80 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                        Nuestros profesores
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                        ¡Encontrá al <span className="text-secondary">profe ideal</span> para vos!
                    </h1>
                    <p className="text-gray-600 mt-2 text-base sm:text-lg max-w-2xl">
                        Conocé a los docentes de Edessio, elegí según tus objetivos y coordiná tu próxima clase 1 a 1
                    </p>
                </div>
            </section>

            {/* ================= PANEL DE FILTROS ELEVADO ================= */}
            <div className="container mx-auto px-4 max-w-6xl -mt-8 relative z-10">
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg shadow-gray-200/50 p-5 sm:p-6 space-y-5">
                    {/* FILA 1: Búsqueda por nombre + Desplegable buscable de materia */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Input de búsqueda por nombre */}
                        <div className="md:col-span-7">
                            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                                Nombre del profesor
                            </label>
                            <div className="relative flex items-center">
                                <MdSearch className="h-5 w-5 text-gray-400 absolute left-3.5 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Ej: Tomás, María, Lucas..."
                                    className="w-full pl-10 pr-9 py-2.5 text-sm bg-gray-50/70 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        aria-label="Borrar búsqueda"
                                        className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    >
                                        <MdClose className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Combobox buscable de materia */}
                        <div className="md:col-span-5 relative" ref={subjectDropdownRef}>
                            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                                Materia
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsSubjectMenuOpen((prev) => !prev)}
                                className={`w-full pl-10 pr-3.5 py-2.5 text-sm text-left bg-gray-50/70 border rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                                    isSubjectMenuOpen
                                        ? "bg-white border-primary ring-2 ring-primary/30"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <MdSchool className="h-5 w-5 text-gray-400 absolute left-3.5 pointer-events-none" />
                                <span
                                    className={`truncate ${
                                        subject ? "font-semibold text-primary" : "text-gray-700"
                                    }`}
                                >
                                    {selectedSubjectName}
                                </span>
                                <MdExpandMore
                                    className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
                                        isSubjectMenuOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {/* Menú flotante con filtro de texto */}
                            {isSubjectMenuOpen && (
                                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden">
                                    {/* Buscador interno */}
                                    <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                                        <div className="relative flex items-center">
                                            <MdSearch className="h-4 w-4 text-gray-400 absolute left-2.5 pointer-events-none" />
                                            <input
                                                type="text"
                                                autoFocus
                                                value={subjectFilterInput}
                                                onChange={(e) => setSubjectFilterInput(e.target.value)}
                                                placeholder="Filtrar materia..."
                                                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                            />
                                            {subjectFilterInput && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSubjectFilterInput("")}
                                                    className="absolute right-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                                >
                                                    <MdClose className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Listado scrolleable con altura controlada */}
                                    <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSubject("");
                                                setSubjectFilterInput("");
                                                setIsSubjectMenuOpen(false);
                                            }}
                                            className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                                                subject === ""
                                                    ? "font-bold text-primary bg-blue-50/40"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            <span>Todas las materias</span>
                                            {subject === "" && <MdCheck className="h-4 w-4 text-primary" />}
                                        </button>

                                        {filteredDropdownSubjects.length > 0 ? (
                                            filteredDropdownSubjects.map((s) => {
                                                const isSelected = subject === s._id;
                                                return (
                                                    <button
                                                        key={s._id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSubject(s._id);
                                                            setSubjectFilterInput("");
                                                            setIsSubjectMenuOpen(false);
                                                        }}
                                                        className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-blue-50/50 cursor-pointer ${
                                                            isSelected
                                                                ? "font-bold text-primary bg-blue-50/40"
                                                                : "text-gray-700"
                                                        }`}
                                                    >
                                                        <span>{s.name}</span>
                                                        {isSelected && (
                                                            <MdCheck className="h-4 w-4 text-primary" />
                                                        )}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <p className="px-3.5 py-3 text-xs text-gray-400 text-center">
                                                No hay materias que coincidan con "{subjectFilterInput}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* FILA 2: Píldoras de Modalidad + Rango de Precio + Limpiar Filtros */}
                    <div className="pt-4 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                        {/* Píldoras de Modalidad */}
                        <div className="lg:col-span-5">
                            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                                Modalidad
                            </label>
                            <div className="flex flex-wrap sm:flex-nowrap gap-1.5 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
                                {MODALITY_FILTERS.map((opt) => {
                                    const isActive = modality === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setModality(opt.value)}
                                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                                isActive
                                                    ? "bg-primary text-white shadow-xs"
                                                    : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Rango de Precio Mínimo y Máximo */}
                        <div className="lg:col-span-5">
                            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                                Precio por hora
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <MdAttachMoney className="h-4 w-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="Mínimo"
                                        className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                </div>
                                <span className="text-gray-400 text-xs font-medium">—</span>
                                <div className="relative flex-1">
                                    <MdAttachMoney className="h-4 w-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="Máximo"
                                        className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botón Limpiar Filtros */}
                        <div className="lg:col-span-2 flex justify-end">
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                disabled={activeFiltersCount === 0}
                                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                    activeFiltersCount > 0
                                        ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer"
                                        : "bg-gray-100 text-gray-400 border border-transparent cursor-not-allowed"
                                }`}
                            >
                                <MdRefresh className="h-4 w-4" />
                                <span>
                                    Limpiar{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ================= BARRA DE ESTADO DE RESULTADOS ================= */}
                <div className="flex items-center justify-between mt-8 mb-5 px-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MdFilterList className="text-primary h-4 w-4" />
                        {loading ? (
                            <span>Buscando profesores disponibles...</span>
                        ) : (
                            <span>
                                {tutors.length === 1
                                    ? "1 profesor encontrado"
                                    : `${tutors.length} profesores encontrados`}
                            </span>
                        )}
                    </div>
                </div>

                {/* ================= GRILLA DE RESULTADOS ================= */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                        <p className="text-sm text-gray-500">Cargando profesores...</p>
                    </div>
                ) : tutors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tutors.map((tutor) => (
                            <TutorCard key={tutor._id} tutor={tutor} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center max-w-lg mx-auto my-8 shadow-xs">
                        <div className="h-14 w-14 rounded-full bg-blue-50 text-primary flex items-center justify-center mx-auto mb-4">
                            <MdSearchOff className="h-7 w-7" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                            No encontramos profesores con esos filtros
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 mb-6">
                            Probá ampliando el rango de precio, cambiando la modalidad o limpiando los filtros actuales.
                        </p>
                        {activeFiltersCount > 0 && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                            >
                                Ver todos los profesores
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindTutorList;