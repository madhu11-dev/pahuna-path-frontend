import React from 'react';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Reusable layout wrapper for admin pages
 * Includes sidebar, mobile menu toggle, and toast container
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.activeTab - Current active tab
 * @param {Function} props.setActiveTab - Function to set active tab
 * @param {boolean} props.isSidebarOpen - Sidebar open state
 * @param {Function} props.setIsSidebarOpen - Function to toggle sidebar
 */
const AdminPageLayout = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  isSidebarOpen, 
  setIsSidebarOpen 
}) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex-1 overflow-auto">
        {/* Mobile menu button */}
        <div className="md:hidden sticky top-0 bg-white shadow-sm z-30 p-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
};

export default AdminPageLayout;
