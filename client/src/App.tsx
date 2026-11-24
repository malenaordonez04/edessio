import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import FindTutorList from './pages/FindTutorPage';
import TutorProfilePage from './pages/TutorProfilePage';
import HomePage from "./pages/HomePage";
function App() {
  return (
    <Router>
     <Navbar  />
      <main className='w-full'>
      <Routes>
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/find-tutor' element={<FindTutorList />} />
            <Route path='/tutor/:id' element={<TutorProfilePage />} />
            <Route path='/' element={<HomePage/>}/>
            {/*La ruta que envuelve todas las rutas protegidas. Para entrar a las rutas protegidas, primero tiene que pasar por ProtectedRoute que chequea si tiene los permisos necesarios*/}
            <Route element={<ProtectedRoute />}> 
              <Route path='/profile' element={<ProfilePage />}/>
            </Route>
      </Routes>
      </main>
    </Router>
  )
}
export default App