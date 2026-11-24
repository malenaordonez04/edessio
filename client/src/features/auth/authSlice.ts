import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

//El slice de autenticación se ocupa de manejar la información del user y su respectivo token de sesión. 
interface UserState {
    _id: string;
    email: string | null;
    name: string | null;
    role: string | null;
    profilePicture?: string; //No es obligatoria.
    location?: string; //No es obligatoria.
    bio?: string; //No es obligatoria.
    subjects?: string[]; //No es obligatoria.
    price?: number;

}

interface AuthState{
    user: UserState | null;
    token: string | null;
}

//Buscamos si hay datos del usuario guardados en el localStorage.
//userFromStorage empieza siendo null y despues dice que solo se puede guardar o UserState o 'null'.
let userFromStorage: UserState | null = null;
const storedUser = localStorage.getItem('user');

//Validamos si siquiera hay algo guardado en storedUser y si lo que esta guardado, no es 'undefined'. Despues hacemos el trycatch por si el parse fallo por alguna otra razon. Evitamos que se rompa la aplicación.
if (storedUser && storedUser !== 'undefined') {
    try {
        userFromStorage = JSON.parse(storedUser);     
    } catch (error) {
        console.error('No se pudo parsear user de LocalStorage', error);
        userFromStorage = null;
    }
};
const storedToken = localStorage.getItem('token');

//Si hay información guardada en el localStorage, la cargamos en el estado inicial y se inicia sesión. 
const initialState: AuthState = {
    user: userFromStorage, //Información ya validada anteriormente.
    token: storedToken,
}

//Creamos el slice de estado para el usuario
const authSlice = createSlice({
    name: 'auth', //Nombre del slice
    initialState, //Estado inicial del slice
    reducers: {
        //Definimos la acción del login. PayloadAction define la estructura de lo que tenemos que recibir en el "formulario" para hacer el login, tiene que recibir el user y su token.
        login: (state, action: PayloadAction<{ user: UserState; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            //Guardamos los datos en el localStorage para que la sesión persista.
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('token', action.payload.token);
    },
        //Definimos la acción del logout
        logout: (state) => {
            state.user = null;
            state.token = null;
            //Limpiamos los datos del localStorage.
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
        //UpdateUser recibe el state del usuario y la action que es el formulario, el PayloadAction es la información que viaja adentro del form. La información del payload debe cumplir con las reglas de interface de UserState, esto se hace para que updateUser reciba realmente la información correcta.
        updateUser: (state, action: PayloadAction<UserState>) => {
            if (state.user) {
                //Si existe usuario logueado, copiamos la información que ya estaba antes y agregamos la información nueva.
                state.user = {...state.user, ...action.payload};
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        }
    },
})

//Exportamos las acciones para poder usarlas en los componentes.
export const { login, logout, updateUser } = authSlice.actions;

//Exportamos el reducer para añadirlo a nuestra "store".
export default authSlice.reducer;