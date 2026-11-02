import Modal from "../components/Modal";

export const capitalize = (str: string): string => {
    if (!str) return ''; //Si el string está vacío, devuelve un string vacío.
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

type Modality  = 'in-person' | 'remote' | 'hybrid';

export const translateModality = (modality?: Modality): string => {
    if (!modality) return 'No especificada'; 

    switch (modality) {
        case 'in-person':
            return 'Presencial';
        case 'hybrid':
            return 'Híbrido';
        case 'remote':
            return 'Online';
        default:
            return 'No especificada';
    }
}