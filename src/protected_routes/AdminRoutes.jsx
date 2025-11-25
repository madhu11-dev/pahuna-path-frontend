import { Navigate, Outlet } from "react-router-dom";

const AdminRoutes = () => {
  // Get auth token from cookies
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const token = getCookie("auth_token");
  const utype = localStorage.getItem("utype");

  // Check if user is authenticated and is admin
  const isAdminAuthenticated = token && utype === "ADM";

  return isAdminAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default AdminRoutes;