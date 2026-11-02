import React from "react";

//Definimos los props que nuestros inputs aceptaran. Todo lo que tiene que recibir el componente para funcionar.
type InputFieldProps = {
    label: string;
    name: string;
    type: 'text' | 'number' | 'password' | 'email';
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; //Tiene que recibir una función, es la que se ejecuta cada vez que cambia el valor.
    required? : boolean;
}

//Definimos el componente funcional. //React.FC es un componente funcional de React, nos permite destructurar y poder usar directamente name, type, etc sin tener que decir especificamente props.label, props,type.
const InputField: React.FC<InputFieldProps> = ({ label, name, type, value, onChange, required}) => { 
    return(
        <div>
            <label htmlFor={name} className="mb-2 text-lg"> {label} </label>
            <div className="mt-1">
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    required= {required}
                    className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 p-2.5 text-sm rounded-lg text-black"
                />
            </div>
        </div>
    )
}

export default InputField