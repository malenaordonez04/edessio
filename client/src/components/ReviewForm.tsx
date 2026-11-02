import React, {useState} from "react";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { useSelector, type UseSelector } from "react-redux";
import type { RootState } from "../app/store";
import Button from "../components/Button";

type ReviewFormProps = {
    tutorId: String;
    onReviewSubmit: () => void; //Función para avisar que se envió una reseña.
};

const ReviewForm: React.FC<ReviewFormProps> = ({tutorId, onReviewSubmit}) => {
    const {token} = useSelector((state: RootState) => state.auth);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');
    //El messageType puede ser o success, o error, o "". Por defecto está en "".
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 && !comment) {
            setMessage('Por favor, seleccioná una calificación o escribí un comentario.');
            setMessageType('error');
            return;
        }

        try {
            const config = { headers: {Authorization: `Bearer ${token}`}};
            const reviewData = {tutorId, rating, comment};
            await axios.post('http://localhost:5001/api/reviews', reviewData, config);
            setMessage('¡Gracias por tu reseña!');
            setMessageType('success');
            setRating(0);
            setComment('');
            onReviewSubmit(); //Llama a la función para refrescar reseñas.

            setTimeout(() => {
                setMessage('');
            }, 3000);
        } catch (error) {
            setMessage('Error al enviar la reseña');
            setMessageType('error');
        }
    }

    return (
        <div className="w-full md:w-[50%]  py-6 px-8">
            <h3 className="text-2xl font-semibold text-gray-800 text-center">¿Querés dejar tu reseña?</h3>
            <form onSubmit={handleSubmit}>
                {/*Sistema de estrellas interactivo */}
                <div className="flex justify-center mt-4 mb-6">
                    {/*Hacemos un bucle que repite 5 veces para mostrar las estrellas */}
                    {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                            <label key={starValue} className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="rating"
                                    value={starValue}
                                    onClick={() => setRating(starValue)}
                                    className="hidden" //Ocultamos el botón de radio
                                />
                                <FaStar 
                                    size={24}
                                    className="mr-1"
                                    color={starValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                    onMouseEnter={() => setHover(starValue)}
                                    onMouseLeave={() => setHover(0)}
                                />
                            </label>
                        );
                    })}

                {/*Botón para limpiar la selección de rating */}
                {rating > 0 && (
                    <button
                        type="button"
                        onClick={() => setRating(0)}
                        className="ml-4 text-sm text-gray-500 hover:text-red-500"
                    >
                        Limpiar
                    </button>
                )}
                </div>

                <div className="mb-2">
                    <textarea 
                        name="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Escribí tu comentario acá... (opcional)"
                        rows={3}
                        className="w-full p-4 mt-2 border  rounded-md focus:outline-none focus:ring-2 focus:ring-secondary" 
                    />
                </div>
                <div className="flex justify-center sm:justify-end">
                    {/* <Button type="submit">Enviar Reseña</Button> */}
                    <button
                        type="submit"
                        className="w-full sm:w-[30%] rounded-xl p-2 border border-primary hover:border-transparent shadow-sm text-center text-primary hover:bg-primary hover:text-accent transition duration-300 ease-in-out"
                    >
                        Enviar Reseña
                    </button>
                  {message && (<p className={`my-2 text-start text-sm p-3 rounded-xl ${messageType === 'success' ? 'text-primary bg-green-500' : 'text-white bg-red-500'}`}>{message}</p>)}
                </div>
            </form>
        </div>
    )
}

export default ReviewForm