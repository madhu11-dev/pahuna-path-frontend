import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  MapPin,
  Star,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { createPlace, getPlaces } from "../../apis/Api";
import LocationSort from "../../components/LocationSort";
import PlaceDetailModal from "../../components/PlaceDetailModal";
import SearchBar from "../../components/SearchBar";
import GoogleMapsPicker from "../../components/GoogleMapsPicker";
import UserNavbar from "../../components/user/UserNavbar";
import UserSidebar from "../../components/user/UserSidebar";
import { IMAGE_PLACEHOLDER, resolveImageUrl } from "../../utils/media";
import { calculateDistance, formatDistance, logLocationAndDistances } from "../../utils/location";

// Constants
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_IMAGES = 10;
const DEFAULT_PROFILE_IMAGE = "/images/default-profile.png";

const normalizePlace = (place, userLocation = null) => {
  const rawImages = Array.isArray(place.images)
    ? place.images
    : place.images
    ? [place.images]
    : [];
  const images = rawImages.map(resolveImageUrl);

  // Calculate distance if user location and place coordinates are available
  let distanceFromUser = null;
  if (userLocation && place.latitude != null && place.longitude != null) {
    // Ensure coordinates are valid numbers
    const userLat = parseFloat(userLocation.latitude);
    const userLng = parseFloat(userLocation.longitude);
    const placeLat = parseFloat(place.latitude);
    const placeLng = parseFloat(place.longitude);
    
    if (!isNaN(userLat) && !isNaN(userLng) && !isNaN(placeLat) && !isNaN(placeLng)) {
      distanceFromUser = calculateDistance(userLat, userLng, placeLat, placeLng);
    }
  }

  return {
    id: place.id,
    name: place.place_name,
    description: place.description,
    averageRating: place.average_rating ?? 0,
    reviewCount: place.review_count ?? 0,
    mapLink: place.google_map_link || "#",
    location: place.place_name,
    author: place.user?.name || "Anonymous",
    authorId: place.user?.id,
    authorProfilePicture:
      place.user?.profile_picture_url || DEFAULT_PROFILE_IMAGE,
    image: images[0] || IMAGE_PLACEHOLDER,
    images,
    latitude: place.latitude,
    longitude: place.longitude,
    createdAt: place.created_at,
    reviews: place.reviews || [],
    isVerified: place.is_verified || false,
    distanceFromUser,
  };
};

