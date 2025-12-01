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
      
    </div>
  );
};

export default FilterBar;