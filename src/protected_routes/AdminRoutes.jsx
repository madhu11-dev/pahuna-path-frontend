import { Navigate, Outlet } from "react-router-dom";

const AdminRoutes = () => {
  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Check if user exists and has admin type
  return user && user.utype === "ADM" ? <Outlet /> : <Navigate to="/login" />;
};

export default AdminRoutes;