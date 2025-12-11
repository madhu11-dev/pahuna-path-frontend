import React from 'react';

/**
 * Reusable page header component for admin pages
 * @param {Object} props - Component props
 * @param {React.Component} props.icon - Icon component from lucide-react
 * @param {string} props.title - Main title text
 * @param {string} props.subtitle - Subtitle/description text
 * @param {number} props.count - Optional count to display
 * @param {string} props.countLabel - Label for the count
 * @param {React.ReactNode} props.actions - Optional action buttons/elements
 */
const AdminPageHeader = ({ icon: Icon, title, subtitle, count, countLabel, actions }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            {Icon && <Icon className="w-8 h-8 text-emerald-600 mr-3" />}
            {title}
          </h1>
          {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-4">
          {count !== undefined && (
            <div className="bg-emerald-50 px-4 py-2 rounded-lg">
              <span className="text-emerald-700 font-medium">
                {count} {countLabel}
              </span>
            </div>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
};

export default AdminPageHeader;
