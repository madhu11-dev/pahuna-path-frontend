import { Building2, Calendar, Clock, Hotel, MapPin, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getAllAccommodationsApi,
  verifyAccommodationApi,
} from "../../apis/Api";
import AdminSidebar from "../../components/AdminSidebar";

const AdminAccommodations = () => {
  const [activeTab, setActiveTab] = useState("accommodations");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const response = await getAllAccommodationsApi();
      if (response.data || response) {
        const accommodationsData = response.data || response;
        setAccommodations(accommodationsData);
      }
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      toast.error("Failed to load accommodations list");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccommodation = async (accommodationId, currentStatus) => {
    try {
      const response = await verifyAccommodationApi(accommodationId);
      if (response.status) {
        toast.success(response.message);
        // Update the local state
        setAccommodations((prev) =>
          prev.map((acc) =>
            acc.id === accommodationId
              ? { ...acc, is_verified: !currentStatus }
              : acc
          )
        );
      } else {
        toast.error(response.message || "Failed to update verification status");
      }
    } catch (error) {
      console.error("Error updating verification:", error);
      toast.error("Failed to update verification status");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Hotel className="w-8 h-8 text-emerald-600 mr-3" />
                  Accommodations Management
                </h1>
                <p className="text-gray-600 mt-2">
                  View and manage all accommodations in the system
                </p>
              </div>
              <div className="bg-emerald-50 px-4 py-2 rounded-lg">
                <span className="text-emerald-700 font-medium">
                  {accommodations.length} Total Accommodations
                </span>
              </div>
            </div>
          </div>

          {/* Accommodations List */}
          {accommodations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Hotel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Accommodations
              </h3>
              <p className="text-gray-500">
                Accommodations created by staff will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {accommodations.map((accommodation) => (
                <div
                  key={accommodation.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                          <Hotel className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {accommodation.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="w-4 h-4 mr-1" />
                            Created on{" "}
                            {new Date(
                              accommodation.created_at
                            ).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm mt-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {accommodation.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Type:</span>
                            <span className="text-sm font-medium text-gray-900 ml-1">
                              {accommodation.type}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              Created by:
                            </span>
                            <span className="text-sm font-medium text-gray-900 ml-1">
                              Staff ID: {accommodation.staff_id}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              Location:
                            </span>
                            {accommodation.google_map_link ? (
                              <a
                                href={accommodation.google_map_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-emerald-600 ml-1 hover:underline"
                              >
                                View on Map
                              </a>
                            ) : (
                              <span className="text-sm font-medium text-gray-500 ml-1">
                                Not provided
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">

                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              Created:
                            </span>
                            <span className="text-sm font-medium text-gray-900 ml-1">
                              {new Date(
                                accommodation.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {accommodation.description && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <strong>Description:</strong>{" "}
                            {accommodation.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Info Display */}
                    <div className="flex flex-col space-y-3 ml-6">
                      {/* Accommodation ID Badge */}
                      <div className="px-3 py-1 rounded-full text-xs font-medium text-center bg-blue-100 text-blue-800">
                        ID: {accommodation.id}
                      </div>

                      {/* Images Count */}
                      {accommodation.images && (
                        <div className="px-3 py-1 rounded-full text-xs font-medium text-center bg-gray-100 text-gray-800">
                          📷{" "}
                          {Array.isArray(accommodation.images)
                            ? accommodation.images.length
                            : 0}{" "}
                          Images
                        </div>
                      )}

                      {/* Verification Status */}
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium text-center ${
                          accommodation.is_verified
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {accommodation.is_verified
                          ? "✓ Verified"
                          : "⏳ Pending"}
                      </div>

                      {/* Verify Button */}
                      <button
                        onClick={() =>
                          handleVerifyAccommodation(
                            accommodation.id,
                            accommodation.is_verified
                          )
                        }
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                          accommodation.is_verified
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {accommodation.is_verified ? "Unverify" : "Verify"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAccommodations;
