// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//     MdSearch,
//     MdVerifiedUser,
//     MdSchool,
//     MdBolt,
//     MdStar,
//     MdArrowForward,
//     MdVideocam,
//     MdLocationOn
// } from "react-icons/md";
// import type { Tutor, ISubject } from "../types";
// import { translateModality } from "../utils/textFormatters";

// // Datos de respaldo por si todavía hay pocos tutores cargados en MongoDB
// const FALLBACK_TUTORS: any[] = [
//     {
//         _id: "demo-1",
//         name: "Tomás",
//         price: 6000,
//         modality: "online",
//         subjects: [{ _id: "s1", name: "Programación" }],
//         bio: "Profesor con más de 15 años de experiencia en programación y desarrollo web.",
//         averageRating: 4.8,
//         reviewCount: 3
//     },
//     {
//         _id: "demo-2",
//         name: "María",
//         price: 6000,
//         modality: "in-person",
//         location: "CABA",
//         subjects: [{ _id: "s2", name: "Lengua" }, { _id: "s3", name: "Literatura" }],
//         bio: "Soy una apasionada por la Lengua y Literatura, doy clases personalizadas para todos los niveles.",
//         averageRating: 4.9,
//         reviewCount: 3
//     },
//     {
//         _id: "demo-3",
//         name: "Lucas",
//         price: 5500,
//         modality: "hybrid",
//         location: "Palermo, CABA",
//         subjects: [{ _id: "s4", name: "Matemática" }],
//         bio: "Ingeniero y docente universitario. Preparación de parciales, finales e ingreso.",
//         averageRating: 5.0,
//         reviewCount: 7
//     }
// ];

// const TESTIMONIALS = [
//     {
//         name: "Cecilia",
//         role: "Alumna",
//         rating: 5,
//         text: "Encontré a mi profe ideal para bioquímica en minutos. La interfaz es súper clara y me encantó poder elegir entre clases virtuales o presenciales."
//     },
//     {
//         name: "Juan",
//         role: "Profesor",
//         rating: 5,
//         text: "Me gusta dar clases por Edessio porque me permite mostrar mi perfil profesional con libertad y tener mayor visibilidad con mis alumnos."
//     },
//     {
//         name: "Martín",
//         role: "Alumno",
//         rating: 5,
//         text: "EDESSIO me salvó con programación. Lo mejor es que sólo pago las clases que necesito, sin suscripciones raras."
//     },
//     {
//         name: "Malena",
//         role: "Alumna",
//         rating: 5,
//         text: "Plataformas hay muchas, pero esta me pareció mucho más humana. Me gusta que se valore la comunicación y que sea fácil adaptarse a lo que uno necesita."
//     }
// ];

// const STEPS = [
//     {
//         number: 1,
//         title: "Registrate o iniciá sesión",
//         description: "¡Unite a EDESSIO y disfrutá de las ventajas de estudiar con nosotros!"
//     },
//     {
//         number: 2,
//         title: "Buscá tu profesor ideal",
//         description: "¡Explorá todas nuestras opciones y elegí a tu Profe!"
//     },
//     {
//         number: 3,
//         title: "Preguntá por disponibilidad",
//         description: "Elegí el horario que más te convenga y coordiná directo con el Profe."
//     },
//     {
//         number: 4,
//         title: "¡Listo! Estudiar es fácil",
//         description: "Disfrutá de tu clase particular y seguí creciendo con EDESSIO al lado tuyo."
//     }
// ];

// const HomePage: React.FC = () => {
//     const navigate = useNavigate();
//     const [searchInput, setSearchInput] = useState("");
//     const [selectedSubject, setSelectedSubject] = useState("");
//     const [subjects, setSubjects] = useState<ISubject[]>([]);
//     const [featuredTutors, setFeaturedTutors] = useState<any[]>([]);
//     const [loadingTutors, setLoadingTutors] = useState(true);

//     // Cargar materias para los filtros rápidos
//     useEffect(() => {
//         const fetchSubjects = async () => {
//             try {
//                 const res = await axios.get("http://localhost:5001/api/subjects");
//                 setSubjects(res.data.slice(0, 4));
//             } catch (error) {
//                 console.error("Error cargando materias en Home:", error);
//             }
//         };
//         fetchSubjects();
//     }, []);

//     // Cargar profesores destacados (filtrables por materia)
//     useEffect(() => {
//         const fetchFeaturedTutors = async () => {
//             setLoadingTutors(true);
//             try {
//                 const params = new URLSearchParams();
//                 if (selectedSubject) params.append("subject", selectedSubject);

