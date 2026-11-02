import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector} from "react-redux";
import axios from "axios";
import type { RootState } from "../app/store";
import { capitalize, translateModality } from "../utils/textFormatters";
import type { Tutor, Review } from "../types";

import ReviewCard from "../components/ReviewCard";
import ReviewForm from "../components/ReviewForm";
import StarRating from "../components/StarRating";

const TutorProfilePage = () => {
    //Usamos el hook useParams para obtener el parámetro ID de la URL.
    const { id } = useParams<{ id: string }>(); 
    //Estados para guardar los datos del profesor y el estado de carga.
    const [tutor, setTutor] = useState< Tutor | null>(null);
    const [loading, setLoading] = useState(true);

    //Para manejar las reviews
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    const { user } = useSelector((state: RootState) => state.auth);

    //Logica para fetch los datos de BDD.
    useEffect(() => {
        const fetchTutor = async () => {
          setLoading(true);
            try {            
                const response = await axios.get(`http://localhost:5001/api/tutors/${id}`);
                setTutor(response.data);
            } catch (error) {
                console.error('Error al obtener el perfil del profesor', error);
            } finally{
                setLoading(false);
            };
        };

        //Hacemos una verificación de que ya tenemos el id asi podemos llamar a la función con todos los datos necesarios.
        if (id) {
            fetchTutor();
        }
    }, [id]) //Con el arreglo con id, la función se ejecuta cada vez que cambia el id.

    const fetchReviews = async () => {
      if (!id) return;
      setLoadingReviews(true);
      try {
        //Llamamos a las reviews
        const response = await axios.get(`http://localhost:5001/api/reviews/${id}`);
        setReviews(response.data);
      } catch (error) {
        console.error('Error al cargar las reseñas:', error);
        
      } finally {
        setLoadingReviews(false);
      }
    }

    //useEffect para cargar las reseñas.
    useEffect(() => {
      fetchReviews();
    }, [id]); //Se ejecuta cada vez que el ID cambia

    if (loading) return <p className="text-center mt-10">Cargando perfil...</p>;
    if(!tutor) return <p className="text-center mt-10">No se encontró al profesor.</p>

    //Calculamos el rating promedio
    const averageRating = reviews.length > 0 ? reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / reviews.length : 0;

    return (
      <div>
        <div className="relative w-full h-64">
          <img
            src={tutor.profilePicture}
            alt={`Foto de perfil de ${tutor.name}`}
            className="w-full h-full object-cover shadow-[0_05px_40px_rgba(0,0,0,0.05)]"
          />
        </div>

        {/* Columna de la Información */}
        <div className="flex flex-col justify-center text-center">
          <h1 className="text-4xl font-medium font-poppins text-primary mt-6">{capitalize(tutor.name)} <span className="text-xl font-thin">({translateModality(tutor.modality)})</span></h1>
          <div className="mt-2 flex justify-center items-center space-x-2">
            {averageRating > 0 ? (
              <StarRating rating={averageRating} size={20} />
            ) : (
              <span className="text-gray-400 text-sm">Sin calificaciones</span>
            )}
            <span className="text-gray-400 text-sm">({reviews.length} reseñas)</span>
          </div>

          <div className="flex flex-row justify-center gap-4 sm:gap-6 items-center mt-6">
            <p className="text-lg font-bold text-primary bg-accent py-2 px-4 rounded-full">
              ${tutor.price ? tutor.price.toLocaleString('es-AR') : 'Consultar'} / hora
            </p>
            <p className="text-lg font-light text-black-600">{capitalize(tutor.location || '')}</p>
          </div>

          {tutor.subjects && tutor.subjects.length > 0 && (
            <div className="mt-6">
              <div className="flex flex-wrap gap-1 justify-center sm:gap-6">
                {tutor.subjects.map((subject: any) => (
                  <span
                    key={subject._id}
                    className="text-black text-sm sm:text-base font-regular px-6 py-2 rounded-full border border-accent"
                  >
                    {subject.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tutor.bio && (
            <div className="mt-12">
              <h3 className="text-2xl font-semibold text-gray-800 text-left ml-4">Sobre mí</h3>
              <p className="text-black font-extralight mt-1 text-left ml-4">{tutor.bio}</p>
            </div>
          )}

          {/*Sección de Reseñas dinámica*/}
          <div className="bg-primary mt-[5em] py-6">
          <h3 className="text-2xl font-medium text-white text-left ml-4">Reseñas</h3>

          {loadingReviews ? (
            <p className="text-white text-center">Cargando reseñas...</p>
          ) : (
            <div className="flex overflow-x-auto space-x-4 pb-4 mx-4 my-4 snap-x snap-mandatory">
              {reviews.length === 0 ? (
                <p className="text-white text-opacity-70 ml-4">Este profesor todavía no tiene reseñas.</p>
              ) : (
                reviews.map(review => (
                    <ReviewCard
                      key={review._id}
                      review={review} // Pasamos el objeto 'review' completo.
                    />
                ))
              )}
            </div>
          )}
          </div>
          {/*shadow-[0_5px_35px_rgba(0,0,0,0.05)]*/}
        {/*Sección formulario de Reseñas*/}
        {/*Solo se muestra si el usuario está logueado Y es estudiante*/}
        {user && user.role === 'student' && (
          <div className="mt-12 flex justify-center bg-white shadow-[0_5px_35px_rgba(6,40,63,0.10)]">
            <ReviewForm
              tutorId={id!} // ! Para decirle a TS que confiamos que 'id' existe. Para este punto, ya esta chequeado que existe.
              onReviewSubmit={fetchReviews} //Cuando se envía, actualiza la lista/
            />
          </div>
        )}

          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-gray-800 text-left ml-4">Disponibilidad</h3>
          </div>
          
          <div className="sticky bottom-0 z-50 my-4">
            <button className="w-[90%] bg-secondary hover:bg-primary hover:text-accent p-4 rounded-full transition duration-300 ease-in-out mb-4">Contactá al profesor</button>
          </div>
        </div>
      </div>
    );
;}

export default TutorProfilePage;