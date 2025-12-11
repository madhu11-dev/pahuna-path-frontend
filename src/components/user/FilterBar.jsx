import { ChevronDown, Star } from "lucide-react";
import { useState } from "react";

const FilterBar = ({ onSort, sortBy, sortOrder, className = "" }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const sortOptions = [
        { value: "name", label: "Name (A-Z)", icon: null },
        { value: "rating", label: "Rating", icon: Star },
        { value: "newest", label: "Newest ", icon: null },
    ];  const handleSortChange = (value) => {
    if (value === sortBy) {
      onSort(value, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSort(value, value === "rating" ? "desc" : "asc");
    }
    setIsDropdownOpen(false);
  };

  const getCurrentSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    if (!option) return "Sort by";
    
    const orderText = sortOrder === "desc" ? "↓" : "↑";
    return `${option.label} ${orderText}`;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="inline-flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
      >
        <span>{getCurrentSortLabel()}</span>
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="py-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${
                  sortBy === option.value ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                }`}
              >
                {option.icon && <option.icon className="w-4 h-4 mr-2" />}
                {option.label}
                {sortBy === option.value && (
                  <span className="ml-auto text-emerald-600">
                    {sortOrder === "desc" ? "↓" : "↑"}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;