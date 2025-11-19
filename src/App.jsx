import { Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Loginpage from "./pages/auth/Loginpage";
import Registerpage from "./pages/auth/Registerpage";
import Dashboard from "./pages/Dashboard";
import Feedpage from "./pages/user/Feedpage";
import AdminRoutes from "./protected_routes/AdminRoutes";
import UserRoutes from "./protected_routes/UserRoutes";
// import Accomodations from "./pages/user/Accomodations";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/register" element={<Registerpage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        <Route element={<AdminRoutes />}>
          {/* <Route path="/admin" element={<AdminDashboard />} /> */}
        </Route>

        <Route element={<UserRoutes />}>
          <Route path="/feed" element={<Feedpage />} />
          {/* <Route path="/accomodate" element={<Accomodations/>} /> */}
        </Route>
      </Routes>
    </>
  );
};

export default App;