//                 const res = await axios.get("http://localhost:5001/api/tutors", { params });
//                 if (res.data && res.data.length > 0) {
//                     setFeaturedTutors(res.data.slice(0, 3));
//                 } else {
//                     setFeaturedTutors(FALLBACK_TUTORS);
//                 }
//             } catch (error) {
//                 console.error("Error cargando tutores destacados:", error);
//                 setFeaturedTutors(FALLBACK_TUTORS);
//             } finally {
//                 setLoadingTutors(false);
//             }
//         };
//         fetchFeaturedTutors();
//     }, [selectedSubject]);

//     const handleSearchSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         // Ajustá "/find-tutor" si tu ruta en App.tsx se llama "/tutors"
//         const query = searchInput.trim() ? `?search=${encodeURIComponent(searchInput.trim())}` : "";
//         navigate(`/find-tutor${query}`);
//     };

//     return (
//         <div className="min-h-screen flex flex-col bg-white text-gray-800">
//             {/* ================= 1. HERO SECTION ================= */}
//             <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50/60 border-b border-gray-100">
//                 <div className="container mx-auto px-4 py-14 md:py-24 max-w-6xl">
//                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
//                         <div className="lg:col-span-7 space-y-6 text-left">
//                             <span className="inline-block bg-blue-100 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
//                                 Clases particulares a tu medida
//                             </span>

//                             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
//                                 Un mundo de <span className="text-secondary">conocimiento</span> a tu alcance.
//                             </h1>

//                             <p className="text-lg sm:text-xl text-gray-600 font-light max-w-xl">
//                                 Hacemos que el aprendizaje sea más que un camino, una aventura. Conectá con profesores verificados de forma simple y directa.
//                             </p>

//                             {/* Barra de búsqueda */}
//                             <form onSubmit={handleSearchSubmit} className="max-w-xl">
//                                 <div className="flex items-center bg-white border border-gray-200 rounded-full p-1.5 shadow-md focus-within:ring-2 focus-within:ring-primary transition-all">
//                                     <input
//                                         type="text"
//                                         placeholder="Encontrá tu profesor ideal (ej. Matemática, React...)"
//                                         className="flex-grow px-4 py-2.5 text-gray-700 bg-transparent focus:outline-none text-sm sm:text-base"
//                                         value={searchInput}
//                                         onChange={(e) => setSearchInput(e.target.value)}
//                                     />
//                                     <button
//                                         type="submit"
//                                         aria-label="Buscar profesor"
//                                         className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity font-medium text-sm"
//                                     >
//                                         <MdSearch className="h-5 w-5" />
//                                         <span className="hidden sm:inline">Buscar</span>
//                                     </button>
//                                 </div>
//                             </form>

//                             {/* Atajos rápidos */}
//                             <div className="flex flex-wrap items-center gap-2 pt-1 text-sm text-gray-500">
//                                 <span className="font-medium text-gray-700">Populares:</span>
//                                 {["Matemática", "Programación", "Inglés", "Lengua"].map((tag) => (
//                                     <button
//                                         key={tag}
//                                         type="button"
//                                         onClick={() => navigate(`/find-tutor?search=${encodeURIComponent(tag)}`)}
//                                         className="px-3 py-1 rounded-full bg-white border border-gray-200 hover:border-secondary hover:text-primary transition-colors text-xs font-medium"
//                                     >
//                                         {tag}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Tarjeta visual decorativa (visible en tablets/desktop) */}
//                         <div className="hidden lg:block lg:col-span-5">
//                             <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 space-y-5 relative">
//                                 <div className="flex items-center gap-4">
//                                     <div className="h-14 w-14 rounded-full bg-secondary/20 text-primary flex items-center justify-center font-bold text-xl">
//                                         ED
//                                     </div>
//                                     <div>
//                                         <p className="font-bold text-gray-900">Aprendizaje 1 a 1</p>
//                                         <p className="text-sm text-gray-500">Virtual o presencial en tu zona</p>
//                                     </div>
//                                 </div>
//                                 <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
//                                     <div className="flex justify-between text-sm">
//                                         <span className="text-gray-500">Modalidad</span>
//                                         <span className="font-semibold text-primary">100% Flexible</span>
//                                     </div>
//                                     <div className="flex justify-between text-sm">
//                                         <span className="text-gray-500">Sin suscripciones</span>
//                                         <span className="font-semibold text-green-600">Pagás por clase</span>
//                                     </div>
//                                     <div className="flex justify-between text-sm">
//                                         <span className="text-gray-500">Chat directo</span>
//                                         <span className="font-semibold text-gray-800">Coordinación inmediata</span>
//                                     </div>
//                                 </div>
//                                 <Link
//                                     to="/register"
//                                     className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-primary font-semibold hover:bg-primary hover:text-white transition-colors"
//                                 >
//                                     <span>Empezar gratis</span>
//                                     <MdArrowForward />
//                                 </Link>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* ================= 2. PROFESORES DEL MOMENTO ================= */}
//             <section className="py-16 bg-white">
//                 <div className="container mx-auto px-4 max-w-6xl">
//                     <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
//                         <div>
//                             <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
//                                 ¡Nuestros <span className="text-secondary">profesores</span> del momento!
//                             </h2>
//                             <p className="text-gray-500 mt-1">Explorá perfiles destacados y elegí con quién aprender hoy.</p>
//                         </div>

