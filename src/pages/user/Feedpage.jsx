import { Filter, Menu, Plus, TrendingUp, X } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { createPlace, getPlaces } from "../../apis/Api";
import PlaceDetailModal from "../../components/PlaceDetailModal";
import UserNavbar from "../../components/user/UserNavbar";
import UserSidebar from "../../components/user/UserSidebar";
import PlaceCard from "../../components/user/PlaceCard";
import AddPlaceModal from "../../components/user/AddPlaceModal";
import LocationSort from "../../components/user/LocationSort";
import SearchBar from "../../components/user/SearchBar";
import { IMAGE_PLACEHOLDER, resolveImageUrl } from "../../utils/media";
import { calculateDistance } from "../../utils/location";

// Constants
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
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocationSortActive, setIsLocationSortActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Ref to track previous posts reference
  const prevPostsRef = useRef(posts);

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

  const fetchPlaces = useCallback(async (showLoadingState = true, skipSortIfLocationActive = false) => {
    if (showLoadingState) {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await getPlaces();
      const fetched = (response?.data || []).map(place => normalizePlace(place, null));
      setPosts(fetched);
      setFilteredPosts(fetched); // Set initial filtered posts to all posts
    } catch (err) {
      console.error("Failed to fetch places:", err);
      setError("Unable to load places. Please try again later.");
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, []); // No dependencies - only fetch on mount

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Apply initial sorting after posts are fetched
  useEffect(() => {
    if (posts.length > 0 && !isLocationSortActive) {
      applyFiltersAndSort(posts, searchTerm, sortBy, sortOrder, false, null);
    }
  }, [posts.length]); // Only run when posts are first loaded

  const handleSearch = useCallback((search) => {
    setSearchTerm(search);
    applyFiltersAndSort(posts, search, sortBy, sortOrder, isLocationSortActive, userLocation);
  }, [posts, sortBy, sortOrder, isLocationSortActive, userLocation, applyFiltersAndSort]);

  const handleSort = useCallback((field, order) => {
    setIsLocationSortActive(false);
    setUserLocation(null);
    setSortBy(field);
    setSortOrder(order);
    applyFiltersAndSort(posts, searchTerm, field, order, false, null);
  }, [posts, searchTerm, applyFiltersAndSort]);

  const handleLocationSort = useCallback((location) => {
    console.log('Location sort triggered with:', location);
    
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
        images: post.images,
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
      return aDistance - bDistance;
    });
    
    // Apply search filter to sorted posts
    const filteredSortedPosts = sortedPosts.filter(post => 
      searchTerm ? post.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
    );
    
    console.log('FINAL SORTED ORDER (Nearest to Furthest):', 
      filteredSortedPosts.map((p, i) => `${i+1}. ${p.name}: ${p.distanceFromUser?.toFixed(2)}km`).join('\n')
    );
    
    // CRITICAL: Update ALL state together to prevent race conditions
    setUserLocation(location);
    setIsLocationSortActive(true);
    setSortBy('distance');
    setSortOrder('asc');
    setPosts(sortedPosts);
    setFilteredPosts(filteredSortedPosts);
  }, [posts, searchTerm]);

  // Single unified effect for all filtering and sorting
  useEffect(() => {
    const postsChanged = prevPostsRef.current !== posts;
    prevPostsRef.current = posts;
    
    if (posts.length === 0) {
      return;
    }
    
    // Skip if posts changed while location sort is active (means handleLocationSort just updated it)
    if (isLocationSortActive && postsChanged) {
      return;
    }
    
    if (isLocationSortActive) {
      // When location sort is active, only filter by search, don't re-sort
      const filtered = posts.filter(post => 
        searchTerm ? post.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
      );
      setFilteredPosts(filtered);
    } else {
      // Regular sorting when location sort is not active
      applyFiltersAndSort(posts, searchTerm, sortBy, sortOrder, false, null);
    }
  }, [posts, searchTerm, sortBy, sortOrder, isLocationSortActive, applyFiltersAndSort]);

  const handleSubmit = async (formData, selectedMapLocation) => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const hasGoogleMapsAPI = apiKey && apiKey.trim() !== '' && apiKey !== 'your_google_maps_api_key_here';
    const hasValidLocation = hasGoogleMapsAPI 
      ? selectedMapLocation 
      : formData.google_map_link.trim();
      
    if (!formData.place_name || !formData.description || !hasValidLocation) {
      const locationError = hasGoogleMapsAPI 
        ? "Please select a location on the map!" 
        : "Please provide a Google Maps link!";
      toast.error(`Please fill in all fields. ${locationError}`);
      return;
    }

    if (!formData.imageFiles.length) {
      toast.error("Please upload at least one image.");
      return;
    }

    setIsSubmitting(true);
    
    const submitData = new FormData();
    submitData.append("place_name", formData.place_name);
    submitData.append("description", formData.description);
    submitData.append("google_map_link", formData.google_map_link);
    
    if (selectedMapLocation) {
      submitData.append("latitude", selectedMapLocation.latitude.toString());
      submitData.append("longitude", selectedMapLocation.longitude.toString());
    }
    formData.imageFiles.forEach((file) => submitData.append("images[]", file));

    try {
      const response = await createPlace(submitData);
      const createdPlace = response?.data ?? response;

      if (createdPlace) {
        toast.success("New place successfully shared!");
        setShowModal(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />

      <div className="flex pt-20">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-24 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Sidebar - hidden on mobile by default, always visible on desktop */}
        <div className="hidden lg:block">
          <UserSidebar active="places" />
        </div>

        {/* Mobile Sidebar with overlay */}
        {sidebarOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="lg:hidden fixed top-0 left-0 h-full z-50 animate-slideIn">
              <div className="relative h-full">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-24 right-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50"
                >
                  <X className="w-5 h-5" />
                </button>
                <UserSidebar active="places" />
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Discover Places</h1>
              <p className="text-gray-600 text-sm sm:text-base">Explore amazing places shared by our community</p>
            </div>

            {/* Controls Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 sticky top-20 z-20">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Place</span>
                  <span className="sm:hidden">Add</span>
                </button>
                <div className="flex-1">
                  <SearchBar
                    onSearch={handleSearch}
                    placeholder="Search places..."
                    className="w-full"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                <div className="hidden lg:block">
                  <LocationSort
                    onSort={handleSort}
                    onLocationSort={handleLocationSort}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    isLocationActive={isLocationSortActive}
                  />
                </div>
              </div>
              
              {/* Mobile Filters */}
              {showFilters && (
                <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
                  <LocationSort
                    onSort={handleSort}
                    onLocationSort={handleLocationSort}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    isLocationActive={isLocationSortActive}
                  />
                </div>
              )}
            </div>

            {/* Stats Bar */}
            {!loading && posts.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 mb-6 border border-emerald-200">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-gray-900">
                      {filteredPosts.length} {filteredPosts.length === 1 ? 'Place' : 'Places'} Found
                    </span>
                  </div>
                  {isLocationSortActive && (
                    <span className="text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                      📍 Sorted by distance
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-slideDown">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
            )}

            {!loading && posts.length === 0 && !error && (
              <div className="p-12 bg-white border-2 border-dashed border-gray-300 rounded-xl text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No places yet</h3>
                  <p className="text-gray-500 mb-4">Be the first to share an amazing place!</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Add First Place
                  </button>
                </div>
              </div>
            )}

            {!loading && posts.length > 0 && filteredPosts.length === 0 && (
              <div className="p-8 bg-white border border-gray-200 rounded-xl text-center">
                <p className="text-gray-500">No places found matching your search criteria.</p>
              </div>
            )}

            {/* Places Grid */}
            {filteredPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <PlaceCard
                    key={post.id}
                    place={post}
                    onExplore={() => setSelectedPlaceId(post.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddPlaceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

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
