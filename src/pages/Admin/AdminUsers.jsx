import {
  Calendar,
  Filter,
  Mail,
  Search,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { deleteUserApi, getAllUsersApi } from "../../apis/Api";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminSearchBar from "../../components/admin/AdminSearchBar";
import ConfirmationModal from "../../components/ConfirmationModal";

const AdminUsers = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, data: null });

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsersApi();
      if (response.status) {
        setUsers(response.users);
        setFilteredUsers(response.users);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = (userId, userName) => {
    setConfirmModal({
      isOpen: true,
      action: 'deleteSingle',
      data: { userId, userName },
    });
  };

  const executeDeleteUser = async () => {
    const { userId } = confirmModal.data;
    setConfirmModal({ ...confirmModal, isOpen: false });
    try {
      const response = await deleteUserApi(userId);
      if (response.status) {
        toast.success("User deleted successfully");
        fetchUsers(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  // Delete multiple users
  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users to delete");
      return;
    }

    const userNames = selectedUsers
      .map((id) => {
        const user = users.find((u) => u.id === id);
        return user ? user.name : "Unknown";
      })
      .join(", ");

    setConfirmModal({
      isOpen: true,
      action: 'deleteBulk',
      data: { userNames, count: selectedUsers.length },
    });
  };

  const executeBulkDelete = async () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    try {
      // Delete users one by one (you might want to create a bulk delete API endpoint)
      for (const userId of selectedUsers) {
        await deleteUserApi(userId);
      }
      toast.success(`${selectedUsers.length} users deleted successfully`);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting users:", error);
      toast.error("Failed to delete users");
    }
  };

  // Handle user selection
  const handleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Select all users
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  // Search and filter users
  useEffect(() => {
    let filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort users
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

    setFilteredUsers(filtered);
  }, [users, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <AdminPageLayout
        activeTab="users"
        setActiveTab={() => { }}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading users...</div>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      activeTab="users"
      setActiveTab={() => { }}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <AdminPageHeader
        icon={Users}
        title="Users Management"
        subtitle="Manage all registered users and their accounts"
        count={filteredUsers.length}
        countLabel="Total Users"
        actions={
          <>
            <div className="flex items-center space-x-3">
              {Array.isArray(selectedUsers) && selectedUsers.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Selected ({selectedUsers.length})</span>
                </button>
              )}
              <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border">
                Total: {filteredUsers.length} users
              </div>
            </div>
          </>
        }
      />


      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created_at">Date Joined</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
            </select>
            <button
              onClick={() =>
                setSortOrder(sortOrder === "asc" ? "desc" : "asc")
              }
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {
        filteredUsers.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.length === filteredUsers.length &&
                          filteredUsers.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
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
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 transition-colors ${selectedUsers.includes(user.id) ? "bg-blue-50" : ""
                        }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelection(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={
                                user.profile_picture_url ||
                                "http://localhost:8090/images/default-profile.png"
                              }
                              alt={user.name}
                              onError={(e) => {
                                e.target.src =
                                  "http://localhost:8090/images/default-profile.png";
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete User"
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
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? `No users match "${searchTerm}"`
                : "No users have registered yet."}
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
        )
      }
  {/* Confirmation Modal */ }
  < ConfirmationModal
isOpen = { confirmModal.isOpen }
onClose = {() => setConfirmModal({ isOpen: false, action: null, data: null })}
onConfirm = {() => {
  if (confirmModal.action === 'deleteSingle') executeDeleteUser();
  else if (confirmModal.action === 'deleteBulk') executeBulkDelete();
}}
title = "Confirm Deletion"
message = {
  confirmModal.action === 'deleteSingle'
    ? `Are you sure you want to delete user "${confirmModal.data?.userName}"? This action cannot be undone and will also remove all their places and reviews.`
    : confirmModal.action === 'deleteBulk'
      ? `Are you sure you want to delete ${confirmModal.data?.count} users (${confirmModal.data?.userNames})? This action cannot be undone.`
      : ''
}
confirmText = "Yes, Delete"
cancelText = "Cancel"
confirmButtonColor = "red"
  />
    </AdminPageLayout >
  );
};

export default AdminUsers;