//                         {/* Pills de filtro por materia */}
//                         <div className="flex flex-wrap gap-2">
//                             <button
//                                 onClick={() => setSelectedSubject("")}
//                                 className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
//                                     selectedSubject === ""
//                                         ? "bg-primary text-white shadow-sm"
//                                         : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                                 }`}
//                             >
//                                 Todos
//                             </button>
//                             {subjects.map((subj) => (
//                                 <button
//                                     key={subj._id}
//                                     onClick={() => setSelectedSubject(subj._id)}
//                                     className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
//                                         selectedSubject === subj._id
//                                             ? "bg-primary text-white shadow-sm"
//                                             : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                                     }`}
//                                 >
//                                     {subj.name}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>

//                     {loadingTutors ? (
//                         <div className="flex justify-center py-12">
//                             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             {featuredTutors.map((tutor: any) => (
//                                 <div
//                                     key={tutor._id}
//                                     className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
//                                 >
//                                     <div>
//                                         {/* Cabecera de tarjeta: Avatar + Nombre + Precio */}
//                                         <div className="flex items-start justify-between gap-3 mb-4">
//                                             <div className="flex items-center gap-3">
//                                                 <img
//                                                     src={
//                                                         tutor.profilePicture ||
//                                                         `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=random`
//                                                     }
//                                                     alt={tutor.name}
//                                                     className="h-14 w-14 rounded-full object-cover border border-gray-200"
//                                                 />
//                                                 <div>
//                                                     <h3 className="text-lg font-bold text-gray-900">{tutor.name}</h3>
//                                                     <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
//                                                         {tutor.modality === "online" ? (
//                                                             <MdVideocam className="text-primary" />
//                                                         ) : (
//                                                             <MdLocationOn className="text-primary" />
//                                                         )}
//                                                         <span>
//                                                             {translateModality(tutor.modality)}
//                                                             {tutor.location && tutor.modality !== "online"
//                                                                 ? ` - ${tutor.location}`
//                                                                 : ""}
//                                                         </span>
//                                                     </p>
//                                                 </div>
//                                             </div>

//                                             <span className="bg-green-50 text-green-700 font-bold text-sm px-3 py-1 rounded-full whitespace-nowrap">
//                                                 ${tutor.price?.toLocaleString("es-AR") || 6000}/h
//                                             </span>
//                                         </div>

//                                         {/* Materias */}
//                                         <div className="flex flex-wrap gap-1.5 mb-3">
//                                             {tutor.subjects?.slice(0, 3).map((subj: any, i: number) => (
//                                                 <span
//                                                     key={i}
//                                                     className="bg-blue-50 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full"
//                                                 >
//                                                     {typeof subj === "string" ? subj : subj.name}
//                                                 </span>
//                                             ))}
//                                         </div>

//                                         {/* Bio */}
//                                         <p className="text-sm text-gray-600 line-clamp-2 mb-4">
//                                             {tutor.bio || "Profesor particular disponible para clases personalizadas."}
//                                         </p>
//                                     </div>

//                                     {/* Footer tarjeta: Estrellas + Ver más */}
//                                     <div className="flex items-center justify-between pt-3 border-t border-gray-100">
//                                         <div className="flex items-center gap-1 text-sm text-gray-600">
//                                             <MdStar className="text-yellow-400 h-5 w-5" />
//                                             <span className="font-semibold">
//                                                 {(tutor.averageRating || 5).toFixed(1)}
//                                             </span>
//                                             <span className="text-gray-400 text-xs">
//                                                 ({tutor.reviewCount || 3})
//                                             </span>
//                                         </div>

//                                         <Link
//                                             to={tutor._id.startsWith("demo-") ? "/find-tutor" : `/tutor/${tutor._id}`}
//                                             className="text-sm font-semibold text-primary hover:text-secondary transition-colors flex items-center gap-1"
//                                         >
//                                             <span>Ver más</span>
//                                             <MdArrowForward />
//                                         </Link>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}

//                     <div className="text-center mt-10">
//                         <Link
//                             to="/find-tutor"
//                             className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-medium hover:opacity-90 transition-opacity shadow-sm"
//                         >
//                             <span>Explorar todos los profesores</span>
//                             <MdArrowForward />
//                         </Link>
//                     </div>
//                 </div>
//             </section>

