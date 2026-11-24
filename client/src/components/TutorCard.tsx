  // import React from "react";
  // import { Link } from "react-router-dom";
  // import type { Tutor } from "../types";
  // import { translateModality, capitalize } from "../utils/textFormatters";
  // import StarRating from "./StarRating";

  // type TutorCardProps = {
  //     tutor: Tutor;
  // };

  // const averageRating = 3.7 // Por ahora, usamos un dato fijo, despues va a venir de la bdd.

  // const TutorCard: React.FC<TutorCardProps> = ({tutor}) => {
  //     return(

  //         <div className="border border-secondary rounded-xl">
  //           <div>
  //             <img 
  //               src={tutor.profilePicture}
  //               alt={`Foto de perfil de: ${tutor.name}`}
  //               className="rounded-t-xl"
  //               />
  //             <div className="mx-4 my-2 gap-4 flex flex-col">
  //               <div className="flex justify-between items-center">
  //                 <div className="mt-3">
  //                   <p className="text-xl font-medium">{capitalize(tutor.name)}</p>
  //                   <p className="font-light">{translateModality(tutor.modality)} · {capitalize(tutor.location || '')} </p>
  //                 </div>
  //                 <p className="text-primary bg-accent py-2 px-4 rounded-full">$<a className="font-bold">{tutor.price}</a>/hora</p>
  //               </div>
  //               <div className="flex gap-2 flex-wrap">
  //                 {tutor.subjects && tutor.subjects.slice(0, 3).map((subject: any) => {
  //                 // 1. Verificamos: ¿Es un string (viejo) o un objeto (nuevo)?
  //                 const subjectName = typeof subject === 'string' ? subject : subject.name;
  //                 const subjectKey = typeof subject === 'string' ? subject : subject._id;

  //                 return (
  //                     <span key={subjectKey} className="border border-secondary rounded-full py-1 px-4 font-light">
  //                         {subjectName}
  //                     </span>
  //                 );
  //                 })}
  //                 {tutor.subjects && tutor.subjects.length > 3 && (
  //                   <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
  //                       +{tutor.subjects.length - 3}
  //                   </span>
  //                 )}
  //               </div>
  //               <p className="font-extralight text-gray-800">{tutor.bio}</p>
  //               <div className="flex items-center">
  //                 <StarRating rating={averageRating}/>
  //                 <span className="text-gray-600 ml-2 font-extralight text-sm">({averageRating})</span>
  //               </div>
  //               <Link to={`/tutor/${tutor._id}`}>
  //                 <button className=" w-full mb-1 bg-secondary text-gray-800 text-center hover:bg-primary hover:text-accent rounded-xl p-2 transition duration-300 ease-in-out">Ver más</button>
  //               </Link>
  //             </div>
  //           </div>
  //         </div>
  //     );
  // };


  // export default TutorCard;

 import React from "react";
import { Link } from "react-router-dom";
import { MdArrowForward, MdVideocam, MdLocationOn } from "react-icons/md";
import type { Tutor } from "../types";
import { translateModality, capitalize } from "../utils/textFormatters";
import StarRating from "./StarRating";

type TutorCardProps = {
    tutor: Tutor;
};


const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
    const isRemote = tutor.modality === "remote";

    //Leemos el promedio y la cantidad de reseñas reales (si aún no tiene, quedan en 0)
    const averageRating = tutor.averageRating || 0
    const reviewCount = tutor.reviewCount || 0;

    return (
        // overflow-hidden recorta la foto respetando el rounded-2xl; h-full + flex-col mantienen todas las cards parejas
        <div className="group h-full bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden">
            <div>
                {/* FOTO GRANDE SUPERIOR CON ALTO FIJO:
                    h-52 (208px) fija la altura exacta en todas las cards.
                    object-cover object-center recorta los bordes sobrantes sin estirar ni deformar la imagen. */}
                <div className="w-full h-64 bg-gray-100 overflow-hidden">
                    <img
                        src={
                            tutor.profilePicture ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&size=400&background=random`
                        }
                        alt={`Foto de perfil de ${tutor.name}`}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* CONTENIDO DE LA CARD */}
                <div className="p-5 flex flex-col gap-3.5">
                    {/* Nombre + Modalidad/Ubicación a la izquierda, Precio a la derecha */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                                {capitalize(tutor.name)}
                            </h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                                {isRemote ? (
                                    <MdVideocam className="text-primary flex-shrink-0" />
                                ) : (
                                    <MdLocationOn className="text-primary flex-shrink-0" />
                                )}
                                <span className="truncate">
                                    {translateModality(tutor.modality)}
                                    {tutor.location && !isRemote ? ` · ${capitalize(tutor.location)}` : ""}
                                </span>
                            </p>
                        </div>

                        <span className="bg-green-50 text-green-700 font-bold text-sm px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                            ${tutor.price?.toLocaleString("es-AR") || 0}/h
                        </span>
                    </div>

                    {/* Píldoras de materias con la misma paleta de la Home */}
                    <div className="flex gap-1.5 flex-wrap">
                        {tutor.subjects &&
                            tutor.subjects.slice(0, 3).map((subject: any) => {
                                const subjectName = typeof subject === "string" ? subject : subject.name;
                                const subjectKey = typeof subject === "string" ? subject : subject._id;

                                return (
                                    <span
                                        key={subjectKey}
                                        className="bg-blue-50 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full"
                                    >
                                        {subjectName}
                                    </span>
                                );
                            })}

                        {tutor.subjects && tutor.subjects.length > 3 && (
                            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                +{tutor.subjects.length - 3}
                            </span>
                        )}
                    </div>

                    {/* Biografía limitada a 2 líneas para que no desnivele la altura entre tarjetas */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {tutor.bio || "Profesor particular disponible para clases personalizadas."}
                    </p>
                </div>
            </div>

            {/* PIE DE TARJETA: Estrellas + Acceso al perfil (igual que en HomePage) */}
            <div className="px-5 pb-5">
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                        <StarRating rating={averageRating} />
                        {reviewCount > 0 ? (
                            <span className="text-gray-600 text-xs font-medium">
                                {averageRating.toFixed(1)} <span className="text-gray-400">({reviewCount})</span>
                            </span>
                        ) : (
                            <span className="text-gray-400 text-xs">Sin reseñas</span>
                        )}
                    </div>

                    <Link
                        to={`/tutor/${tutor._id}`}
                        className="text-sm font-semibold text-primary group-hover:text-secondary transition-colors flex items-center gap-1"
                    >
                        <span>Ver perfil</span>
                        <MdArrowForward />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TutorCard;