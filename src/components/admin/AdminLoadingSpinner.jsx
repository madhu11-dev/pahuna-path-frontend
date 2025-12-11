import React from 'react';
import AdminSidebar from './AdminSidebar';

/**
 * Reusable loading spinner component for admin pages
 * Shows a centered loading spinner with sidebar
 */
const AdminLoadingSpinner = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) => {
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
};

export default AdminLoadingSpinner;
