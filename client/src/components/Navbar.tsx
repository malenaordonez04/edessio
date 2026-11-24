import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { type RootState } from "../app/store";
import EdessioLogo from "../assets/icons/Edessio_logo_lettering.svg";
import Modal from "./Modal";
import { FaTimes } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import { MdLogout } from "react-icons/md";

interface NavItem {
    to: string;
    text: string;
    show: "guest" | "student" | "tutor" | "public-or-student";
    styleType?: "primary" | "secondary";
}

const Navbar = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Estado para el menú hamburguesa en celulares
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Estado para abrir/cerrar el modal de confirmación antes de cerrar sesión
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Obtenemos el ID del usuario de forma segura (por si viene como _id o id)
    const userId = user?._id || (user as any)?.id;

    // Definimos todos los enlaces según el rol del usuario
    const navLinks: NavItem[] = [
        // Visible para visitantes y alumnos (los profesores no necesitan buscar otros profesores)
        { to: "/find-tutor", text: "Buscar Profesores", show: "public-or-student" },

        // Enlaces exclusivos de Alumno (apuntan directo a cada pestaña de /profile mediante ?tab=)
        { to: "/profile?tab=agenda", text: "Mis Reservas", show: "student" },
        { to: "/profile?tab=messages", text: "Mensajes", show: "student" },
        { to: "/profile?tab=dashboard", text: "Mi Perfil", show: "student" },

        // Enlaces exclusivos de Profesor
        { to: "/profile?tab=agenda", text: "Mi Agenda", show: "tutor" },
        { to: "/profile?tab=availability", text: "Mis Horarios", show: "tutor" },
        { to: "/profile?tab=messages", text: "Mensajes", show: "tutor" },
        ...(userId
            ? [{ to: `/tutor/${userId}`, text: "Ver Perfil Público", show: "tutor" as const }]
            : []),
        { to: "/profile?tab=dashboard", text: "Mi Panel", show: "tutor" },

        // Enlaces para usuarios no logueados
        { to: "/login", text: "Iniciar Sesión", show: "guest", styleType: "secondary" },
        { to: "/register", text: "Registrarse", show: "guest", styleType: "primary" }
    ];

    // Filtra qué enlaces corresponden mostrar según si hay usuario y cuál es su rol
    const visibleLinks = navLinks.filter((link) => {
        if (link.show === "guest" && !user) return true;
        if (link.show === "public-or-student" && (!user || user.role === "student")) return true;
        if (link.show === "student" && user?.role === "student") return true;
        if (link.show === "tutor" && user?.role === "tutor") return true;
        return false;
    });

    // Abre el modal de confirmación y cierra el menú móvil si estaba abierto
    const handleOpenLogoutConfirm = () => {
        setIsMenuOpen(false);
        setIsLogoutModalOpen(true);
    };

    // Ejecuta el cierre de sesión real recién cuando el usuario confirma en el modal
    const handleConfirmLogout = () => {
        setIsLogoutModalOpen(false);
        dispatch(logout());
        navigate("/");
    };

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    // Verifica si el link coincide con la ruta y query (?tab=) actual para resaltarlo
    const isLinkActive = (to: string) => {
        const currentFullPath = `${location.pathname}${location.search}`;
        return currentFullPath === to || (to === "/profile?tab=dashboard" && location.pathname === "/profile" && !location.search);
    };

    const getButtonClasses = (link: NavItem) => {
        switch (link.styleType) {
            case "primary":
                return "px-4 py-2 rounded-full text-sm font-semibold text-primary bg-secondary hover:bg-accent transition duration-200";
            case "secondary":
                return "px-4 py-2 rounded-full text-sm font-medium text-white border border-white/30 hover:border-accent hover:text-accent transition duration-200";
            default: {
                const active = isLinkActive(link.to);
                return `px-2 py-1 text-sm font-medium transition duration-200 border-b-2 ${
                    active
                        ? "text-accent border-accent font-semibold"
                        : "text-white border-transparent hover:text-accent"
                }`;
            }
        }
    };

    return (
        <>
            <nav className="bg-primary shadow-sm sticky top-0 z-40">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" onClick={handleLinkClick} className="flex-shrink-0">
                            <h1>
                                <img src={EdessioLogo} alt="Logo de Edessio" className="size-32 sm:size-40" />
                            </h1>
                        </Link>

                        {/* Navegación Desktop */}
                        <div className="hidden md:flex items-center space-x-5">
                            {visibleLinks.map((link) => (
                                <Link
                                    key={`${link.to}-${link.text}`}
                                    to={link.to}
                                    className={getButtonClasses(link)}
                                >
                                    {link.text}
                                </Link>
                            ))}

                            {user && (
                                <button
                                    type="button"
                                    onClick={handleOpenLogoutConfirm}
                                    className="px-3.5 py-1.5 rounded-full text-sm font-medium text-accent bg-transparent border border-accent hover:bg-accent hover:text-primary transition duration-200 cursor-pointer"
                                >
                                    Cerrar Sesión
                                </button>
                            )}
                        </div>

                        {/* Botón hamburguesa Mobile */}
                        <div className="md:hidden flex items-center">
                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Abrir menú"
                                className="text-secondary hover:text-accent focus:outline-none cursor-pointer"
                            >
                                {isMenuOpen ? <FaTimes size={24} /> : <IoMenu size={32} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Menú desplegable Mobile */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-xl border-t border-gray-100 z-50">
                        <div className="px-4 pt-3 pb-4 space-y-1">
                            {user && (
                                <div className="px-3 py-2 mb-2 border-b border-gray-100 text-left">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Conectado como</p>
                                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                                </div>
                            )}

                            {visibleLinks.map((link) => (
                                <Link
                                    key={`${link.to}-${link.text}`}
                                    to={link.to}
                                    onClick={handleLinkClick}
                                    className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                                        isLinkActive(link.to)
                                            ? "bg-blue-50 text-primary font-semibold"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                                    }`}
                                >
                                    {link.text}
                                </Link>
                            ))}

                            {user && (
                                <button
                                    type="button"
                                    onClick={handleOpenLogoutConfirm}
                                    className="w-full text-left px-3 py-2.5 mt-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                    Cerrar Sesión
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* MODAL DE CONFIRMACIÓN PARA CERRAR SESIÓN */}
            <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)}>
                <div className="text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                            <MdLogout className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">¿Cerrar sesión?</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Vas a salir de tu cuenta en Edessio. Podés volver a iniciar sesión en cualquier momento.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsLogoutModalOpen(false)}
                            className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmLogout}
                            className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                        >
                            Sí, cerrar sesión
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Navbar;