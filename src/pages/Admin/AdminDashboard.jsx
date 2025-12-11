import { Building2, MapPin, Menu, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAllStaffApi, getDashboardStatsApi } from "../../apis/Api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminPageLayout from "../../components/admin/AdminPageLayout";

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
      total_reviews: 0,
    },
    user_graph_data: [],
  });

  const [staff, setStaff] = useState([]);

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

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      const response = await getAllStaffApi();
      if (response.status) {
        setStaff(response.data);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === "staff") {
      fetchStaff();
    }
  }, [activeTab]);

  // Hotel approval functions

  // Stats for dashboard
  const stats = [
    {
      title: "Total Users",
      value: dashboardStats.stats.total_users,
      icon: Users,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Total Reviews",
      value: dashboardStats.stats.total_reviews || 0,
      icon: UserCheck,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Total Places",
      value: dashboardStats.stats.total_places,
      icon: MapPin,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Total Accommodations",
      value: dashboardStats.stats.total_accommodations,
      icon: Building2,
      color: "bg-orange-100 text-orange-700",
    },
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
    <AdminPageLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      {/* Dashboard Content */}
      <main className="space-y-6">
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {stats.map((stat, i) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={i}
                    className="p-6 bg-white rounded-xl shadow-lg flex items-center gap-4"
                  >
                    <div className={`p-3 ${stat.color} rounded-full`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        {stat.title}
                      </p>
                      <p className="font-extrabold text-3xl text-emerald-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-emerald-800 mb-4">
                User Registrations {new Date().getFullYear()}
              </h2>
              {dashboardStats?.user_graph_data && dashboardStats.user_graph_data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart 
                    data={dashboardStats.user_graph_data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#666"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#666"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #ccc',
                        borderRadius: '8px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                  <Users className="w-16 h-16 text-gray-300 mb-4" />
                  <p>No user registration data available yet</p>
                  <p className="text-sm text-gray-400 mt-2">Data will appear once users register</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Staff */}
        {activeTab === "staff" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Staff Management
            </h1>
            {staff.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map((staffMember) => (
                  <div
                    key={staffMember.id}
                    className="bg-white border rounded-lg p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {staffMember.name}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Staff
                      </span>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600 mb-4">
                      <p>
                        <span className="font-medium text-gray-900">
                          Email:
                        </span>{" "}
                        {staffMember.email}
                      </p>
                      {staffMember.phone && (
                        <p>
                          <span className="font-medium text-gray-900">
                            Phone:
                          </span>{" "}
                          {staffMember.phone}
                        </p>
                      )}
                      <p>
                        <span className="font-medium text-gray-900">
                          Registered:
                        </span>{" "}
                        {new Date(staffMember.created_at).toLocaleDateString()}
                      </p>
                      {staffMember.email_verified_at && (
                        <p>
                          <span className="font-medium text-gray-900">
                            Email Verified:
                          </span>{" "}
                          ✓
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No staff members found</p>
              </div>
            )}
          </div>
        )}
      </main>
    </AdminPageLayout>
  );
};

export default AdminDashboard;
