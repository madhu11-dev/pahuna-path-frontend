import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  MapPin, 
  Building2, 
  Users, 
  UserCheck, 
  Settings, 
  LogOut, 
  X 
} from "lucide-react";
import { toast } from "react-toastify";
import { adminLogoutApi } from "../apis/Api";

const AdminSidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from current route
  const getCurrentActiveTab = () => {
    if (location.pathname.includes('/admin/places')) return 'places';
    if (location.pathname.includes('/admin/users')) return 'users';
    if (location.pathname.includes('/admin/dashboard') || location.pathname === '/admin') return 'dashboard';
    return activeTab;
  };

  const currentActiveTab = getCurrentActiveTab();

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "places", label: "Places", icon: MapPin },
    { key: "hotels", label: "Hotels", icon: Building2 },
    { key: "staff", label: "Staff", icon: UserCheck },
    { key: "users", label: "Users", icon: Users },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const clearCookies = () => {
    // Clear all auth-related cookies
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user_profile_picture=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "admin_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "admin_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Clear localStorage
    localStorage.removeItem("utype");
    localStorage.removeItem("admin_type");
  };

  const handleLogout = async () => {
    try {
      const token = getCookie("auth_token");
      
      if (token) {
        await adminLogoutApi();
      }
      
      clearCookies();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      clearCookies(); // Clear cookies 
      toast.error("Logout failed, but session cleared");
      navigate("/login");
    }
  };

  const handleMenuClick = (key) => {
    if (key === "dashboard") {
      navigate("/admin/dashboard");
    } else if (key === "places") {
      navigate("/admin/places");
    } else if (key === "users") {
      navigate("/admin/users");
    } else {
      // For other tabs that still use the dashboard component
      setActiveTab(key);
      navigate("/admin/dashboard");
    }
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-emerald-900 text-white flex flex-col z-50 transform transition-transform duration-300 shadow-2xl md:shadow-none ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        {/* Header */}
        <div className="p-6 text-2xl font-extrabold border-b border-emerald-800 flex justify-between items-center">
          <span>Admin Panel</span>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden text-white/80 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleMenuClick(item.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 ${
                  currentActiveTab === item.key
                    ? "bg-emerald-700 text-white font-semibold shadow-inner"
                    : "hover:bg-emerald-700/60 text-emerald-100 hover:text-white"
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-emerald-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left text-emerald-100 hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 md:hidden z-40" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;