//             {/* ================= 3. ¿POR QUÉ EDESSIO? ================= */}
//             <section className="py-16 bg-gray-50 border-y border-gray-100">
//                 <div className="container mx-auto px-4 max-w-6xl">
//                     <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
//                         ¿Por qué <span className="text-secondary">EDESSIO</span> es la mejor opción?
//                     </h2>

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                         <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center space-y-3">
//                             <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-primary flex items-center justify-center">
//                                 <MdVerifiedUser className="h-7 w-7" />
//                             </div>
//                             <h3 className="text-xl font-bold text-gray-900">Garantía 100%</h3>
//                             <p className="text-gray-600 text-sm leading-relaxed">
//                                 Pagás únicamente por las clases que tomás, sin membresías mensuales ni costos ocultos.
//                             </p>
//                         </div>

//                         <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center space-y-3">
//                             <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-primary flex items-center justify-center">
//                                 <MdSchool className="h-7 w-7" />
//                             </div>
//                             <h3 className="text-xl font-bold text-gray-900">Los mejores profesores</h3>
//                             <p className="text-gray-600 text-sm leading-relaxed">
//                                 Perfiles detallados con reseñas reales de otros alumnos para que elijas con total confianza.
//                             </p>
//                         </div>

//                         <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center space-y-3">
//                             <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-primary flex items-center justify-center">
//                                 <MdBolt className="h-7 w-7" />
//                             </div>
//                             <h3 className="text-xl font-bold text-gray-900">Sencillo y eficaz</h3>
//                             <p className="text-gray-600 text-sm leading-relaxed">
//                                 Filtrá por materia, precio y modalidad, chateá directo y coordiná tu clase en minutos.
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* ================= 4. ¿CÓMO FUNCIONA? ================= */}
//             <section className="py-16 bg-white">
//                 <div className="container mx-auto px-4 max-w-6xl">
//                     <div className="text-center max-w-2xl mx-auto mb-14">
//                         <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
//                             ¿Cómo <span className="text-secondary">funciona</span>?
//                         </h2>
//                         <p className="text-gray-500 mt-2">
//                             En cuatro pasos simples ya estás tomando tu próxima clase particular.
//                         </p>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
//                         {STEPS.map((step) => (
//                             <div key={step.number} className="flex flex-col items-center text-center space-y-3">
//                                 <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center shadow-md">
//                                     {step.number}
//                                 </div>
//                                 <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
//                                 <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* ================= 5. ¿QUÉ DICEN DE NOSOTROS? ================= */}
//             <section className="py-16 bg-gray-50 border-t border-gray-100">
//                 <div className="container mx-auto px-4 max-w-6xl">
//                     <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
//                         ¿Qué dicen de <span className="text-secondary">nosotros</span>?
//                     </h2>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                         {TESTIMONIALS.map((item) => (
//                             <div
//                                 key={item.name}
//                                 className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-4"
//                             >
//                                 <div>
//                                     <div className="flex items-center justify-between mb-3">
//                                         <span className="font-bold text-gray-900">{item.name}</span>
//                                         <span
//                                             className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
//                                                 item.role === "Profesor"
//                                                     ? "bg-purple-100 text-purple-700"
//                                                     : "bg-blue-100 text-primary"
//                                             }`}
//                                         >
//                                             {item.role}
//                                         </span>
//                                     </div>
//                                     <p className="text-sm text-gray-600 italic leading-relaxed">
//                                         "{item.text}"
//                                     </p>
//                                 </div>

//                                 <div className="flex items-center gap-0.5 pt-2">
//                                     {Array.from({ length: item.rating }).map((_, idx) => (
//                                         <MdStar key={idx} className="text-yellow-400 h-5 w-5" />
//                                     ))}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* ================= 6. BANNER CTA FINAL ================= */}
//             <section className="py-14 bg-primary text-white">
//                 <div className="container mx-auto px-4 max-w-4xl text-center space-y-6">
//                     <h2 className="text-3xl md:text-4xl font-bold">
//                         ¿Listo para dar el siguiente paso?
//                     </h2>
//                     <p className="text-blue-100 text-lg font-light">
//                         Ya sea que busques aprobar tu próxima materia o compartir lo que sabés dando clases, Edessio es tu lugar.
//                     </p>
//                     <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
//                         <Link
//                             to="/find-tutor"
//                             className="px-7 py-3 rounded-full bg-secondary text-primary font-bold hover:opacity-90 transition-opacity"
//                         >
//                             Buscar mi profesor
//                         </Link>
//                         <Link
//                             to="/register"
//                             className="px-7 py-3 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
//                         >
//                             Quiero dar clases
//                         </Link>
//                     </div>
//                 </div>
//             </section>

//             {/* ================= 7. FOOTER ================= */}
//             <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
//                 <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
//                     <span className="text-white font-bold text-xl tracking-wide">EDESSIO</span>
//                     <p className="text-xs text-center sm:text-right">
//                         Copyright 2026 Edessio. Todos los derechos reservados.
//                     </p>
//                 </div>
//             </footer>
//         </div>
//     );
// };

// export default HomePage;






