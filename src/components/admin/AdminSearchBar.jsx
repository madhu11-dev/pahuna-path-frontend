import React from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

/**
 * Reusable search and filter bar for admin pages
 * @param {Object} props - Component props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Callback when search term changes
 * @param {string} props.searchPlaceholder - Placeholder text for search input
 * @param {string} props.sortBy - Current sort field
 * @param {Function} props.onSortChange - Callback when sort field changes
 * @param {Array} props.sortOptions - Array of {value, label} for sort dropdown
 * @param {string} props.sortOrder - Current sort order ('asc' or 'desc')
 * @param {Function} props.onSortOrderToggle - Callback to toggle sort order
 * @param {React.ReactNode} props.additionalFilters - Optional additional filter elements
 * @param {React.ReactNode} props.actions - Optional action buttons
 */
const AdminSearchBar = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  sortBy,
  onSortChange,
  sortOptions = [],
  sortOrder = 'desc',
  onSortOrderToggle,
  additionalFilters,
  actions
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Sort Options */}
        {sortOptions.length > 0 && (
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={onSortOrderToggle}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-5 h-5 text-gray-600" />
              ) : (
                <SortDesc className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        )}

        {/* Additional Filters */}
        {additionalFilters}

        {/* Actions */}
        {actions}
      </div>
    </div>
  );
};

export default AdminSearchBar;
