import { Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Loginpage from "./pages/auth/Loginpage";
import Registerpage from "./pages/auth/Registerpage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Landing from "./pages/Landing";
import Feedpage from "./pages/user/Feedpage";
import Accommodations from "./pages/user/Accommodations";
import Explore from "./pages/user/Explore";
import AdminRoutes from "./protected_routes/AdminRoutes";
import UserRoutes from "./protected_routes/UserRoutes";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/register" element={<Registerpage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
        <Route element={<AdminRoutes />}>
          {/* <Route path="/admin" element={<AdminDashboard />} /> */}
        </Route>

        <Route element={<UserRoutes />}>
          <Route path="/feed" element={<Feedpage />} />
          <Route path="/accommodations" element={<Accommodations />} />
          <Route path="/explore" element={<Explore />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
