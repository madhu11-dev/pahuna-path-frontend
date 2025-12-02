import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Building2, 
  Users, 
  Star, 
  Calendar, 
  Settings,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Edit3
} from "lucide-react";
import { getStaffDashboardDataApi, updateStaffProfileApi, logoutUserApi } from "../../apis/Api";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    staff: {},
    hotelStats: {
      totalAccommodations: 0,
      verifiedAccommodations: 0,
      pendingAccommodations: 0,
      totalReviews: 0,
      averageRating: 0
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    profile_picture: null
  });

  useEffect(() => {
    checkStaffAuth();
    fetchDashboardData();
  }, []);

  const checkStaffAuth = () => {
    const utype = localStorage.getItem("utype");
    if (utype !== "STF") {
      toast.error("Access denied. Staff login required.");
      navigate("/login");
    }
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const fetchDashboardData = async () => {
    try {
      const response = await getStaffDashboardDataApi();
      if (response.data.success) {
        setDashboardData(response.data);
        setProfileForm({
          name: response.data.staff.name || "",
          email: response.data.staff.email || "",
          phone: response.data.staff.phone || "",
          profile_picture: null
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append("name", profileForm.name);
      formData.append("phone", profileForm.phone);
      if (profileForm.profile_picture) {
        formData.append("profile_picture", profileForm.profile_picture);
      }

      const response = await updateStaffProfileApi(formData);
      
      if (response.data.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUserApi();
      
      // Clear cookies
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "user_profile_picture=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Clear localStorage
      localStorage.removeItem("utype");
      
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const { staff, hotelStats } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Building2 className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pahuna Path - Staff Dashboard</h1>
                <p className="text-gray-600">{staff.hotel_name || 'Local Tourism Partner'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                {staff.profile_picture ? (
                  <img 
                    src={`http://localhost:8000/storage/${staff.profile_picture}`} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <Users className="w-8 h-8 text-emerald-600" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back, {staff.name}!</h2>
                <p className="text-gray-600">Tourism Partner - {staff.hotel_name}</p>
                <p className="text-sm text-emerald-600">✓ Email Verified - Ready to add accommodations!</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
            </button>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <form onSubmit={handleProfileUpdate} className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileForm({ ...profileForm, profile_picture: e.target.files[0] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Update Profile
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Accommodations</p>
                <p className="text-3xl font-bold text-gray-900">{hotelStats.totalAccommodations}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-3xl font-bold text-gray-900">{hotelStats.verifiedAccommodations}</p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-3xl font-bold text-gray-900">{hotelStats.pendingAccommodations}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{hotelStats.totalReviews}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">{hotelStats.averageRating}/5</p>
              </div>
              <Star className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Add Accommodation Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Building2 className="w-6 h-6 text-emerald-600 mr-2" />
            Add Accommodation
          </h3>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
            <p className="text-emerald-800 text-sm">
              <strong>As a tourism partner</strong>, you can add hotels and restaurants near local places to help travelers discover Nepal's hidden gems. 
              All submissions require admin approval.
            </p>
          </div>
          <button
            onClick={() => navigate('/staff/add-accommodation')}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            <Building2 className="w-5 h-5" />
            <span>Add New Accommodation</span>
          </button>
        </div>

        {/* Staff Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Users className="w-6 h-6 text-emerald-600 mr-2" />
            Partner Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Your Email</p>
                  <p className="font-semibold">{staff.email}</p>
                </div>
              </div>
              {staff.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{staff.phone}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-lg">
                <h4 className="font-semibold text-emerald-800 mb-2">Tourism Partner Benefits</h4>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• Add accommodations near local places</li>
                  <li>• Help travelers discover Nepal's hidden gems</li>
                  <li>• Support community-based tourism</li>
                  <li>• Connect locals with visitors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;