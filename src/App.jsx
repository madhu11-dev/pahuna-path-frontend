import { Route, Routes } from 'react-router-dom';
import Loginpage from "./pages/auth/Loginpage";
import Registerpage from './pages/auth/Registerpage';
import Feedpage from './pages/user/Feedpage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';

const App = () => {
  return (
    <>
        <Routes>
          <Route path="/login" element={<Loginpage />} />
          <Route path="/register" element={<Registerpage />} />
          <Route path="/feed" element={<Feedpage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard/>}/>
        </Routes>
    </>
  )
}

export default App