const Feedpage = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocationSortActive, setIsLocationSortActive] = useState(false);
  const [newPost, setNewPost] = useState({
    place_name: "",
    description: "",
    google_map_link: "",
    imageFiles: [],
  });
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const fileInputRef = useRef(null);

  const fetchPlaces = useCallback(async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await getPlaces();
      const fetched = (response?.data || []).map(place => normalizePlace(place, userLocation));
      setPosts(fetched);
      applyFiltersAndSort(fetched, searchTerm, sortBy, sortOrder, isLocationSortActive, userLocation);
    } catch (err) {
      console.error("Failed to fetch places:", err);
      setError("Unable to load places. Please try again later.");
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const applyFiltersAndSort = useCallback((postsToFilter, search, sortField, order, locationSort = false, userLoc = null) => {
    let filtered = [...postsToFilter];

    if (search) {
      filtered = filtered.filter(post =>
        post.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let compareResult = 0;
      
      if (locationSort && userLoc && sortField === 'distance') {
        // Sort by distance when location sort is active
        const aDistance = typeof a.distanceFromUser === 'number' ? a.distanceFromUser : Infinity;
        const bDistance = typeof b.distanceFromUser === 'number' ? b.distanceFromUser : Infinity;
        
        // Ensure valid distances first
        if (aDistance === Infinity && bDistance === Infinity) {
          return 0; // Both invalid, maintain order
        }
        if (aDistance === Infinity) return 1; // a goes after b
        if (bDistance === Infinity) return -1; // a goes before b
        
        compareResult = aDistance - bDistance;
        return order === "asc" ? compareResult : -compareResult;
      } else {
        // Regular sorting
        switch (sortField) {
          case "name":
            compareResult = a.name.localeCompare(b.name);
            break;
          case "rating":
            compareResult = (a.averageRating || 0) - (b.averageRating || 0);
            break;
          case "newest":
            compareResult = new Date(b.createdAt) - new Date(a.createdAt);
            break;
          default:
            return 0;
        }
        
        return order === "asc" ? compareResult : -compareResult;
      }
    });

    setFilteredPosts(filtered);
  }, []);

  const handleSearch = useCallback((search) => {
    setSearchTerm(search);
    applyFiltersAndSort(posts, search, sortBy, sortOrder);
  }, [posts, sortBy, sortOrder, applyFiltersAndSort]);

  const handleSort = useCallback((field, order) => {
    setIsLocationSortActive(false);
    setUserLocation(null);
    setSortBy(field);
    setSortOrder(order);
    applyFiltersAndSort(posts, searchTerm, field, order, false, null);
  }, [posts, searchTerm, applyFiltersAndSort]);

  const handleLocationSort = useCallback((location) => {
    // Re-normalize places with new location and calculate distances
    const updatedPosts = posts.map(post => {
      const originalPlace = {
        id: post.id,
        place_name: post.name,
        description: post.description,
        average_rating: post.averageRating,
        review_count: post.reviewCount,
        google_map_link: post.mapLink,
        latitude: post.latitude,
        longitude: post.longitude,
        images: post.images, // Preserve the images array
        user: {
          id: post.authorId,
          name: post.author,
          profile_picture_url: post.authorProfilePicture,
        },
        created_at: post.createdAt,
        reviews: post.reviews,
        is_verified: post.isVerified,
      };
      return normalizePlace(originalPlace, location);
    });
    
    // Sort by distance immediately - NEAREST FIRST
    const sortedPosts = [...updatedPosts].sort((a, b) => {
      const aDistance = typeof a.distanceFromUser === 'number' ? a.distanceFromUser : Infinity;
      const bDistance = typeof b.distanceFromUser === 'number' ? b.distanceFromUser : Infinity;
      return aDistance - bDistance; // ascending order (nearest = smallest distance first)
    });
    
    // Apply search filter to sorted posts
    const filteredSortedPosts = sortedPosts.filter(post => 
      searchTerm ? post.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
    );
    
    console.log('✅ FINAL SORTED ORDER (Nearest to Furthest):', 
      filteredSortedPosts.map((p, i) => `${i+1}. ${p.name}: ${p.distanceFromUser?.toFixed(2)}km`).join('\n')
    );
    
    // Update all state - ORDER MATTERS!
    setPosts(sortedPosts);
    setFilteredPosts(filteredSortedPosts);
    setUserLocation(location);
    setIsLocationSortActive(true);
    setSortBy('distance');
    setSortOrder('asc');
  }, [posts, searchTerm]);

  useEffect(() => {
    // Only apply regular sorting when NOT in location sort mode
    if (!isLocationSortActive) {
      applyFiltersAndSort(posts, searchTerm, sortBy, sortOrder, false, null);
    } else {
      // In location sort mode, only filter by search term without re-sorting
      const filtered = posts.filter(post => 
        searchTerm ? post.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
      );
      setFilteredPosts(filtered);
    }
  }, [posts, searchTerm, sortBy, sortOrder, isLocationSortActive, applyFiltersAndSort]);

  // Cleanup object URLs when imageFiles change
  useEffect(() => {
    const urls = newPost.imageFiles.map((file) => URL.createObjectURL(file));
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPost.imageFiles]);

  const handleMapLocationSelect = (locationData) => {
    if (locationData) {
      setSelectedMapLocation(locationData);
      setNewPost(prevPost => ({
        ...prevPost,
        google_map_link: locationData.googleMapsUrl
      }));
    } else {
      setSelectedMapLocation(null);
      setNewPost(prevPost => ({
        ...prevPost,
        google_map_link: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check validation based on whether Google Maps API is available
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const hasGoogleMapsAPI = apiKey && apiKey.trim() !== '' && apiKey !== 'your_google_maps_api_key_here';
    const hasValidLocation = hasGoogleMapsAPI 
      ? selectedMapLocation 
      : newPost.google_map_link.trim();
      
    if (
      !newPost.place_name ||
      !newPost.description ||
      !hasValidLocation
    ) {
      const locationError = hasGoogleMapsAPI 
        ? "Please select a location on the map!" 
        : "Please provide a Google Maps link!";
      toast.error(`Please fill in all fields. ${locationError}`);
      return;
    }

    if (!newPost.imageFiles.length) {
      toast.error("Please upload at least one image.");
      return;
    }

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("place_name", newPost.place_name);
    formData.append("description", newPost.description);
    formData.append("google_map_link", newPost.google_map_link);
    
    // Add coordinates if available
    if (selectedMapLocation) {
      formData.append("latitude", selectedMapLocation.latitude.toString());
      formData.append("longitude", selectedMapLocation.longitude.toString());
    }
    newPost.imageFiles.forEach((file) => formData.append("images[]", file));

    try {
      const response = await createPlace(formData);
      const createdPlace = response?.data ?? response;

      if (createdPlace) {
        toast.success("New place successfully shared!");

        // Close modal and reset form
        setShowModal(false);
        setNewPost({
          place_name: "",
          description: "",
          google_map_link: "",
          imageFiles: [],
        });
        setSelectedMapLocation(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Refresh the places list to show the new place
        await fetchPlaces(false);
      } else {
        toast.error("Failed to share place. Please try again.");
      }
    } catch (error) {
      console.error("Error while posting new place:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to share place. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextImage = (postId, totalImages) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % totalImages,
    }));
  };

  const prevImage = (postId, totalImages) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + totalImages) % totalImages,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />

      <div className="flex pt-20">
        <UserSidebar active="places" />

        <main className="ml-64 flex-1 px-8 py-6 max-w-4xl mx-auto">
          {/* Header with Add Place, Search, and Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium whitespace-nowrap"
              >
                <User className="w-4 h-4" />
                <span>Add Place</span>
              </button>
              <div className="flex-1">
                <SearchBar
                  onSearch={handleSearch}
                  placeholder="Search places by name..."
                  className="w-full"
                />
              </div>
              <div className="w-full lg:w-auto">
                <LocationSort
                  onSort={handleSort}
                  onLocationSort={handleLocationSort}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  isLocationActive={isLocationSortActive}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Add place modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
              <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Share Your Favorite Place
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Place Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Place Name"
                      value={newPost.place_name}
                      onChange={(e) =>
                        setNewPost({ ...newPost, place_name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg p-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Description *
                    </label>
                    <textarea
                      placeholder="Share the story behind this place... Describe what makes it special, its history, your experience, or any tips for visitors."
                      value={newPost.description}
                      onChange={(e) =>
                        setNewPost({ ...newPost, description: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg p-3"
                      rows="4"
                      maxLength={MAX_DESCRIPTION_LENGTH}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {newPost.description.length}/{MAX_DESCRIPTION_LENGTH}{" "}
                      characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Upload Images * (Max {MAX_IMAGES} images)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      ref={fileInputRef}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > MAX_IMAGES) {
                          toast.error(`Maximum ${MAX_IMAGES} images allowed`);
                          return;
                        }
                        setNewPost({
                          ...newPost,
                          imageFiles: files,
                        });
                      }}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      required
                    />
                    {newPost.imageFiles.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-2">
                          {newPost.imageFiles.length} file
                          {newPost.imageFiles.length > 1 ? "s" : ""} selected
                        </p>
                        <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                          {newPost.imageFiles.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-16 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newFiles = newPost.imageFiles.filter(
                                    (_, i) => i !== index
                                  );
                                  setNewPost({
                                    ...newPost,
                                    imageFiles: newFiles,
                                  });
                                }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Location *
                    </label>
                    {(() => {
                      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
                      return apiKey && apiKey.trim() !== '' && apiKey !== 'your_google_maps_api_key_here';
                    })() ? (
                      <GoogleMapsPicker
                        onLocationSelect={handleMapLocationSelect}
                        className="w-full"
                      />
                    ) : (
                      <div>
                        <input
                          type="url"
                          placeholder="https://maps.google.com/..."
                          value={newPost.google_map_link}
                          onChange={(e) =>
                            setNewPost({
                              ...newPost,
                              google_map_link: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg p-3 mb-2"
                          required
                        />
                        <p className="text-xs text-amber-600">
                          📍 Google Maps integration not configured. Please paste the Google Maps link manually.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Debug: API Key = {process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Sharing..." : "Share Place"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Feed posts */}
          <div className="space-y-6">
            {/* loading */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            {loading && (
              <div className="p-4 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg">
                Loading places...
              </div>
            )}
            {!loading && posts.length === 0 && !error && (
              <div className="p-8 bg-white border border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                No places have been shared yet. Be the first!
              </div>
            )}
            {!loading && posts.length > 0 && filteredPosts.length === 0 && (
              <div className="p-8 bg-white border border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                No places found matching your search criteria.
              </div>
            )}

            {/* show list of posts */}
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                    <img
                      src={post.authorProfilePicture}
                      alt={`${post.author}'s profile`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = DEFAULT_PROFILE_IMAGE;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {post.author}
                      </h4>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-gray-800">{post.name}</h5>
                      {post.isVerified && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {post.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-2/3 relative">
                    {post.images && post.images.length > 0 ? (
                      <>
                        <img
                          src={post.images[currentImageIndex[post.id] || 0]}
                          alt={`${post.name} - Image ${
                            (currentImageIndex[post.id] || 0) + 1
                          }`}
                          className="w-full h-80 object-cover"
                        />
                        {post.images.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                prevImage(post.id, post.images.length)
                              }
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                nextImage(post.id, post.images.length)
                              }
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                              aria-label="Next image"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                              <ImageIcon className="w-4 h-4 text-white" />
                              <span className="text-white text-sm">
                                {(currentImageIndex[post.id] || 0) + 1} /{" "}
                                {post.images.length}
                              </span>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-80 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">
                          No image available
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="lg:w-1/3 p-6 flex flex-col">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {post.description}
                    </p>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => {
                            const filled =
                              i < Math.round(post.averageRating ?? 0);
                            return (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  filled
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            );
                          })}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {post.averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({post.reviewCount} review
                          {post.reviewCount !== 1 ? "s" : ""})
                        </span>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => setSelectedPlaceId(post.id)}
                          className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                        >
                          Explore
                        </button>
                        <a
                          href={post.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full"
                        >
                          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            View on Maps
                          </button>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>

      {/* Place Detail Modal */}
      <PlaceDetailModal
        placeId={selectedPlaceId}
        isOpen={!!selectedPlaceId}
        onClose={() => setSelectedPlaceId(null)}
      />

      <ToastContainer />
    </div>
  );
};

export default Feedpage;
