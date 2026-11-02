import React from "react";
import { Link } from "react-router-dom";
import type { Tutor } from "../types";
import { translateModality, capitalize } from "../utils/textFormatters";
import StarRating from "./StarRating";

type TutorCardProps = {
    tutor: Tutor;
};

const averageRating = 3.7 // Por ahora, usamos un dato fijo, despues va a venir de la bdd.

const TutorCard: React.FC<TutorCardProps> = ({tutor}) => {
    return(

        <div className="border border-secondary rounded-xl">
          <div>
            <img 
              src={tutor.profilePicture}
              alt={`Foto de perfil de: ${tutor.name}`}
              className="rounded-t-xl"
              />
            <div className="mx-4 my-2 gap-4 flex flex-col">
              <div className="flex justify-between items-center">
                <div className="mt-3">
                  <p className="text-xl font-medium">{capitalize(tutor.name)}</p>
                  <p className="font-light">{translateModality(tutor.modality)} · {capitalize(tutor.location || '')} </p>
                </div>
                <p className="text-primary bg-accent py-2 px-4 rounded-full">$<a className="font-bold">{tutor.price}</a>/hora</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {tutor.subjects && tutor.subjects.slice(0, 3).map((subject: any) => {
                // 1. Verificamos: ¿Es un string (viejo) o un objeto (nuevo)?
                const subjectName = typeof subject === 'string' ? subject : subject.name;
                const subjectKey = typeof subject === 'string' ? subject : subject._id;

                return (
                    <span key={subjectKey} className="border border-secondary rounded-full py-1 px-4 font-light">
                        {subjectName}
                    </span>
                );
                })}
                {tutor.subjects && tutor.subjects.length > 3 && (
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      +{tutor.subjects.length - 3}
                  </span>
                )}
              </div>
              <p className="font-extralight text-gray-800">{tutor.bio}</p>
              <div className="flex items-center">
                <StarRating rating={averageRating}/>
                <span className="text-gray-600 ml-2 font-extralight text-sm">({averageRating})</span>
              </div>
              <Link to={`/tutor/${tutor._id}`}>
                <button className=" w-full mb-1 bg-secondary text-gray-800 text-center hover:bg-primary hover:text-accent rounded-xl p-2 transition duration-300 ease-in-out">Ver más</button>
              </Link>
            </div>
          </div>
        </div>
    );
};


export default TutorCard;