import { Building2, LogOut, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  getCookie,
  getStaffDashboardDataApi,
  logoutStaffApi,
} from "../../apis/Api";
import StaffNavbar from "../../components/staff/StaffNavbar";
import BookingCalendar from "../../components/staff/BookingCalendar";
import TransactionsList from "../../components/staff/TransactionsList";
import RoomsManagement from "../../components/staff/RoomsManagement";
import ServicesManagement from "../../components/staff/ServicesManagement";
import AccommodationsList from "../../components/staff/AccommodationsList";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hotels');
  const [dashboardData, setDashboardData] = useState({
    staff: {},
    accommodations: [],
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = getCookie("auth_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await getStaffDashboardDataApi();

      if (response.status) {
        setDashboardData(response.data);
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else if (error.response?.status === 403) {
        toast.error("Unauthorized: You must be logged in as staff");
        navigate("/login");
      } else {
        toast.error("Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutStaffApi();

      // Clear all auth-related cookies
      document.cookie =
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "user_profile_picture=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Clear localStorage
      localStorage.removeItem("utype");
      localStorage.removeItem("token");

      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);

      // Clear cookies even if logout API fails
      document.cookie =
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "user_profile_picture=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.removeItem("utype");
      localStorage.removeItem("token");

      toast.error("Logout failed, but session cleared");
      navigate("/login");
    }
  };

  const { staff, accommodations } = dashboardData;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Staff Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome back, {staff?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <StaffNavbar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Profile Management - Only show on hotels tab */}
        {activeTab === 'hotels' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Users className="w-6 h-6 text-emerald-600 mr-2" />
                Profile Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{staff?.name || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{staff?.email || "Not provided"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Accommodation Management - Hotels tab */}
        {activeTab === 'hotels' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <AccommodationsList 
              accommodations={accommodations} 
              onRefresh={fetchDashboardData} 
            />
          </div>
        )}

        {/* Rooms Tab - Show message to manage rooms from Hotels tab */}
        {activeTab === 'rooms' && (
          <RoomsManagement accommodations={dashboardData.accommodations} />
        )}

        {/* Services Tab - Show message to manage services from Hotels tab */}
        {activeTab === 'services' && (
          <ServicesManagement accommodations={dashboardData.accommodations} />
        )}

        {/* Bookings Tab - Calendar view */}
        {activeTab === 'bookings' && <BookingCalendar />}

        {/* Transactions Tab - Transactions list */}
        {activeTab === 'transactions' && <TransactionsList />}
      </div>
    </div>
  );
};

export default StaffDashboard;
