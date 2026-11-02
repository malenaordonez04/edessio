export interface Tutor{
    _id: string;
    name: string;
    email: string;
    location?: string;
    profilePicture?: string;
    bio?: string;
    subjects?: string[];
    price?: number;
    modality?: 'in-person' | 'hybrid' | 'remote',
};

export interface ISubject {
_id: string;
name: string;
};

export interface Review{
    _id: string;
    student: PopulatedStudent;
    tutor: string;
    name: string;
    timeAgo: string;
    comment: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
};

//Describimos que debe recibir el frontend de la información del estudiante. Evita errores.
interface PopulatedStudent {
    _id: string;
    name: string;
    email: string;
}