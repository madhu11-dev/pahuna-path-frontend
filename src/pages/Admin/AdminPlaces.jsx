import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Star, 
  ExternalLink, 
  Trash2,  
  Calendar,
  Merge,
  X,
  Check
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminSidebar from "../../components/AdminSidebar";
import { getAllPlacesApi, deletePlaceApi, mergePlacesApi } from "../../apis/Api";

const AdminPlaces = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [mergeMode, setMergeMode] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeOptions, setMergeOptions] = useState({
    selectedPlaceName: '',
    selectedDescription: '',
    selectedImages: [],
    selectedLocation: '',
    selectedLatitude: null,
    selectedLongitude: null
  });

  // Fetch places data
  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const response = await getAllPlacesApi();
      if (response.status) {
        setPlaces(response.places);
      } else {
        toast.error("Failed to load places");
      }
    } catch (error) {
      console.error("Error fetching places:", error);
      toast.error("Failed to load places");
    } finally {
      setLoading(false);
    }
  };

  // Delete place
  const handleDeletePlace = async (placeId, placeName) => {
    if (window.confirm(`Are you sure you want to delete "${placeName}"? This action cannot be undone and will also remove all reviews for this place.`)) {
      try {
        const response = await deletePlaceApi(placeId);
        if (response.status) {
          toast.success("Place deleted successfully");
          fetchPlaces(); // Refresh the list
        } else {
          toast.error(response.message || "Failed to delete place");
        }
      } catch (error) {
        console.error("Error deleting place:", error);
        toast.error("Failed to delete place");
      }
    }
  };

  // Handle place selection for merging
  const handlePlaceSelection = (placeId) => {
    if (selectedPlaces.includes(placeId)) {
      setSelectedPlaces(selectedPlaces.filter(id => id !== placeId));
    } else {
      setSelectedPlaces([...selectedPlaces, placeId]);
    }
  };

  // Start merge process
  const startMergeProcess = () => {
    if (selectedPlaces.length < 2) {
      toast.error("Please select at least 2 places to merge");
      return;
    }
    
    // Reset merge options and set defaults from first place
    const firstPlace = places.find(p => p.id === selectedPlaces[0]);
    if (firstPlace) {
      setMergeOptions({
        selectedPlaceName: firstPlace.place_name,
        selectedDescription: firstPlace.description,
        selectedImages: firstPlace.images || [],
        selectedLocation: firstPlace.google_map_link,
        selectedLatitude: firstPlace.latitude,
        selectedLongitude: firstPlace.longitude
      });
    }
    setShowMergeModal(true);
  };

  // Execute merge
  const executeMerge = async () => {
    // Validation
    if (!mergeOptions.selectedPlaceName.trim()) {
      toast.error("Please enter a place name");
      return;
    }
    if (!mergeOptions.selectedDescription.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (mergeOptions.selectedImages.length === 0) {
      toast.error("Please select at least one image");
      return;
    }
    if (!mergeOptions.selectedLocation.trim()) {
      toast.error("Please select a location");
      return;
    }

    try {
      // Get current admin user ID from localStorage or cookies
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
      };
      
      const adminId = getCookie("user_id") || localStorage.getItem("user_id");
      if (!adminId) {
        toast.error("Admin user not found");
        return;
      }

      const response = await mergePlacesApi({
        placeIds: selectedPlaces,
        mergeData: {
          selectedPlaceName: mergeOptions.selectedPlaceName,
          selectedDescription: mergeOptions.selectedDescription,
          selectedImages: mergeOptions.selectedImages,
          selectedLocation: mergeOptions.selectedLocation,
          selectedLatitude: mergeOptions.selectedLatitude,
          selectedLongitude: mergeOptions.selectedLongitude,
          userId: parseInt(adminId)
        }
      });

      if (response.status) {
        toast.success(`Places merged successfully into "${response.data.place_name}"`);
        setShowMergeModal(false);
        setMergeMode(false);
        setSelectedPlaces([]);
        fetchPlaces(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to merge places");
      }
    } catch (error) {
      console.error("Error merging places:", error);
      toast.error("Failed to merge places");
    }
  };

  // Open location in new tab
  const openLocation = (googleMapLink) => {
    if (googleMapLink) {
      window.open(googleMapLink, '_blank');
    } else {
      toast.error("No location link available");
    }
  };

  // Cancel merge mode
  const cancelMergeMode = () => {
    setMergeMode(false);
    setSelectedPlaces([]);
    setShowMergeModal(false);
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar 
          activeTab="places" 
          setActiveTab={() => {}} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading places...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar 
        activeTab="places" 
        setActiveTab={() => {}} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Places Management</h1>
            <p className="text-gray-600 mt-1">Manage all places, reviews, and merge duplicates</p>
          </div>
          
          <div className="flex space-x-3">
            {mergeMode ? (
              <>
                <button
                  onClick={cancelMergeMode}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={startMergeProcess}
                  disabled={selectedPlaces.length < 2}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Merge className="w-4 h-4" />
                  <span>Merge Selected ({selectedPlaces.length})</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setMergeMode(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Merge className="w-4 h-4" />
                <span>Merge Places</span>
              </button>
            )}
          </div>
        </div>

        {/* Places Grid */}
        {places.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <div 
                key={place.id} 
                className={`bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-200 ${
                  mergeMode 
                    ? selectedPlaces.includes(place.id) 
                      ? 'ring-4 ring-blue-500 transform scale-[1.02]' 
                      : 'hover:ring-2 hover:ring-gray-300'
                    : 'hover:shadow-xl'
                } ${mergeMode ? 'cursor-pointer' : ''}`}
                onClick={mergeMode ? () => handlePlaceSelection(place.id) : undefined}
              >
                {/* Selection indicator for merge mode */}
                {mergeMode && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPlaces.includes(place.id) 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {selectedPlaces.includes(place.id) && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                )}

                {/* Image Carousel */}
                {place.images && place.images.length > 0 ? (
                  <div className="relative h-48">
                    <img 
                      src={`${place.images[0]}`}
                      alt={place.place_name} 
                      className="w-full h-full object-cover" 
                    />
                    {place.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        +{place.images.length - 1} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                      {place.place_name}
                    </h3>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {place.description}
                  </p>

                  {/* User Info */}
                  {place.user && (
                    <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded-lg">
                      <img 
                        src={place.user.profile_picture_url} 
                        alt={place.user.name}
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = 'http://localhost:8090/images/default-profile.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {place.user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {place.user.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < Math.round(place.average_rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {place.average_rating.toFixed(1)} ({place.review_count} reviews)
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Calendar className="w-3 h-3 mr-1" />
                    Added: {new Date(place.created_at).toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  {!mergeMode && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openLocation(place.google_map_link)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Location</span>
                      </button>
                      <button
                        onClick={() => handleDeletePlace(place.id, place.place_name)}
                        className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl shadow-lg text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No places found</h3>
            <p className="text-gray-500">No places have been added yet.</p>
          </div>
        )}

        {/* Merge Modal */}
        {showMergeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Merge Places</h2>
                  <button 
                    onClick={() => setShowMergeModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Places to Merge */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Places to Merge</h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {selectedPlaces.map(placeId => {
                          const place = places.find(p => p.id === placeId);
                          return place ? (
                            <div key={placeId} className="border rounded-lg p-4 bg-gray-50">
                              <div className="flex items-start space-x-3">
                                {place.images && place.images[0] && (
                                  <img 
                                    src={`http://localhost:8090/storage/${place.images[0]}`}
                                    alt={place.place_name}
                                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{place.place_name}</p>
                                  <p className="text-sm text-gray-600" style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>{place.description}</p>
                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <span>{place.review_count} reviews</span>
                                    <span className="mx-2">•</span>
                                    <span>Added by {place.user?.name}</span>
                                  </div>
                                  {place.images && place.images.length > 1 && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      +{place.images.length - 1} more images
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Merge Configuration */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Configure New Merged Place</h3>
                    
                    {/* Place Name Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Place Name
                      </label>
                      <div className="space-y-2">
                        {selectedPlaces.map(placeId => {
                          const place = places.find(p => p.id === placeId);
                          return place ? (
                            <label key={placeId} className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name="placeName"
                                value={place.place_name}
                                checked={mergeOptions.selectedPlaceName === place.place_name}
                                onChange={(e) => setMergeOptions({
                                  ...mergeOptions,
                                  selectedPlaceName: e.target.value
                                })}
                                className="text-blue-600"
                              />
                              <span className="text-sm">{place.place_name}</span>
                            </label>
                          ) : null;
                        })}
                        <div className="mt-2">
                          <input
                            type="text"
                            value={mergeOptions.selectedPlaceName}
                            onChange={(e) => setMergeOptions({
                              ...mergeOptions,
                              selectedPlaceName: e.target.value
                            })}
                            placeholder="Or enter custom name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedPlaces.map(placeId => {
                          const place = places.find(p => p.id === placeId);
                          return place ? (
                            <label key={placeId} className="flex items-start space-x-3 p-2 border rounded">
                              <input
                                type="radio"
                                name="description"
                                value={place.description}
                                checked={mergeOptions.selectedDescription === place.description}
                                onChange={(e) => setMergeOptions({
                                  ...mergeOptions,
                                  selectedDescription: e.target.value
                                })}
                                className="text-blue-600 mt-1"
                              />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-700">{place.place_name}</p>
                                <p className="text-sm text-gray-600" style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>{place.description}</p>
                              </div>
                            </label>
                          ) : null;
                        })}
                      </div>
                      <div className="mt-2">
                        <textarea
                          value={mergeOptions.selectedDescription}
                          onChange={(e) => setMergeOptions({
                            ...mergeOptions,
                            selectedDescription: e.target.value
                          })}
                          placeholder="Or enter custom description"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>

                    {/* Location Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="space-y-2">
                        {selectedPlaces.map(placeId => {
                          const place = places.find(p => p.id === placeId);
                          return place ? (
                            <label key={placeId} className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name="location"
                                value={place.google_map_link}
                                checked={mergeOptions.selectedLocation === place.google_map_link}
                                onChange={(e) => {
                                  setMergeOptions({
                                    ...mergeOptions,
                                    selectedLocation: e.target.value,
                                    selectedLatitude: place.latitude,
                                    selectedLongitude: place.longitude
                                  });
                                }}
                                className="text-blue-600"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{place.place_name}'s location</p>
                                <p className="text-xs text-gray-500 truncate">{place.google_map_link}</p>
                              </div>
                            </label>
                          ) : null;
                        })}
                      </div>
                    </div>

                    {/* Images Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Images (select multiple)
                      </label>
                      <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                        {selectedPlaces.flatMap(placeId => {
                          const place = places.find(p => p.id === placeId);
                          return place?.images?.map((image, idx) => (
                            <div 
                              key={`${placeId}-${idx}`} 
                              className={`relative cursor-pointer border-2 rounded-lg overflow-hidden ${
                                mergeOptions.selectedImages.includes(image) 
                                  ? 'border-blue-500 ring-2 ring-blue-200' 
                                  : 'border-gray-200'
                              }`}
                              onClick={() => {
                                const newImages = mergeOptions.selectedImages.includes(image)
                                  ? mergeOptions.selectedImages.filter(img => img !== image)
                                  : [...mergeOptions.selectedImages, image];
                                setMergeOptions({
                                  ...mergeOptions,
                                  selectedImages: newImages
                                });
                              }}
                            >
                              <img 
                                src={`http://localhost:8090/storage/${image}`}
                                alt={`${place.place_name} image`}
                                className="w-full h-20 object-cover"
                              />
                              {mergeOptions.selectedImages.includes(image) && (
                                <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                  <Check className="w-3 h-3" />
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                                {place.place_name}
                              </div>
                            </div>
                          )) || [];
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Selected: {mergeOptions.selectedImages.length} image(s)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-6 mt-6 border-t">
                  <button
                    onClick={() => setShowMergeModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeMerge}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Merged Place
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <ToastContainer position="top-right" />
    </div>
  );
};

export default AdminPlaces;