import { Route, Routes } from 'react-router-dom';
import Loginpage from "./pages/auth/Loginpage";
import Registerpage from './pages/auth/Registerpage';
import Feedpage from './pages/auth/Feedpage';

const App = () => {
  return (
    <>
        <Routes>
          <Route path="/login" element={<Loginpage />} />
          <Route path="/register" element={<Registerpage />} />
          <Route path="/feed" element={<Feedpage />} />
        </Routes>
    </>
  )
}

export default App