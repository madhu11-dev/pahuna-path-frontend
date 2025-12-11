import { useState } from "react";
import FilterBar from "./FilterBar";
import LocationButton from "./LocationButton";

const LocationSort = ({
  onSort,
  onLocationSort,
  sortBy,
  sortOrder,
  isLocationActive,
  className = "",
}) => {
  const [userLocation, setUserLocation] = useState(null);

  const handleLocationUpdate = (location) => {
    setUserLocation(location);
    onLocationSort(location);
  };

  const handleRegularSort = (field, order) => {
    // If switching to regular sort, disable location sort
    onSort(field, order);
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      {/* Regular Filter Bar */}
      <div className="flex-1">
        <FilterBar
          onSort={handleRegularSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          className="w-full"
        />
      </div>

      {/* Location Sort Button */}
      <div className="w-full sm:w-auto">
        <LocationButton
          onLocationUpdate={handleLocationUpdate}
          isActive={isLocationActive}
          className="w-full sm:w-auto whitespace-nowrap"
        />
      </div>
    </div>
  );
};

export default LocationSort;
