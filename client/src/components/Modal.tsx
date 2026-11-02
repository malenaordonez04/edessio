import React from "react";

type ModalProps = {
    isOpen: boolean; //Prop para controlar si el modal está visible.
    onClose: () => void; //Función para cerrar el model.
    children: React.ReactNode; //El contenido que irá dentro del modal.
};

const Modal: React.FC<ModalProps> = ({isOpen, onClose, children}) => {
    if (!isOpen) return null; //Si es falso, no renderizamos nada. Si es verdadero, renderizamos.

    return(
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 relate w-full max-w-lg my-2">
                <button 
                className="absolute top-2 right-8 text-white bg-gray-600 bg-opacity-80 hover:bg-gray-400 hover:text-gray-800 rounded-full px-3 py-1 text-2xl"
                onClick={onClose}
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;