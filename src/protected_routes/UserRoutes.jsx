import { Navigate, Outlet } from "react-router-dom";

const UserRoutes = () => {
  // Get user info from localStorage
  const user = localStorage.getItem("utype");

  // Check if user exists 
  return user && user === "USR" ? <Outlet /> : <Navigate to="/login" />;
};

export default UserRoutes;