import { Route, Routes } from 'react-router-dom';
import Loginpage from "./pages/auth/Loginpage";
import Registerpage from './pages/auth/Registerpage';

const App = () => {
  return (
    <>
        <Routes>
          <Route path="/login" element={<Loginpage />} />
          <Route path="/register" element={<Registerpage />} />
        </Routes>
    </>
  )
}

export default App