//Version 2





import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    MdSearch,
    MdVerifiedUser,
    MdSchool,
    MdBolt,
    MdStar,
    MdArrowForward,
    MdVideocam,
    MdLocationOn,
    MdChatBubbleOutline,
    MdCheckCircle,
    MdEventAvailable,
    MdFormatQuote
} from "react-icons/md";
import type { ISubject } from "../types";
import { translateModality } from "../utils/textFormatters";

const FALLBACK_TUTORS: any[] = [
    {
        _id: "demo-1",
        name: "Tomás",
        price: 6000,
        modality: "online",
        subjects: [{ _id: "s1", name: "Programación" }],
        bio: "Profesor con más de 15 años de experiencia en programación y desarrollo web.",
        averageRating: 4.8,
        reviewCount: 3
    },
    {
        _id: "demo-2",
        name: "María",
        price: 6000,
        modality: "in-person",
        location: "CABA",
        subjects: [{ _id: "s2", name: "Lengua" }, { _id: "s3", name: "Literatura" }],
        bio: "Soy una apasionada por la Lengua y Literatura, doy clases personalizadas para todos los niveles.",
        averageRating: 4.9,
        reviewCount: 3
    },
    {
        _id: "demo-3",
        name: "Lucas",
        price: 5500,
        modality: "hybrid",
        location: "Palermo, CABA",
        subjects: [{ _id: "s4", name: "Matemática" }],
        bio: "Ingeniero y docente universitario. Preparación de parciales, finales e ingreso.",
        averageRating: 5.0,
        reviewCount: 7
    }
];

const TESTIMONIALS = [
    {
        name: "Cecilia",
        role: "Alumna",
        subject: "Bioquímica",
        rating: 5,
        text: "Encontré a mi profe ideal para bioquímica en minutos. La interfaz es súper clara y me encantó poder elegir entre clases virtuales o presenciales."
    },
    {
        name: "Juan",
        role: "Profesor",
        subject: "Docente verificado",
        rating: 5,
        text: "Me gusta dar clases por Edessio porque me permite mostrar mi perfil profesional con libertad y tener mayor visibilidad con mis alumnos."
    },
    {
        name: "Martín",
        role: "Alumno",
        subject: "Programación",
        rating: 5,
        text: "EDESSIO me salvó con programación. Lo mejor es que sólo pago las clases que necesito, sin suscripciones raras."
    },
    {
        name: "Malena",
        role: "Alumna",
        subject: "Clases personalizadas",
        rating: 5,
        text: "Plataformas hay muchas, pero esta me pareció mucho más humana. Me gusta que se valore la comunicación y que sea fácil adaptarse a lo que uno necesita."
    }
];

