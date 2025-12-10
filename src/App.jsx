import { Route, Routes } from "react-router-dom";
import AdminAccommodations from "./pages/Admin/AdminAccommodations";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminPlaces from "./pages/Admin/AdminPlaces";
import AdminStaff from "./pages/Admin/AdminStaff";
import AdminUsers from "./pages/Admin/AdminUsers";

import Loginpage from "./pages/auth/Loginpage";
import Registerpage from "./pages/auth/Registerpage";
import HotelStaffRegister from "./pages/auth/HotelStaffRegister";
import StaffDashboard from "./pages/Staff/StaffDashboard";
import StaffRoutes from "./protected_routes/StaffRoutes";

import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Landing from "./pages/Landing";
import Accommodations from "./pages/user/Accommodations";
import Feedpage from "./pages/user/Feedpage";
import Profile from "./pages/user/Profile";
import BookingPage from "./pages/user/BookingPage";
import MyBookings from "./pages/user/MyBookings";
import Transactions from "./pages/user/Transactions";
import AdminRoutes from "./protected_routes/AdminRoutes";
import UserRoutes from "./protected_routes/UserRoutes";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/register" element={<Registerpage />} />
        <Route path="/hotel-staff-register" element={<HotelStaffRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin routes */}
        <Route element={<AdminRoutes />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/places" element={<AdminPlaces />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/staff" element={<AdminStaff />} />
          <Route
            path="/admin/accommodations"
            element={<AdminAccommodations />}
          />
          {/* route path for admin */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* User routes */}
        <Route element={<UserRoutes />}>
          <Route path="/feed" element={<Feedpage />} />
          <Route path="/accommodations" element={<Accommodations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/book-accommodation" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/transactions" element={<Transactions />} />
        </Route>

        {/* Staff routes */}
        <Route element={<StaffRoutes />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
