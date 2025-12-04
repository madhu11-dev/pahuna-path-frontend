import { Building2, Edit3, LogOut, Plus, Users, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  deleteAccommodationApi,
  getCookie,
  getStaffDashboardDataApi,
  logoutStaffApi,
  newAccommodation,
  updateAccommodationApi,
} from "../../apis/Api";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    staff: {},
    accommodations: [],
  });
  const [showAddAccommodation, setShowAddAccommodation] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState(null);

  const [accommodationForm, setAccommodationForm] = useState({
    name: "",
    type: "guesthouse",
    description: "",
    google_map_link: "",
    imageFiles: [],
  });

  const [editAccommodationForm, setEditAccommodationForm] = useState({
    name: "",
    type: "guesthouse",
    description: "",
    google_map_link: "",
    imageFiles: [],
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
      if (error.message?.includes("401")) {
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

  // Handle accommodation submission
  const handleAccommodationSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(accommodationForm).forEach((key) => {
        if (key === "imageFiles") {
          accommodationForm.imageFiles.forEach((file, index) => {
            formData.append(`images[${index}]`, file);
          });
        } else {
          formData.append(key, accommodationForm[key]);
        }
      });

      const response = await newAccommodation(formData);

      if (response.status !== false) {
        toast.success("Accommodation created successfully!");
        setShowAddAccommodation(false);
        setAccommodationForm({
          name: "",
          type: "guesthouse",
          description: "",
          google_map_link: "",
          imageFiles: [],
        });
        fetchDashboardData();
      } else {
        toast.error(response.message || "Failed to create accommodation");
      }
    } catch (error) {
      console.error("Accommodation creation error:", error);
      if (error.response?.status === 403) {
        toast.error("Access denied. Please log in as verified staff.");
      } else {
        toast.error("Failed to create accommodation");
      }
    }
  };

  // Handle accommodation update
  const handleAccommodationUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(editAccommodationForm).forEach((key) => {
        if (
          key === "imageFiles" &&
          editAccommodationForm.imageFiles.length > 0
        ) {
          editAccommodationForm.imageFiles.forEach((file, index) => {
            formData.append(`images[${index}]`, file);
          });
        } else if (key !== "imageFiles") {
          formData.append(key, editAccommodationForm[key]);
        }
      });

      const response = await updateAccommodationApi(
        editingAccommodation.id,
        formData
      );

      if (response.status !== false) {
        toast.success("Accommodation updated successfully!");
        setEditingAccommodation(null);
        fetchDashboardData();
      } else {
        toast.error(response.message || "Failed to update accommodation");
      }
    } catch (error) {
      console.error("Accommodation update error:", error);
      toast.error("Failed to update accommodation");
    }
  };

  // Handle accommodation delete
  const handleAccommodationDelete = async (accommodationId) => {
    if (
      !window.confirm("Are you sure you want to delete this accommodation?")
    ) {
      return;
    }

    try {
      const response = await deleteAccommodationApi(accommodationId);
      if (response.status !== false) {
        toast.success("Accommodation deleted successfully!");
        fetchDashboardData();
      } else {
        toast.error(response.message || "Failed to delete accommodation");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete accommodation");
    }
  };

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

  // Start editing accommodation
  const startEditingAccommodation = (accommodation) => {
    setEditingAccommodation(accommodation);
    setEditAccommodationForm({
      name: accommodation.name || "",
      type: accommodation.type || "guesthouse",
      description: accommodation.description || "",
      google_map_link: accommodation.google_map_link || "",
      imageFiles: [],
    });
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

        {/* Profile Management */}
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

        {/* Accommodation Management */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Building2 className="w-6 h-6 text-emerald-600 mr-2" />
              Accommodation Management
            </h3>
            <button
              onClick={() => setShowAddAccommodation(!showAddAccommodation)}
              disabled={
                accommodations &&
                accommodations.length > 0 &&
                !showAddAccommodation
              }
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                accommodations &&
                accommodations.length > 0 &&
                !showAddAccommodation
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>
                {accommodations &&
                accommodations.length > 0 &&
                !showAddAccommodation
                  ? "Already have accommodation"
                  : showAddAccommodation
                  ? "Cancel"
                  : "Add Accommodation"}
              </span>
            </button>
          </div>

          {/* Add Accommodation Form */}
          {showAddAccommodation && (
            <form
              onSubmit={handleAccommodationSubmit}
              className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accommodation Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={accommodationForm.name}
                    onChange={(e) =>
                      setAccommodationForm({
                        ...accommodationForm,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    required
                    value={accommodationForm.type}
                    onChange={(e) =>
                      setAccommodationForm({
                        ...accommodationForm,
                        type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="guesthouse">Guesthouse</option>
                    <option value="hotel">Hotel</option>
                    <option value="resort">Resort</option>
                    <option value="lodge">Lodge</option>
                    <option value="hostel">Hostel</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Maps Link
                  </label>
                  <input
                    type="url"
                    value={accommodationForm.google_map_link}
                    onChange={(e) =>
                      setAccommodationForm({
                        ...accommodationForm,
                        google_map_link: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={accommodationForm.description}
                  onChange={(e) =>
                    setAccommodationForm({
                      ...accommodationForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setAccommodationForm({
                      ...accommodationForm,
                      imageFiles: Array.from(e.target.files),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can upload multiple images
                </p>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Create Accommodation
              </button>
            </form>
          )}

          {/* Accommodations List */}
          <div className="space-y-4">
            {accommodations && accommodations.length > 0 ? (
              accommodations.map((accommodation) => (
                <div
                  key={accommodation.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {editingAccommodation &&
                  editingAccommodation.id === accommodation.id ? (
                    // Edit Form
                    <form
                      onSubmit={handleAccommodationUpdate}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            required
                            value={editAccommodationForm.name}
                            onChange={(e) =>
                              setEditAccommodationForm({
                                ...editAccommodationForm,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <select
                            required
                            value={editAccommodationForm.type}
                            onChange={(e) =>
                              setEditAccommodationForm({
                                ...editAccommodationForm,
                                type: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="guesthouse">Guesthouse</option>
                            <option value="hotel">Hotel</option>
                            <option value="resort">Resort</option>
                            <option value="lodge">Lodge</option>
                            <option value="hostel">Hostel</option>
                            <option value="restaurant">Restaurant</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={editAccommodationForm.description}
                          onChange={(e) =>
                            setEditAccommodationForm({
                              ...editAccommodationForm,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAccommodation(null)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    // Display View
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {accommodation.name}
                        </h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              startEditingAccommodation(accommodation)
                            }
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleAccommodationDelete(accommodation.id)
                            }
                            className="text-red-600 hover:text-red-800"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <p>
                          <span className="font-medium">Type:</span>{" "}
                          {accommodation.type}
                        </p>

                        <p>
                          <span className="font-medium">Status:</span>
                          <span
                            className={`ml-1 px-2 py-1 rounded-full text-xs ${
                              accommodation.is_verified
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {accommodation.is_verified ? "Verified" : "Pending"}
                          </span>
                        </p>
                      </div>
                      {accommodation.description && (
                        <p className="mt-2 text-gray-600">
                          {accommodation.description}
                        </p>
                      )}
                      {accommodation.google_map_link && (
                        <div className="mt-2">
                          <a
                            href={accommodation.google_map_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View on Maps
                          </a>
                        </div>
                      )}
                      {accommodation.images &&
                        accommodation.images.length > 0 && (
                          <div className="mt-2 flex space-x-2">
                            {accommodation.images
                              .slice(0, 3)
                              .map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`${accommodation.name} - ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ))}
                            {accommodation.images.length > 3 && (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-600">
                                +{accommodation.images.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  No Accommodations Found
                </h4>
                <p className="text-gray-500">
                  Start by adding your first accommodation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