const STEPS = [
    {
        number: "01",
        title: "Registrate o iniciá sesión",
        description: "¡Unite a EDESSIO y disfrutá de las ventajas de estudiar con nosotros!",
        badge: "Cuenta gratuita en 30 segundos",
        previewTitle: "Creá tu perfil de estudiante",
        previewSubtitle: "Conocé a todos nuestros profesores y guardá tus favoritos.",
        previewTag: "Paso 1 • Bienvenida"
    },
    {
        number: "02",
        title: "Buscá tu profesor ideal",
        description: "¡Explorá todas nuestras opciones y elegí a tu Profe!",
        badge: "Filtros por materia, precio y modalidad",
        previewTitle: "Matemática • Virtual • Hasta $6.000/h",
        previewSubtitle: "Compará experiencia, tarifas y reseñas reales de otros alumnos.",
        previewTag: "Paso 2 • Exploración"
    },
    {
        number: "03",
        title: "Preguntá por disponibilidad",
        description: "Elegí el horario que más te convenga y espera la respuesta del Profe.",
        badge: "Chat directo sin intermediarios",
        previewTitle: "Mensaje enviado a Tomás",
        previewSubtitle: "“Hola Tomás, ¿tenés disponibilidad este jueves a las 18 hs?”",
        previewTag: "Paso 3 • Conexión en vivo"
    },
    {
        number: "04",
        title: "¡Listo! Con Edessio estudiar es fácil",
        description: "Disfrutá de tu clase particular y seguí creciendo con EDESSIO al lado tuyo.",
        badge: "Pagás solo por las clases que tomás",
        previewTitle: "Clase confirmada • Jueves 18:00 hs",
        previewSubtitle: "Todo listo para tu sesión 1 a 1. Al finalizar podés dejar tu reseña.",
        previewTag: "Paso 4 • Aprendizaje"
    }
];

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [subjects, setSubjects] = useState<ISubject[]>([]);
    const [featuredTutors, setFeaturedTutors] = useState<any[]>([]);
    const [loadingTutors, setLoadingTutors] = useState(true);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await axios.get("http://localhost:5001/api/subjects");
                setSubjects(res.data.slice(0, 4));
            } catch (error) {
                console.error("Error cargando materias en Home:", error);
            }
        };
        fetchSubjects();
    }, []);

    useEffect(() => {
        const fetchFeaturedTutors = async () => {
            setLoadingTutors(true);
            try {
                const params = new URLSearchParams();
                if (selectedSubject) params.append("subject", selectedSubject);

                const res = await axios.get("http://localhost:5001/api/tutors", { params });
                if (res.data && res.data.length > 0) {
                    setFeaturedTutors(res.data.slice(0, 3));
                } else {
                    setFeaturedTutors(FALLBACK_TUTORS);
                }
            } catch (error) {
                setFeaturedTutors(FALLBACK_TUTORS);
            } finally {
                setLoadingTutors(false);
            }
        };
        fetchFeaturedTutors();
    }, [selectedSubject]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const query = searchInput.trim() ? `?search=${encodeURIComponent(searchInput.trim())}` : "";
        navigate(`/find-tutor${query}`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-800">
            {/* ================= 1. HERO CON FONDO TEXTURIZADO Y CAPAS ================= */}
            <section className="relative overflow-hidden bg-slate-50 border-b border-gray-200/70">
                {/* Trama de puntos de fondo */}
                <div
                    className="absolute inset-0 opacity-45 pointer-events-none"
                    style={{
                        backgroundImage: "radial-gradient(#cbd5e1 1.25px, transparent 1.25px)",
                        backgroundSize: "24px 24px"
                    }}
                />
                {/* Halos difuminados para profundidad */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

                <div className="relative container mx-auto px-4 py-16 md:py-24 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Columna izquierda: Copy + Buscador */}
                        <div className="lg:col-span-7 space-y-6 text-left">
                            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full shadow-sm">
                                <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                    Clases particulares 1 a 1
                                </span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                                Un mundo de{" "}
                                <span className="relative inline-block text-secondary">
                                    conocimiento
                                    <span className="absolute bottom-1 left-0 w-full h-3 bg-secondary/15 -z-10 rounded" />
                                </span>{" "}
                                a tu alcance.
                            </h1>

                            <p className="text-lg sm:text-xl text-gray-600 font-normal max-w-xl leading-relaxed">
                                Hacemos que el aprendizaje sea más que un camino, una aventura. Conectá con profesores particulares sin suscripciones ni vueltas.
                            </p>

                            {/* Barra de búsqueda */}
                            <form onSubmit={handleSearchSubmit} className="max-w-xl">
                                <div className="flex items-center bg-white border border-gray-200 rounded-full p-1.5 shadow-lg shadow-gray-200/60 focus-within:ring-2 focus-within:ring-primary transition-all">
                                    <input
                                        type="text"
                                        placeholder="Encontrá tu profesor ideal (ej. Matemática, React...)"
                                        className="flex-grow px-4 py-3 text-gray-700 bg-transparent focus:outline-none text-sm sm:text-base"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        aria-label="Buscar profesor"
                                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full hover:opacity-90 transition-all font-semibold text-sm shadow-sm"
                                    >
                                        <MdSearch className="h-5 w-5" />
                                        <span>Buscar</span>
                                    </button>
                                </div>
                            </form>

                            {/* Atajos rápidos */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-sm text-gray-500">
                                <span className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
                                    Búsquedas rápidas:
                                </span>
                                {["Matemática", "Programación", "Inglés", "Lengua"].map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => navigate(`/find-tutor?search=${encodeURIComponent(tag)}`)}
                                        className="px-3.5 py-1 rounded-full bg-white/90 border border-gray-200 hover:border-primary hover:text-primary transition-colors text-xs font-medium shadow-2xs"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Columna derecha: Composición en capas */}
                        <div className="hidden lg:block lg:col-span-5 relative">
                            {/* Tarjeta trasera inclinada para dar profundidad */}
                            <div className="absolute inset-0 bg-primary rounded-2xl rotate-3 opacity-10 scale-105" />

                            {/* Tarjeta principal */}
                            <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-gray-100 space-y-5">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src="https://ui-avatars.com/api/?name=Tomas+P&background=0D8ABC&color=fff"
                                            alt="Tutor"
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-bold text-gray-900">Tomás • Programación</p>
                                            <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                                Disponible hoy
                                            </p>
                                        </div>
                                    </div>
                                    <span className="bg-blue-50 text-primary font-bold text-xs px-3 py-1 rounded-full">
                                        $6.000/h
                                    </span>
                                </div>

                                <div className="space-y-2.5 text-sm">
                                    <div className="bg-gray-50 p-3 rounded-xl rounded-tl-none text-gray-700 border border-gray-100">
                                        “¡Hola! Contame qué temas necesitás preparar y armamos un plan a tu ritmo.”
                                    </div>
                                    <div className="bg-primary text-white p-3 rounded-xl rounded-tr-none ml-8">
                                        “Genial, necesito ayuda con React y TypeScript para el viernes.”
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                                    <span className="flex items-center gap-1 font-medium text-gray-700">
                                        <MdStar className="text-yellow-400 h-4 w-4" /> 4.9 (24 reseñas)
                                    </span>
                                    <Link
                                        to="/find-tutor"
                                        className="font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                        Explorar tutores <MdArrowForward />
                                    </Link>
                                </div>
                            </div>

                            {/* Badge flotante superior derecha */}
                            <div className="absolute -top-5 -right-4 bg-white px-4 py-2.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                    <MdCheckCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Sin suscripciones</p>
                                    <p className="text-[11px] text-gray-500">Pagás por clase tomada</p>
                                </div>
                            </div>

                            {/* Badge flotante inferior izquierda */}
                            <div className="absolute -bottom-5 -left-5 bg-primary text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5">
                                <MdChatBubbleOutline className="h-5 w-5 text-secondary" />
                                <span className="text-xs font-semibold">Chat en tiempo real</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= 2. PROFESORES DEL MOMENTO ================= */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                                Destacados
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
                                ¡Nuestros profesores del momento!
                            </h2>
                        </div>

                        {/* Pills de filtro */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedSubject("")}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    selectedSubject === ""
                                        ? "bg-primary text-white shadow-sm"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                Todos
                            </button>
                            {subjects.map((subj) => (
                                <button
                                    key={subj._id}
                                    onClick={() => setSelectedSubject(subj._id)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                        selectedSubject === subj._id
                                            ? "bg-primary text-white shadow-sm"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    {subj.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loadingTutors ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredTutors.map((tutor: any) => (
                                <div
                                    key={tutor._id}
                                    className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        tutor.profilePicture ||
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=random`
                                                    }
                                                    alt={tutor.name}
                                                    className="h-14 w-14 rounded-full object-cover border-2 border-gray-100"
                                                />
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                        {tutor.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        {tutor.modality === "online" ? (
                                                            <MdVideocam className="text-primary" />
                                                        ) : (
                                                            <MdLocationOn className="text-primary" />
                                                        )}
                                                        <span>
                                                            {translateModality(tutor.modality)}
                                                            {tutor.location && tutor.modality !== "online"
                                                                ? ` - ${tutor.location}`
                                                                : ""}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="bg-green-50 text-green-700 font-bold text-sm px-3 py-1 rounded-full whitespace-nowrap">
                                                ${tutor.price?.toLocaleString("es-AR") || 6000}/h
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {tutor.subjects?.slice(0, 3).map((subj: any, i: number) => (
                                                <span
                                                    key={i}
                                                    className="bg-blue-50 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full"
                                                >
                                                    {typeof subj === "string" ? subj : subj.name}
                                                </span>
                                            ))}
                                        </div>

                                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                            {tutor.bio || "Profesor particular disponible para clases personalizadas."}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <MdStar className="text-yellow-400 h-5 w-5" />
                                            <span className="font-semibold">
                                                {(tutor.averageRating || 5).toFixed(1)}
                                            </span>
                                            <span className="text-gray-400 text-xs">
                                                ({tutor.reviewCount || 3})
                                            </span>
                                        </div>

                                        <Link
                                            to={tutor._id.startsWith("demo-") ? "/find-tutor" : `/tutor/${tutor._id}`}
                                            className="text-sm font-semibold text-primary group-hover:text-secondary transition-colors flex items-center gap-1"
                                        >
                                            <span>Ver perfil</span>
                                            <MdArrowForward />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-10">
                        <Link
                            to="/find-tutor"
                            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <span>Explorar todos los profesores</span>
                            <MdArrowForward />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ================= 3. ¿POR QUÉ EDESSIO? (BENTO ASIMÉTRICO) ================= */}
            <section className="py-16 bg-slate-50 border-y border-gray-200/70">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                        {/* Bloque izquierdo protagonista en contraste oscuro */}
                        <div className="lg:col-span-5 bg-primary text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-lg">
                            <div className="space-y-4">
                                <span className="inline-block bg-white/10 text-secondary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Por qué elegirnos
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                                    ¿Por qué EDESSIO es la mejor opción?
                                </h2>
                                <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                                    Diseñamos una plataforma transparente donde alumnos y profesores se conectan directo, sin ataduras ni letra chica.
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/15 flex items-start gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-secondary text-primary flex items-center justify-center flex-shrink-0">
                                    <MdVerifiedUser className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Garantía 100%</h3>
                                    <p className="text-blue-100 text-sm mt-1">
                                        Pagás únicamente por las clases que tomás, sin membresías mensuales ni costos ocultos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bloque derecho: 2 tarjetas horizontales apiladas */}
                        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
                            <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-start gap-5 flex-1">
                                <div className="h-14 w-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                                    <MdSchool className="h-7 w-7" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-gray-900">Los mejores profesores</h3>
                                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                        Cada tutor cuenta con un perfil detallado con sus materias, modalidad de cursada, tarifa por hora y reseñas verificadas de otros estudiantes para que elijas con total seguridad.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-start gap-5 flex-1">
                                <div className="h-14 w-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                                    <MdBolt className="h-7 w-7" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-gray-900">Sencillo y eficaz</h3>
                                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                        Filtrá en segundos por materia, presupuesto y ubicación, escribile directo por el chat interno y coordiná tu próxima clase particular sin demoras.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= 4. ¿CÓMO FUNCIONA? (PASOS INTERACTIVOS + PREVIEW) ================= */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="max-w-2xl mb-12">
                        <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                            Paso a paso
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
                            ¿Cómo funciona?
                        </h2>
                        <p className="text-gray-500 mt-2">
                            Seleccioná cada paso para ver cómo es la experiencia dentro de Edessio.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        {/* Lista interactiva de 4 pasos (7 columnas) */}
                        <div className="lg:col-span-7 space-y-3">
                            {STEPS.map((step, index) => {
                                const isActive = activeStep === index;
                                return (
                                    <button
                                        key={step.number}
                                        type="button"
                                        onClick={() => setActiveStep(index)}
                                        onMouseEnter={() => setActiveStep(index)}
                                        className={`w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-5 ${
                                            isActive
                                                ? "bg-blue-50/70 border-primary shadow-sm"
                                                : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/60"
                                        }`}
                                    >
                                        <span
                                            className={`text-2xl font-black tracking-tighter ${
                                                isActive ? "text-primary" : "text-gray-300"
                                            }`}
                                        >
                                            {step.number}
                                        </span>
                                        <div className="space-y-1">
                                            <h3
                                                className={`text-lg font-bold ${
                                                    isActive ? "text-primary" : "text-gray-900"
                                                }`}
                                            >
                                                {step.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Panel dinámico de vista previa (5 columnas) */}
                        <div className="lg:col-span-5">
                            <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden min-h-[300px] flex flex-col justify-between">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/20 rounded-full blur-2xl" />

                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-white/10 px-3 py-1 rounded-full">
                                        {STEPS[activeStep].previewTag}
                                    </span>
                                    <MdEventAvailable className="h-6 w-6 text-secondary" />
                                </div>

                                <div className="my-8 bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-5 space-y-2">
                                    <p className="font-bold text-lg text-white">
                                        {STEPS[activeStep].previewTitle}
                                    </p>
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        {STEPS[activeStep].previewSubtitle}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/10">
                                    <span>{STEPS[activeStep].badge}</span>
                                    <Link
                                        to="/register"
                                        className="text-secondary font-bold hover:underline flex items-center gap-1"
                                    >
                                        Probar ahora <MdArrowForward />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= 5. TESTIMONIOS (GRILLA EDITORIAL 2x2) ================= */}
            <section className="py-16 bg-slate-50 border-t border-gray-200/70">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center max-w-xl mx-auto mb-12">
                        <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                            Comunidad Edessio
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
                            ¿Qué dicen de nosotros?
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {TESTIMONIALS.map((item) => (
                            <div
                                key={item.name}
                                className="bg-white p-7 rounded-2xl shadow-sm border border-gray-200/70 flex flex-col justify-between space-y-5 relative"
                            >
                                <MdFormatQuote className="h-10 w-10 text-gray-100 absolute top-5 right-6" />

                                <p className="text-gray-700 text-base leading-relaxed relative z-10">
                                    “{item.text}”
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                                            {item.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {item.role} • {item.subject}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: item.rating }).map((_, idx) => (
                                            <MdStar key={idx} className="text-yellow-400 h-4 w-4" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= 6. BANNER CTA FINAL ================= */}
            <section className="py-16 bg-primary text-white">
                <div className="container mx-auto px-4 max-w-4xl text-center space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold">
                        ¿Listo para dar el siguiente paso?
                    </h2>
                    <p className="text-blue-100 text-lg font-light">
                        Ya sea que busques aprobar tu próxima materia o compartir lo que sabés dando clases, Edessio es tu lugar.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                        <Link
                            to="/find-tutor"
                            className="px-8 py-3.5 rounded-full bg-secondary text-primary font-bold hover:opacity-90 transition-opacity shadow-md"
                        >
                            Buscar mi profesor
                        </Link>
                        <Link
                            to="/register"
                            className="px-8 py-3.5 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
                        >
                            Quiero dar clases
                        </Link>
                    </div>
                </div>
            </section>

            {/* ================= 7. FOOTER ================= */}
            <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
                <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-white font-bold text-xl tracking-wide">EDESSIO</span>
                    <p className="text-xs text-center sm:text-right">
                        Copyright © 2026 Edessio. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;