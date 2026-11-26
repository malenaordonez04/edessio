// import React, {useState} from "react";

// import InputField from "../components/InputField";

// import Button from "../components/Button";

// import RoleToggle from "../components/RoleToggle";

// import axios from "axios";

// import { Link ,useNavigate } from "react-router-dom";



// //Defino el tipo de DataToSend para establecer que modality es opcional.

// type DataToSend = {

// name: string,

// email: string,

// password: string,

// location: string,

// role: 'student' | 'tutor',

// modality?: string, //Es opcional

// bio?: string,

// }



// //Definimos el componente de la página.

// const RegisterPage = () => {

// //Manejamos el estado inicial del componente.

// const [formData, setFormData] = useState({

// name: '',

// email: '',

// password: '',

// confirmPassword: '',

// location: '',

// modality: 'in-person',

// });


// //Separamos este atributo de los demas ya que este no es string y es más complejo.

// const [role, setRole] = useState<'student' | 'tutor'>('student');



// //Establecemos estado para los mensajes de respuesta.

// const [message, setMessage] = useState('');

// //Manejamos el estado del tipo de mensaje, así podemos poner distintos estilos según si hay success o error.

// const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');



// const navigate = useNavigate();

// //Manejamos el cambio de valor en los campos.

// const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {

// //Cada vez que hay un cambio en el input o select, se llama a la función de setFormData, copiamos el objeto actúal para no perder los datos de los demás y actualizamos los valores.

// setFormData({

// ...formData,

// [e.target.name]: e.target.value, //con e.target.name obtenemos el nombre del campo que cambió y cambiamos su valor con e.target.value.

// });

// };



// //Manejamos el envío del formulario.

// const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

// e.preventDefault();

// setMessage(''); //Limpiamos cualquier mensaje anterior.

// setMessageType('');



// if (formData.password !== formData.confirmPassword) {

// setMessage('Las contraseñas no coinciden.');

// setMessageType('error');

// return;

// }



// try {

// //Hacemos la variable dataToSend usando el tipo DataToSend para asegurarnos de que tiene todos los campos.

// let dataToSend: DataToSend = {

// name: formData.name,

// email: formData.email,

// password: formData.password,

// location: formData.location,

// role,

// }

// //Si el rol es tutor, se le agregan los campos de la modalidad.

// if (role === 'tutor') {

// dataToSend.modality = formData.modality;

// }



// //Hacemos la petición POST a la API.

// const response = await axios.post(

// 'http://localhost:5001/api/auth/register',

// dataToSend

// )



// //Si la petición es exitosa, mostramos el mensaje del servidor y despues redirigimos.

// setMessage(response.data.message);

// setMessageType('success');



// setTimeout(() => {

// navigate('/login');

// }, 2000);


// } catch (error) {

// if (axios.isAxiosError(error) && error.response) {

// setMessage(error.response.data.message)

// } else {

// setMessage('Ocurrió un error inesperado');

// setMessageType('error');

// }

// }

// }





// // 6. Estructura visual de la página.

// return (

// <div className="min-h-screen w-full bg-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">

// <div className="flex justify-center">

// <h2 className="mt-6 text-center text-4xl font-medium text-white">

// Bienvenido

// </h2>

// </div>

// <div className="w-[80%] border border-accent rounded mx-auto my-10"></div>

// <div className="flex justify-center">

// <form className="flex justify-center w-[80%] flex-col gap-4 mb-[2em] text-white " onSubmit={handleSubmit}>

// <RoleToggle selectedRole={role} onRoleChange={(newRole) => setRole(newRole)}/>

// {/* Usamos el componente InputField para el nombre */}

// <InputField

// label="Nombre"

// name="name"

// type="text"

// value={formData.name}

// onChange={handleChange}

// required

// />

// {/* Usamos el componente InputField para el email */}

// <InputField

// label="Correo Electrónico"

// name="email"

// type="email"

// value={formData.email}

// onChange={handleChange}

// required

// />

// {/* Usamos el componente InputField para la contraseña */}

// <InputField

// label="Contraseña"

// name="password"

// type="password"

// value={formData.password}

// onChange={handleChange}

// required

// />

// {/* Usamos el componente InputField para la contraseña */}

// <InputField

// label="Confirmar Contraseña"

// name="confirmPassword"

// type="password"

// value={formData.confirmPassword}

// onChange={handleChange}

// required

// />

// <InputField

// label="Ubicación"

// name="location"

// type="text"

// value={formData.location}

// onChange={handleChange}

// required

// />



// {role === 'tutor' && (

// <div>

// <label htmlFor="modality" className="block mb-2 text-lg text-white">Modalidad</label>

// <select name="modality" id="modality" value={formData.modality} onChange={handleChange} className="block w-full border p-2.5 text-sm rounded-lg">

// <option value="in-person">Presencial</option>

// <option value="remote">Virtual</option>

// <option value="hybrid">Híbrido</option>

// </select>

// </div>

// )}



// {/*Mostramos el mensaje de éxito o error*/}

// {message && (

