import { Navigate, Outlet } from "react-router-dom";

const UserRoutes = () => {
  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // If user exists (any type), allow access
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default UserRoutes;
