import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { type RootState } from "../app/store";
import EdessioLogo from '../assets/icons/Edessio_logo_lettering.svg'
import { FaTimes } from 'react-icons/fa'; 
import { IoMenu } from "react-icons/io5";
import { useState } from "react";

const Navbar = () => {
    //Le pido a redux el pedacito de información de "Auth". Hago una desestructuración del objeto auth que viene del state y recibo solo lo que está adentro de "user". useSelector sirve para "traer" y leer información del estado global de Redux.
    const { user } = useSelector((state: RootState) => state.auth);

    //Hooks para interactuar con Redux y el router.
    const dispatch = useDispatch();
    const navigate = useNavigate();
    //Estado para controlar el menu desplegable.
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    //Definimos un array de distintos links. show define que tipo de usuario debería ver cada link.
    const navLinks = [
      { to: '/profile', text: 'Mi Perfil', show: 'auth'},
      { to: '/find-tutor', text: 'Buscar Profesores', show: 'student'},
      { to: '/dashboard', text: 'Mi Dashboard', show: 'tutor'},
      { to: '/login', text: 'Iniciar Sesión', show: 'guest', styleType: 'secondary'},
      { to: '/register', text: 'Registrarse', show: 'guest', styleType: 'primary'},
    ]

    const handleLogout = () => {
        dispatch(logout()); //Despachamos la acción de logout.
        navigate('/') //Redirigimos al usuario al main.
        setIsMenuOpen(false);
    }    

    //Para que se cierre cada vez que le clickeamos un link.
    const handleLinkClick = () => {
      setIsMenuOpen(false)
    }

    const getButtonClasses = (styleType?: string) => {
      switch (styleType) {
        case 'primary':
          return "px-3 py-2 rounded-md text-md font-medium text-primary bg-secondary hover:bg-accent transition duration-300 ease-in-out";
        case 'secondary':
          return "px-3 py-2 rounded-md text-md font-medium text-white hover:border border-accent";
        default:
          return "text-white hover:text-accent hover:border-b border-accent"
      }
    }
    
    return(
    <nav className="bg-primary">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="">
            <Link to="/" className="">
              <h1><img src={EdessioLogo} alt="Logo de Edessio" className="size-32 sm:size-40"/></h1>
            </Link>
          </div>

          {/* Lógica de renderizado condicional */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.filter(link => {
              if (link.show === 'guest' && !user) return true;
              if (link.show === 'auth' && user) return true;
              if (link.show === 'student' && user?.role === 'student') return true;
              if (link.show === 'tutor' && user?.role === 'tutor') return true;
              return false;
            })
            .map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={getButtonClasses(link.styleType)}
              >
                {link.text}
              </Link>
            ))
            }
            {user && <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium text-accent bg-transparent border border-accent hover:bg-accent hover:text-primary transition duration-300 ease-in-out">Cerrar Sesión</button>}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-secondary hover:text-brand-dark focus:outline-none">{isMenuOpen ?  <FaTimes size={24} /> : <IoMenu size={34} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg z-50 text-center">
          <div className="px-2 pt-2 pb-3 sm:px-3">
            {navLinks
              .filter(link => {
                if (link.show === 'guest' && !user) return true;
                if (link.show === 'auth' && user) return true;
                if (link.show === 'student' && user?.role === 'student') return true;
                if (link.show === 'tutor' && user?.role === 'tutor') return true;
                return false;
              })
              .map(link => (
                <Link key={link.to} to={link.to} onClick={handleLinkClick} className="block px-3 rounded-md py-2 text-base font-medium text-gray-800 hover:bg-gray-100 hover:text-secondary hover:font-semibold">
                  {link.text}
                </Link>
              ))
            }
            {user && <button onClick={handleLogout} className="w-full block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100 hover:font-semibold">Cerrar Sesión</button>}
          </div>
        </div>
      )}
    </nav>
    )
}

export default Navbar