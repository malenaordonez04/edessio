import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { store } from './app/store.ts';
import { Provider } from 'react-redux';
import './index.css';

//Con provider envolviendo la App, permitimos que cada componente pueda acceder a la Store de redux para poder almacenar la información necesaria y tenerla en el estado global.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
