import { useSelector, type UseSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { type RootState } from "../app/store";

const ProtectedRoute = () => {
    //Revisamos si hay un token en el estado global de Redux.
    const {token} = useSelector((state: RootState) => state.auth);

    //Si hay token, permite el acceso. Outlet renderiza la página que se esté queriendo acceder que necesite pasar por esta verificación previa.
    if (token) {
        return <Outlet />;
    };

    //Si no hay token, redirigimos a la ruta de login. Replace le prohibie al usuario volver para atrás con el navegador.
    return <Navigate to="/login"  replace/>;
};

export default ProtectedRoute;