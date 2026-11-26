// import React, {useState} from "react";
// import axios from "axios";
// import { Link, useNavigate } from "react-router-dom"; //Para redirigir al usuario.
// import { useDispatch } from "react-redux"; //Para despachar acciones a redux.
// import { login } from "../features/auth/authSlice"; // La función de login que creamos
// import InputField from "../components/InputField";
// import Button from "../components/Button";

// const LoginPage = () => {

//     //Manejamos el estado inicial del componente.
//     const [formData, setFormData] = useState({
//         email: '',
//         password: '',
//     });
//     //Establecemos el estado inicial del componente del mensaje de éxito o error.
//     const [message, setMessage] = useState('');
//     const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     //Manejamos el cambio de valor de los inputs del componente.
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value,
//         });
//     };

//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         setMessage('');
//         setMessageType('');

//         try {
//           //Petición post al endpoint de login.
//            const response = await axios.post(
//             'http://localhost:5001/api/auth/login',
//             formData,
//            );
           
//            dispatch(login(response.data)); // Despachamos la acción de login con response.data que devuelve el objeto {user,token} que manda el backend.
          
           
//            setMessage('¡Bienvenido de vuelta! Redirigiendo...');
//            setMessageType('success');
           
           
//            setTimeout(() => {
//             navigate('/');
//            }, 1500);


//            //Lo mostramos en consola, después lo usaremos para mantener al usuario logueado.
           
//         } catch (error) {
//             if (axios.isAxiosError(error) && error.response) {
//                 setMessage(error.response.data.message);
//             } else {
//                 setMessage('Ocurrió un error inesperado');
//                 setMessageType('error');
//             }
//         }
//     }

//     return(
//       <div className="min-h-screen w-full  bg-gray-50 flex flex-col justify-center bg-primary py-12 sm:px-6 lg:px-8">
//        <div className="flex justify-center">
//           <h2 className="mt-6 text-center text-4xl font-medium text-white">
//             Iniciar Sesión
//           </h2>
//         </div>
//         <div className="w-[80%] border border-accent rounded mx-auto my-10"></div>
//         <div className="flex justify-center">
//           <form className="flex justify-center w-[80%] flex-col gap-4 mb-[2em] text-white" onSubmit={handleSubmit}>
//             <InputField
//               label="Correo Electrónico"
//               name="email"
//               type="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />

//             <InputField
//               label="Contraseña"
//               name="password"
//               type="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
            
//             {message && (<p className={`my-2 text-start text-sm p-3 rounded-xl ${messageType === 'success' ? 'text-primary bg-green-500' : 'text-white bg-red-500'}`}>{message}</p>)}

//             <Button type="submit">
//               Iniciar Sesión
//             </Button>
//              <div>
//               <Link to="/register">
//                 <button className="w-full bg-transparent text-accent border border-secondary text-center hover:bg-accent hover:text-primary rounded-xl p-3 transition duration-300 ease-in-out">Registrarse</button>
//                </Link>
//             </div>
//           </form>

//         </div>
//     </div>
//     );
// }

// export default LoginPage;

import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../features/auth/authSlice";
import InputField from "../components/InputField";
import Button from "../components/Button";

const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("");
        setMessageType("");
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5001/api/auth/login",
                {
                    email: formData.email.trim(),
                    password: formData.password
                }
            );

            dispatch(login(response.data));

            setMessage("¡Bienvenido de vuelta! Redirigiendo...");
            setMessageType("success");

            setTimeout(() => {
                navigate("/");
            }, 1200);
        } catch (error) {
            setMessageType("error");
            if (axios.isAxiosError(error) && error.response) {
                setMessage(error.response.data.message || "Credenciales inválidas.");
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
                    Iniciar Sesión
                </h2>
                <p className="mt-2 text-sm text-white/75">
                    Ingresá a tu cuenta para gestionar tus clases y mensajes.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-white/5 backdrop-blur-xs border border-white/15 rounded-2xl p-6 sm:p-8 shadow-xl">
                    <form className="flex flex-col gap-4 text-white" onSubmit={handleSubmit}>
                        <InputField
                            label="Correo Electrónico"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <InputField
                            label="Contraseña"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

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
                                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                            </Button>

                            <div className="relative flex py-1 items-center">
                                <div className="flex-grow border-t border-white/15" />
                                <span className="flex-shrink mx-3 text-xs text-white/50">
                                    ¿Todavía no tenés cuenta?
                                </span>
                                <div className="flex-grow border-t border-white/15" />
                            </div>

                            <Link
                                to="/register"
                                className="block w-full bg-transparent text-accent border border-secondary/70 text-center font-medium hover:bg-accent hover:text-primary rounded-xl p-3 transition duration-300 ease-in-out"
                            >
                                Crear cuenta
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;