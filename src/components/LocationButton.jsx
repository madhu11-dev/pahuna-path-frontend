import { AlertCircle, Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCurrentLocation } from "../utils/location";

const LocationButton = ({ onLocationUpdate, isActive, className = "" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setHasPermission(false);
    }
  }, []);

  const handleLocationRequest = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      setHasPermission(true);
      onLocationUpdate(location);
      toast.success("Location detected successfully!");
    } catch (error) {
      console.error("Location error:", error);
      setHasPermission(false);

      let errorMessage = error.message;
      if (error.message.includes("denied")) {
        errorMessage = "Please allow location access to sort by distance";
      } else if (error.message.includes("unavailable")) {
        errorMessage = "Unable to detect your location. Please try again.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Location request timed out. Please try again.";
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Detecting...</span>
        </>
      );
    }

    if (hasPermission === false) {
      return (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Location Unavailable</span>
        </>
      );
    }

    return (
      <>
        <MapPin className={`w-4 h-4 ${isActive ? "text-emerald-600" : ""}`} />
        <span>Nearest to Me</span>
      </>
    );
  };

  return (
    <button
      onClick={handleLocationRequest}
      disabled={isLoading || hasPermission === false}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
        transition-colors duration-200
        ${
          isActive
            ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        }
        ${
          isLoading
            ? "opacity-75 cursor-not-allowed"
            : hasPermission === false
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-sm"
        }
        ${className}
      `}
      title={
        hasPermission === false
          ? "Geolocation is not available"
          : isActive
          ? "Currently sorting by distance"
          : "Click to sort places by distance from your location"
      }
    >
      {buttonContent()}
    </button>
  );
};

export default LocationButton;
