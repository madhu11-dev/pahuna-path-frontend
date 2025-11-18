import { Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Loginpage from "./pages/auth/Loginpage";
import Registerpage from "./pages/auth/Registerpage";
import Dashboard from "./pages/Dashboard";
import Feedpage from "./pages/user/Feedpage";
<<<<<<< Updated upstream
import AdminRoutes from "./protected_routes/AdminRoutes";
import UserRoutes from "./protected_routes/UserRoutes";
=======
import Accomodations from "./pages/user/Accomodations";
>>>>>>> Stashed changes

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Loginpage />} />
        <Route path="/register" element={<Registerpage />} />
<<<<<<< Updated upstream

        <Route element={<AdminRoutes />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route element={<UserRoutes />}>
          <Route path="/feed" element={<Feedpage />} />
          <Route path="/" element={<Dashboard />} />
        </Route>
=======
        <Route path="/feed" element={<Feedpage />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/accomodate" element={<Accomodations/>} />
>>>>>>> Stashed changes
      </Routes>
    </>
  );
};

export default App;
