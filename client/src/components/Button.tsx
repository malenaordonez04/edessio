import React from "react";

//Definimos props del botón.
type ButtonProps = {
    children: React.ReactNode; //Para que sea válido cualquier tipo de contenido dentro del botón, texto, imagen, etc.
    type? : 'submit' | 'reset' | 'button'; //Para tener la opción de enviar formulario, resetearlo o simplemente ser un botón.
}

const Button: React.FC<ButtonProps> = ({ children, type = 'submit' }) => {
    return (
        <button 
        type={type}
        className="w-full rounded-xl p-3 mt-4 border border-transparent shadow-sm text-m  text-primary bg-secondary hover:bg-primary hover:text-accent transition duration-300 ease-in-out"
        >
            {children}
        </button>
    )
}

export default Button