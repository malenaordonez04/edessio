import React from "react";
import { BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";

//Archivo para dependiendo de cuantas estrellas tenga el profesor, la cantidad de estrellas rellenas
type StarRatingProps = {
    rating: number;
    size?: number
};

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 18}) => {
    return(
        <div className="flex items-center text-secondary">
            {Array.from({length: 5}, (_, index) => {
                //Le sumamos 1 al index ya que si no empieza en 0. Repetimos el bucle 5 veces, para que se generen 5 estrellas y en cada una de ellas, se hace la lógica de que tan llenas estan.
                const starNumber = index + 1;
                if (rating >= starNumber) {
                    //Si la calificación es mayor o igual al número de la estrella, se devuelve una estrella llena.
                    return <BsStarFill key={index} size={size}/>
                } else if (rating >= starNumber - 0.5) {
                    //Si la calificación es mayor o igual - 0.5 al número de la estrella, se devuelve una estrella a la mitad.
                    return <BsStarHalf key={index} size={size}/>
                } else {
                    //Si no, está vacía.
                    return <BsStar key={index} size={size}/>
                }
            })}
        </div>
    )
}

export default StarRating