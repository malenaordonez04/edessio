import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice'; // Importamos nuestro reducer

//El objeto que tiene toda la información de los componentes. El estado global. 
export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;