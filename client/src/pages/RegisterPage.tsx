import React, {useState} from "react";
import InputField from "../components/InputField";
import Button from "../components/Button";
import RoleToggle from "../components/RoleToggle";
import axios from "axios";
import { Link ,useNavigate } from "react-router-dom";

//Defino el tipo de DataToSend para establecer que modality es opcional.
type DataToSend = {
  name: string,
  email: string,
  password: string,
  location: string,
  role: 'student' | 'tutor',
  modality?: string, //Es opcional
  bio?: string,
}

//Definimos el componente de la página.
const RegisterPage = () => {
  //Manejamos el estado inicial del componente.
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    modality: 'in-person',
  });
  
  //Separamos este atributo de los demas ya que este no es string y es más complejo.
  const [role, setRole] = useState<'student' | 'tutor'>('student');

  //Establecemos estado para los mensajes de respuesta.
  const [message, setMessage] = useState('');
  //Manejamos el estado del tipo de mensaje, así podemos poner distintos estilos según si hay success o error.
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const navigate = useNavigate();
  //Manejamos el cambio de valor en los campos.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      //Cada vez que hay un cambio en el input o select, se llama a la función de setFormData, copiamos el objeto actúal para no perder los datos de los demás y actualizamos los valores.
      setFormData({
        ...formData,
        [e.target.name]: e.target.value, //con e.target.name obtenemos el nombre del campo que cambió y cambiamos su valor con e.target.value.
      });
  };

    //Manejamos el envío del formulario.
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(''); //Limpiamos cualquier mensaje anterior.
        setMessageType('');

        if (formData.password !== formData.confirmPassword) {
          setMessage('Las contraseñas no coinciden.');
          setMessageType('error');
          return;
        }

        try {
          //Hacemos la variable dataToSend usando el tipo DataToSend para asegurarnos de que tiene todos los campos.
          let dataToSend: DataToSend = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            location: formData.location,
            role,
          }
          //Si el rol es tutor, se le agregan los campos de la modalidad.
          if (role === 'tutor') {
            dataToSend.modality = formData.modality;
          }

          //Hacemos la petición POST a la API.
          const response = await axios.post(
            'http://localhost:5001/api/auth/register',
            dataToSend
          )

          //Si la petición es exitosa, mostramos el mensaje del servidor y despues redirigimos.
          setMessage(response.data.message);
          setMessageType('success');

          setTimeout(() => {
            navigate('/login');
          }, 2000);
        
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setMessage(error.response.data.message)
            } else {
                setMessage('Ocurrió un error inesperado');
                setMessageType('error');
            }
        }
    }


    // 6. Estructura visual de la página.
    return (
    <div className="min-h-screen w-full bg-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <div className="flex justify-center">
        <h2 className="mt-6 text-center text-4xl font-medium text-white">
          Bienvenido
        </h2>
      </div>
      <div className="w-[80%] border border-accent rounded mx-auto my-10"></div>
      <div className="flex justify-center">
          <form className="flex justify-center w-[80%] flex-col gap-4 mb-[2em] text-white " onSubmit={handleSubmit}>
            <RoleToggle selectedRole={role} onRoleChange={(newRole) => setRole(newRole)}/>
            {/* Usamos el componente InputField para el nombre */}
            <InputField
              label="Nombre"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {/* Usamos el componente InputField para el email */}
            <InputField
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {/* Usamos el componente InputField para la contraseña */}
            <InputField
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {/* Usamos el componente InputField para la contraseña */}
            <InputField
              label="Confirmar Contraseña"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <InputField
              label="Ubicación"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              required
            />

            {role === 'tutor' && (
                <div>
                  <label htmlFor="modality" className="block mb-2 text-lg text-white">Modalidad</label>
                  <select name="modality" id="modality" value={formData.modality} onChange={handleChange} className="block w-full border p-2.5 text-sm rounded-lg">
                    <option value="in-person">Presencial</option>
                    <option value="remote">Virtual</option>
                    <option value="hybrid">Híbrido</option>
                  </select>
                </div>
            )}

          {/*Mostramos el mensaje de éxito o error*/}  
          {message && (
            <p className={`my-2 text-start text-sm p-3 rounded-xl ${messageType === 'success' ? 'text-primary bg-green-500/75' : 'text-white bg-red-500'}`}>
              {message}
            </p>
          )}

            {/* Usamos el componente Button para el botón de envío */}
            <Button type="submit"> Registrarse </Button>

            <div>
              <Link to="/login">
                <button className="w-full bg-transparent text-accent border border-secondary text-center hover:bg-accent hover:text-primary rounded-xl p-3 transition duration-300 ease-in-out">Iniciar sesión</button>
               </Link>
            </div>
          </form>

      </div>
    </div>
  );
};

export default RegisterPage;