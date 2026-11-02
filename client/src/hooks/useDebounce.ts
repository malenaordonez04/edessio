//Este efecto nos permite que cada vez que se escribe una nueva letra, el value cambia, el useEffect se reinicia y se cancela el temporizador anterior y crea uno nuevo. El estado debouncedValue se actualiza una sola vez, cuando dejas de escribir.
import { useState, useEffect } from "react";

//Funcion que recibe el valor que queremos retrasar y el tiempo de retraso que queremos.
function useDebounce<T>(value: T, delay:number) : T {

const [debouncedValue, setDebouncedValue] = useState<T>(value);

useEffect(() => {
    //Creamos un temporizador que se ejecuta después de que pase el 'delay'.
    const handler = setTimeout(() => {
        setDebouncedValue(value);
    }, delay);

    return () => {
        clearTimeout(handler); //Cancela el temporizador anterior.
    };
}, [value, delay]); //El efecto se reinicia si el valor o el retraso cambia.

return debouncedValue;
}

export default useDebounce;