// <p className={`my-2 text-start text-sm p-3 rounded-xl ${messageType === 'success' ? 'text-primary bg-green-500/75' : 'text-white bg-red-500'}`}>

// {message}

// </p>

// )}



// {/* Usamos el componente Button para el botón de envío */}

// <Button type="submit"> Registrarse </Button>



// <div>

// <Link to="/login">

// <button className="w-full bg-transparent text-accent border border-secondary text-center hover:bg-accent hover:text-primary rounded-xl p-3 transition duration-300 ease-in-out">Iniciar sesión</button>

// </Link>

// </div>

// </form>



// </div>

// </div>

// );

// };



// export default RegisterPage;

import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import RoleToggle from "../components/RoleToggle";

// Definimos el tipo de datos que se envían al backend
type DataToSend = {
    name: string;
    email: string;
    password: string;
    location: string;
    role: "student" | "tutor";
    modality?: "remote" | "in-person" | "hybrid";
};

const MODALITY_OPTIONS = [
    { value: "remote", label: "Online" },
    { value: "in-person", label: "Presencial" },
    { value: "hybrid", label: "Híbrido" }
] as const;

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        location: "",
        modality: "remote" as "remote" | "in-person" | "hybrid"
    });

    const [role, setRole] = useState<"student" | "tutor">("student");
    const [loading, setLoading] = useState(false);

    // Estados para mensajes de respuesta
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">("");

    const navigate = useNavigate();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("");
        setMessageType("");

        if (formData.password !== formData.confirmPassword) {
            setMessage("Las contraseñas no coinciden.");
            setMessageType("error");
            return;
        }

        if (formData.password.length < 6) {
            setMessage("La contraseña debe tener al menos 6 caracteres.");
            setMessageType("error");
            return;
        }

        setLoading(true);
        try {
            const dataToSend: DataToSend = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                location: formData.location.trim(),
                role
            };

            if (role === "tutor") {
                dataToSend.modality = formData.modality;
            }

            const response = await axios.post(
                "http://localhost:5001/api/auth/register",
                dataToSend
            );

            setMessage(response.data.message || "¡Cuenta creada con éxito! Redirigiendo...");
            setMessageType("success");

            setTimeout(() => {
                navigate("/login");
            }, 1600);
        } catch (error) {
            setMessageType("error");
            if (axios.isAxiosError(error) && error.response) {
                setMessage(error.response.data.message || "No se pudo completar el registro.");
            } else {
                setMessage("Ocurrió un error inesperado al conectar con el servidor.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-primary flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Creá tu cuenta
                </h2>
                <p className="mt-2 text-sm text-white/75">
                    Elegí cómo querés participar y empezá a conectar 1 a 1.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-white/5 backdrop-blur-xs border border-white/15 rounded-2xl p-6 sm:p-8 shadow-xl">
                    <form className="flex flex-col gap-4 text-white" onSubmit={handleSubmit}>
                        {/* Selector de rol: Estudiante o Profesor */}
                        <div className="mb-1">
                            <RoleToggle
                                selectedRole={role}
                                onRoleChange={(newRole) => setRole(newRole)}
                            />
                        </div>

                        <InputField
                            label="Nombre completo"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <InputField
                            label="Correo Electrónico"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                label="Contraseña"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                            <InputField
                                label="Confirmar Contraseña"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <InputField
                            label="Ubicación"
                            name="location"
                            type="text"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />

                        {/* Selector de modalidad con botones claros (solo para Profesores) */}
                        {role === "tutor" && (
                            <div className="pt-1">
                                <label className="block mb-2 text-sm font-semibold text-white/90">
                                    Modalidad de tus clases
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {MODALITY_OPTIONS.map((opt) => {
                                        const isSelected = formData.modality === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() =>
                                                    setFormData({ ...formData, modality: opt.value })
                                                }
                                                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-secondary text-primary border-secondary shadow-sm"
                                                        : "bg-white/5 text-white/80 border-white/20 hover:bg-white/10 hover:text-white"
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Mensaje de éxito o error */}
                        {message && (
                            <p
                                className={`my-1 text-start text-sm p-3.5 rounded-xl font-medium ${
                                    messageType === "success"
                                        ? "text-primary bg-green-400"
                                        : "text-white bg-red-500/90 border border-red-400"
                                }`}
                            >
                                {message}
                            </p>
                        )}

                        <div className="pt-2 space-y-3">
                            <Button type="submit">
                                {loading ? "Creando cuenta..." : "Registrarse"}
                            </Button>

                            <div className="relative flex py-1 items-center">
                                <div className="flex-grow border-t border-white/15" />
                                <span className="flex-shrink mx-3 text-xs text-white/50">
                                    ¿Ya tenés cuenta?
                                </span>
                                <div className="flex-grow border-t border-white/15" />
                            </div>

                            <Link
                                to="/login"
                                className="block w-full bg-transparent text-accent border border-secondary/70 text-center font-medium hover:bg-accent hover:text-primary rounded-xl p-3 transition duration-300 ease-in-out"
                            >
                                Iniciar sesión
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;