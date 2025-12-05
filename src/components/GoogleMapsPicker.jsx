import { MapPin, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const GoogleMapsPicker = ({
  onLocationSelect,
  initialLocation = null,
  className = "",
}) => {
  const mapRef = useRef(null);
  const searchBoxRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Check if Google Maps API is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    if (!checkGoogleMaps()) {
      // Load Google Maps API if not already loaded
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (checkGoogleMaps()) {
          setIsLoaded(true);
        } else {
          setError("Failed to load Google Maps API");
        }
      };
      script.onerror = () => {
        setError("Failed to load Google Maps API");
      };
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    try {
      const defaultCenter = initialLocation || { lat: 27.7172, lng: 85.324 }; // Kathmandu default

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        mapTypeId: "roadmap",
      });

      const markerInstance = new window.google.maps.Marker({
        map: mapInstance,
        draggable: true,
        position: defaultCenter,
      });

      // Handle marker drag
      markerInstance.addListener("dragend", () => {
        const position = markerInstance.getPosition();
        const location = {
          lat: position.lat(),
          lng: position.lng(),
          name: selectedPlace?.name || "Selected Location",
        };
        handleLocationSelect(location);
      });

      // Handle map click
      mapInstance.addListener("click", (event) => {
        const clickedLocation = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        markerInstance.setPosition(clickedLocation);

        // Reverse geocode to get place name
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: clickedLocation }, (results, status) => {
          if (status === "OK" && results[0]) {
            const location = {
              lat: clickedLocation.lat,
              lng: clickedLocation.lng,
              name: results[0].formatted_address,
            };
            handleLocationSelect(location);
          } else {
            const location = {
              lat: clickedLocation.lat,
              lng: clickedLocation.lng,
              name: "Selected Location",
            };
            handleLocationSelect(location);
          }
        });
      });

      setMap(mapInstance);
      setMarker(markerInstance);

      // Set initial location if provided
      if (initialLocation) {
        handleLocationSelect({
          lat: initialLocation.lat,
          lng: initialLocation.lng,
          name: initialLocation.name || "Initial Location",
        });
      }
    } catch (err) {
      console.error("Error initializing Google Maps:", err);
      setError("Failed to initialize map");
    }
  }, [isLoaded, initialLocation]);

  // Initialize search box
  useEffect(() => {
    if (!isLoaded || !map || !searchBoxRef.current) return;

    try {
      const searchBox = new window.google.maps.places.SearchBox(
        searchBoxRef.current
      );

      // Bias the SearchBox results towards current map's viewport
      map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
      });

      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;

        const place = places[0];
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          name: place.name || place.formatted_address,
        };

        // Update map and marker
        map.setCenter(location);
        map.setZoom(15);
        marker.setPosition(location);

        handleLocationSelect(location);
        setSearchValue(location.name);
      });
    } catch (err) {
      console.error("Error initializing search box:", err);
    }
  }, [isLoaded, map, marker]);

  const handleLocationSelect = useCallback(
    (location) => {
      setSelectedPlace(location);

      // Generate Google Maps URL
      const googleMapsUrl = `https://www.google.com/maps/place/${location.lat},${location.lng}/@${location.lat},${location.lng},15z`;

      // Call parent callback with location data
      onLocationSelect({
        name: location.name,
        latitude: location.lat,
        longitude: location.lng,
        googleMapsUrl: googleMapsUrl,
      });
    },
    [onLocationSelect]
  );

  const clearSelection = () => {
    setSelectedPlace(null);
    setSearchValue("");
    onLocationSelect(null);
  };

  if (error) {
    return (
      <div
        className={`border-2 border-dashed border-red-300 rounded-lg p-6 text-center ${className}`}
      >
        <MapPin className="w-12 h-12 text-red-400 mx-auto mb-2" />
        <p className="text-red-600 font-medium">Failed to load Google Maps</p>
        <p className="text-sm text-red-500 mt-1">{error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${className}`}
      >
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2 animate-pulse" />
        <p className="text-gray-600">Loading Google Maps...</p>
      </div>
    );
  }

  return (
    <div
      className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}
    >
      {/* Search Box */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            ref={searchBoxRef}
            type="text"
            placeholder="Search for a place..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-64"
        style={{ minHeight: "250px" }}
      />

      {/* Selected Location Info */}
      {selectedPlace && (
        <div className="p-3 bg-emerald-50 border-t border-emerald-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-emerald-800">
                  Selected Location
                </span>
              </div>
              <p className="text-sm text-emerald-700 mb-1">
                {selectedPlace.name}
              </p>
              <p className="text-xs text-emerald-600">
                {selectedPlace.lat.toFixed(6)}, {selectedPlace.lng.toFixed(6)}
              </p>
            </div>
            <button
              onClick={clearSelection}
              className="text-emerald-600 hover:text-emerald-800 p-1"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          Search for a place or click on the map to select a location
        </p>
      </div>
    </div>
  );
};

export default GoogleMapsPicker;
