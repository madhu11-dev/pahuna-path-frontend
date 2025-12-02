import { Navigate, Outlet } from "react-router-dom";

const StaffRoutes = () => {
  // Get auth token from cookies
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const token = getCookie("auth_token");
  const utype = localStorage.getItem("utype");

  // Check if user is authenticated and is staff
  const isStaffAuthenticated = token && utype === "STF";

  return isStaffAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default StaffRoutes;
