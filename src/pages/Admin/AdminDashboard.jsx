import React, { useState, useEffect } from "react";
import { Users, MapPin, Building2, BarChart3, Menu, Star, UserCheck } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminSidebar from "../../components/AdminSidebar";
import { 
  getDashboardStatsApi, 
  getAllUsersApi, 
  getAllHotelsApi 
} from "../../apis/Api";

// --- Admin Dashboard ---
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    stats: {
      total_users: 0,
      total_visitors: 0,
      total_places: 0,
      total_hotels: 0,
      total_reviews: 0
    },
    visitor_graph_data: []
  });
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsResponse = await getDashboardStatsApi();
      if (statsResponse.status) {
        setDashboardStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users data
  const fetchUsers = async () => {
    try {
      const response = await getAllUsersApi();
      if (response.status) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };



  // Fetch hotels data
  const fetchHotels = async () => {
    try {
      const response = await getAllHotelsApi();
      if (response.status) {
        setHotels(response.hotels);
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
      toast.error("Failed to load hotels");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "hotels") {
      fetchHotels();
    }
  }, [activeTab]);

  // Stats for dashboard
  const stats = [
    { 
      title: "Total Users", 
      value: dashboardStats.stats.total_users, 
      icon: Users, 
      color: "bg-blue-100 text-blue-700" 
    },
    { 
      title: "Total Visitors", 
      value: dashboardStats.stats.total_visitors, 
      icon: UserCheck, 
      color: "bg-green-100 text-green-700" 
    },
    { 
      title: "Total Places", 
      value: dashboardStats.stats.total_places, 
      icon: MapPin, 
      color: "bg-purple-100 text-purple-700" 
    },
    { 
      title: "Total Hotels", 
      value: dashboardStats.stats.total_hotels, 
      icon: Building2, 
      color: "bg-orange-100 text-orange-700" 
    }
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 font-sans items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 space-y-6">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden mb-4 p-2 bg-emerald-900 text-white rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {stats.map((stat, i) => {
                const IconComponent = stat.icon;
                return (
                  <div key={i} className="p-6 bg-white rounded-xl shadow-lg flex items-center gap-4">
                    <div className={`p-3 ${stat.color} rounded-full`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                      <p className="font-extrabold text-3xl text-emerald-900">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-emerald-800 mb-4">Visitors Graph 2025</h2>
              {dashboardStats.visitor_graph_data.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dashboardStats.visitor_graph_data}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="visits" stroke="#22c55e" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No visitor data available
                </div>
              )}
            </div>
          </>
        )}



        {/* Hotels */}
        {activeTab === "hotels" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Hotels Management</h1>
            {hotels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <div key={hotel.id} className="bg-white shadow-lg rounded-xl overflow-hidden">
                    {hotel.image_url && (
                      <img src={hotel.image_url} alt={hotel.name} className="w-full h-40 object-cover" />
                    )}
                    <div className="p-4">
                      <p className="font-bold text-lg text-gray-900">{hotel.name}</p>
                      <p className="text-gray-600 text-sm mb-2">{hotel.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Added: {new Date(hotel.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hotels available (keeping count at 0 as requested)</p>
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
            {users.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img 
                                className="h-10 w-10 rounded-full" 
                                src={user.profile_picture_url} 
                                alt={user.name} 
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users available</p>
              </div>
            )}
          </div>
        )}

        {/* Staff */}
        {activeTab === "staff" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Staff management functionality coming soon</p>
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
              <h2 className="font-bold text-xl text-emerald-800">System Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Total Users</h3>
                  <p className="text-2xl font-bold text-blue-600">{dashboardStats.stats.total_users}</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800">Total Places</h3>
                  <p className="text-2xl font-bold text-green-600">{dashboardStats.stats.total_places}</p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-800">Total Hotels</h3>
                  <p className="text-2xl font-bold text-orange-600">{dashboardStats.stats.total_hotels}</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800">Total Reviews</h3>
                  <p className="text-2xl font-bold text-purple-600">{dashboardStats.stats.total_reviews}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <ToastContainer position="top-right" />
    </div>
  );
};

export default AdminDashboard;
