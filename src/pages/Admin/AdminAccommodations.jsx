import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  MapPin,
  Mail,
  Hotel
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import { getPendingAccommodationsApi, approveAccommodationApi, rejectAccommodationApi } from "../../apis/Api";

const AdminAccommodations = () => {
  const [activeTab, setActiveTab] = useState("accommodations");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingStaff, setPendingStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingStaff();
  }, []);

  const fetchPendingStaff = async () => {
    try {
      const response = await getPendingAccommodationsApi(); // API endpoint stays same
      if (response.data) {
        setPendingStaff(response.data);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (staffId) => {
    try {
      const response = await approveAccommodationApi(staffId); // API function stays same
      if (response.data?.status) {
        toast.success("Staff approved successfully");
        fetchPendingStaff(); // Refresh the list
      }
    } catch (error) {
      console.error("Error approving staff:", error);
      toast.error("Failed to approve staff");
    }
  };

  const handleReject = async (staffId) => {
    if (window.confirm("Are you sure you want to revoke approval for this staff member?")) {
      try {
        const response = await rejectAccommodationApi(staffId); // API function stays same
        if (response.data?.status) {
          toast.success("Staff approval revoked successfully");
          fetchPendingStaff(); // Refresh the list
        }
      } catch (error) {
        console.error("Error revoking staff approval:", error);
        toast.error("Failed to revoke staff approval");
      }
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
                  <Building2 className="w-8 h-8 text-emerald-600 mr-3" />
                  Tourism Partners
                </h1>
                <p className="text-gray-600 mt-2">
                  View registered tourism partner staff members
                </p>
              </div>
              <div className="bg-emerald-50 px-4 py-2 rounded-lg">
                <span className="text-emerald-700 font-medium">
                  {pendingStaff.length} Registered Partners
                </span>
              </div>
            </div>
          </div>

          {/* Accommodations List */}
          {pendingStaff.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Staff Members</h3>
              <p className="text-gray-500">
                Staff registrations will appear here for review.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {pendingStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                          <User className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {staff.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="w-4 h-4 mr-1" />
                            Registered on {staff.created_at}
                          </div>
                          <div className="flex items-center text-sm mt-1">
                            {staff.is_approved ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                ✓ Approved
                              </span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                ⏳ Pending Approval
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Email:</span>
                            <span className="text-sm font-medium text-gray-900 ml-1">
                              {staff.email}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Hotel:</span>
                            <span className="text-sm font-medium text-gray-900 ml-1">
                              {staff.hotel_name || 'Not specified'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Phone:</span>
                            <span className="text-sm font-medium text-gray-900 ml-1">
                              {staff.phone || 'Not provided'}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Email Verified:</span>
                            <span className="text-sm font-medium text-gray-900 ml-1">
                              {staff.email_verified_at ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Status:</span>
                            <span className={`text-sm font-medium ml-1 ${staff.is_approved ? 'text-green-600' : 'text-yellow-600'}`}>
                              {staff.is_approved ? 'Approved' : 'Pending Approval'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Staff Badge */}
                    <div className="flex space-x-3 ml-6">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        staff.email_verified_at 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {staff.email_verified_at ? '✓ Active' : '⏳ Unverified'}
                      </div>
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