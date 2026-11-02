import React from "react";
import {FaStar} from 'react-icons/fa';
import type { Review } from "../types";

type ReviewCardProps = {
    review: Review;
};

const formatTimeAgo = (dateSring: string) => {
    return new Date(dateSring).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

const ReviewCard: React.FC<ReviewCardProps> = ({review}) => {
    const {student, rating, comment, createdAt} = review;
    const studentName = student?.name || student?.email || 'Usuario Anónimo';
    const timeAgo = formatTimeAgo(createdAt);
    return(
        <div className={`w-full flex-shrink-0 w-[75%] md:w-[45%] bg-white p-6 rounded-xl shadow transition-transform duration-300`}>
            <div className="flex justify-between items-center">
                <div className="text-left">
                    <p className="text-xl text-extra font-medium">{studentName}</p>
                    <p className="text-sm text-gray-600 font-extralight">{timeAgo}</p>
                </div>
                  <div className="flex items-center text-lg text-extra">
                    <span className="font-bold mr-1">{rating}</span>
                    <FaStar />
                </div>
            </div>
              <p className="text-left mt-2 text-sm text-gray-600 font-light truncate">{comment}</p>
        </div>
    )
}

export default ReviewCard;