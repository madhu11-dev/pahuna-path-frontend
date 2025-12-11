import {
  Calendar,
  CheckCircle,
  Mail,
  Search,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { deleteUserApi, getAllStaffApi } from "../../apis/Api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import ConfirmationModal from "../../components/ConfirmationModal";

const AdminStaff = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, data: null });

  // Handle staff selection
  const handleStaffSelection = (staffId) => {
    if (selectedStaff.includes(staffId)) {
      setSelectedStaff(selectedStaff.filter((id) => id !== staffId));
    } else {
      setSelectedStaff([...selectedStaff, staffId]);
    }
  };

  // Select all staff
  const handleSelectAll = () => {
    if (selectedStaff.length === filteredStaff.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(filteredStaff.map((staff) => staff.id));
    }
  };

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await getAllStaffApi();
      if (response.success && response.data) {
        setStaff(response.data);
        setFilteredStaff(response.data);
      } else {
        toast.error("Failed to load staff");
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  // Delete staff member
  const handleDeleteStaff = (staffId, staffName) => {
    setConfirmModal({
      isOpen: true,
      action: 'deleteSingle',
      data: { staffId, staffName },
    });
  };

  const executeDeleteStaff = async () => {
    const { staffId } = confirmModal.data;
    setConfirmModal({ ...confirmModal, isOpen: false });
    try {
      const response = await deleteUserApi(staffId);
      if (response.status) {
        toast.success("Staff member deleted successfully");
        setSelectedStaff(selectedStaff.filter((id) => id !== staffId));
        fetchStaff(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to delete staff member");
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("Failed to delete staff member");
    }
  };

  // Delete multiple staff
  const handleBulkDelete = () => {
    if (selectedStaff.length === 0) {
      toast.error("Please select staff to delete");
      return;
    }

    const staffNames = selectedStaff
      .map((id) => {
        const staff = filteredStaff.find((s) => s.id === id);
        return staff ? staff.name : "Unknown";
      })
      .join(", ");

    setConfirmModal({
      isOpen: true,
      action: 'deleteBulk',
      data: { staffNames, count: selectedStaff.length },
    });
  };

  const executeBulkDelete = async () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    try {
      for (const staffId of selectedStaff) {
        await deleteUserApi(staffId);
      }
      toast.success(
        `${selectedStaff.length} staff members deleted successfully`
      );
      setSelectedStaff([]);
      fetchStaff();
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("Failed to delete staff members");
    }
  };

  // Search and filter staff
  useEffect(() => {
    let filtered = staff.filter(
      (staffMember) =>
        staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort staff
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "created_at") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredStaff(filtered);
  }, [staff, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    fetchStaff();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (loading) {
    return (
      <AdminPageLayout
        activeTab="staff"
        setActiveTab={() => {}}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      activeTab="staff"
      setActiveTab={() => {}}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserCheck className="w-8 h-8 text-emerald-600 mr-3" />
              Staff Management
            </h1>
            <p className="text-gray-600 mt-2">
                  Manage tourism partner staff members
                </p>
              </div>
              <div className="bg-emerald-50 px-4 py-2 rounded-lg">
                <span className="text-emerald-700 font-medium">
                  {filteredStaff.length} Staff Members
                </span>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="created_at">Sort by Registration Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedStaff.length > 0 && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedStaff.length} staff member(s) selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Staff Table */}
          {filteredStaff.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedStaff.length === filteredStaff.length &&
                            filteredStaff.length > 0
                          }
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStaff.map((staffMember) => (
                      <tr
                        key={staffMember.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          selectedStaff.includes(staffMember.id)
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedStaff.includes(staffMember.id)}
                            onChange={() =>
                              handleStaffSelection(staffMember.id)
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <UserCheck className="w-5 h-5 text-emerald-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {staffMember.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {staffMember.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {staffMember.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(
                              staffMember.created_at
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {staffMember.email_verified_at ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⏳ Unverified
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() =>
                                handleDeleteStaff(
                                  staffMember.id,
                                  staffMember.name
                                )
                              }
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Delete Staff"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-lg text-center">
              <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No staff found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? `No staff match "${searchTerm}"`
                  : "No staff have registered yet."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null, data: null })}
        onConfirm={() => {
          if (confirmModal.action === 'deleteSingle') executeDeleteStaff();
          else if (confirmModal.action === 'deleteBulk') executeBulkDelete();
        }}
        title="Confirm Deletion"
        message={
          confirmModal.action === 'deleteSingle'
            ? `Are you sure you want to delete staff member "${confirmModal.data?.staffName}"? This action cannot be undone.`
            : confirmModal.action === 'deleteBulk'
            ? `Are you sure you want to delete ${confirmModal.data?.count} staff members (${confirmModal.data?.staffNames})? This action cannot be undone.`
            : ''
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmButtonColor="red"
      />
    </AdminPageLayout>
  );
};

export default AdminStaff;
