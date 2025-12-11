import { AlertCircle, Loader2, MapPin, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCurrentLocation, getHighPrecisionLocation } from "../../utils/location";

const LocationButton = ({ onLocationUpdate, isActive, className = "" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setHasPermission(false);
    }
  }, []);

  const handleLocationRequest = async (useHighPrecision = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const location = useHighPrecision 
        ? await getHighPrecisionLocation() 
        : await getCurrentLocation();
      
      setHasPermission(true);
      onLocationUpdate(location);
      
      const accuracyText = location.accuracy 
        ? ` (±${Math.round(location.accuracy)}m accuracy)`
        : '';
      
      toast.success(`Location detected successfully!${accuracyText}`);
      
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

  const [longPressTimer, setLongPressTimer] = useState(null);
  const [isLongPress, setIsLongPress] = useState(false);
  
  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setIsLongPress(true);
      handleLocationRequest(true); // High precision mode
    }, 1000); // 1 second long press
    setLongPressTimer(timer);
  };
  
  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // Reset long press flag after a short delay
    setTimeout(() => setIsLongPress(false), 100);
  };
  
  const handleClick = () => {
    if (isLongPress) return; // Prevent click if long press was triggered
    handleLocationRequest(false); // Regular precision mode
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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
          ? "Currently sorting by distance (Hold for high-precision mode)"
          : "Click for location sorting • Hold for high-precision location"
      }
    >
      {buttonContent()}
    </button>
  );
};

export default LocationButton;
