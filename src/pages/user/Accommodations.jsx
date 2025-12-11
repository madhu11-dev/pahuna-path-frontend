import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, Menu, TrendingUp, X } from 'lucide-react';
import { getAccommodations } from "../../apis/Api";
import AccommodationDetailModal from '../../components/AccommodationDetailModal';
import UserSidebar from '../../components/user/UserSidebar';
import UserNavbar from '../../components/user/UserNavbar';
import AccommodationCard from '../../components/user/AccommodationCard';
import SearchBar from "../../components/user/SearchBar";
import FilterBar from "../../components/user/FilterBar";
import RangeSlider from "../../components/user/RangeSlider";
import { ToastContainer, toast } from "react-toastify";
import { IMAGE_PLACEHOLDER, resolveImageUrl } from '../../utils/media';
import { calculateDistance, formatDistance } from '../../utils/location';

const normalizeAccommodation = (accommodation, referenceLocation = null) => {
    const rawImages = Array.isArray(accommodation.images)
        ? accommodation.images
        : accommodation.images
            ? [accommodation.images]
            : [];
    const images = rawImages.map(resolveImageUrl);

    let distance = null;
    if (referenceLocation && accommodation.latitude != null && accommodation.longitude != null) {
        // Ensure coordinates are valid numbers
        const refLat = parseFloat(referenceLocation.latitude);
        const refLng = parseFloat(referenceLocation.longitude);
        const accLat = parseFloat(accommodation.latitude);
        const accLng = parseFloat(accommodation.longitude);
        
        if (!isNaN(refLat) && !isNaN(refLng) && !isNaN(accLat) && !isNaN(accLng)) {
            distance = calculateDistance(refLat, refLng, accLat, accLng);
        }
    }

    return {
        id: accommodation.id,
        name: accommodation.name,
        type: accommodation.type,
        description: accommodation.description,
        averageRating: accommodation.average_rating ?? 0,
        reviewCount: accommodation.review_count ?? 0,
        mapLink: accommodation.google_map_link || '#',
        image: images[0] || IMAGE_PLACEHOLDER,
        images,
        latitude: accommodation.latitude,
        longitude: accommodation.longitude,
        distance,
        formattedDistance: distance ? formatDistance(distance) : null,
    };
};

const Accommodations = () => {
    const location = useLocation();
    const [accommodations, setAccommodations] = useState([]);
    const [filteredAccommodations, setFilteredAccommodations] = useState([]);
    const [accommodationsLoading, setAccommodationsLoading] = useState(true);
    const [accommodationsError, setAccommodationsError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [sortOrder, setSortOrder] = useState("desc");
    const [selectedAccommodationId, setSelectedAccommodationId] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [referenceLocation, setReferenceLocation] = useState(null);
    const [isLocationSortActive, setIsLocationSortActive] = useState(false);
    const [distanceRange, setDistanceRange] = useState(5);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Check for reference location from navigation state
    useEffect(() => {
        if (location.state?.referenceLocation) {
            const refLoc = location.state.referenceLocation;
            setReferenceLocation(refLoc);
            setIsLocationSortActive(true);
            setSortBy('distance');
            setSortOrder('asc');
            setDistanceRange(5); // Default to 5km when coming from a place
            toast.info(`Finding accommodations within ${5}km of ${refLoc.placeName}`);
        }
    }, [location.state]);

    // fetch accommodations
    useEffect(() => {
        const loadData = async () => {
            setAccommodationsLoading(true);
            try {
                const accommodationsResponse = await getAccommodations();
                const normalized = (accommodationsResponse?.data || accommodationsResponse || []).map((item) =>
                    normalizeAccommodation(item, referenceLocation)
                );

                setAccommodations(normalized);
                applyFiltersAndSort(normalized, searchTerm, sortBy, sortOrder);
                setAccommodationsError(null);
            } catch (err) {
                console.error("Failed to fetch accommodations:", err);
                setAccommodationsError('Unable to load accommodations right now.');
                toast.error('Unable to load accommodations. Please try again later.');
            } finally {
                setAccommodationsLoading(false);
            }
        };

        loadData();
    }, [referenceLocation]);

    const applyFiltersAndSort = (accommodationsToFilter, search, sortField, order, maxDistance = null) => {
        let filtered = [...accommodationsToFilter];

        // Filter by distance range if reference location is active
        if (isLocationSortActive && referenceLocation && maxDistance !== null) {
            filtered = filtered.filter(accommodation => 
                accommodation.distance !== null && accommodation.distance <= maxDistance
            );
        }

        if (search) {
            filtered = filtered.filter(accommodation =>
                accommodation.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        filtered.sort((a, b) => {
            let compareResult = 0;

            switch (sortField) {
                case "name":
                    compareResult = a.name.localeCompare(b.name);
                    break;
                case "rating":
                    compareResult = (a.averageRating || 0) - (b.averageRating || 0);
                    break;
                case "newest":
                    compareResult = b.id - a.id;
                    break;
                case "distance":
                    // Sort by distance, null distances go to end
                    if (a.distance === null && b.distance === null) return 0;
                    if (a.distance === null) return 1;
                    if (b.distance === null) return -1;
                    compareResult = a.distance - b.distance;
                    break;
                default:
                    return 0;
            }

            return order === "asc" ? compareResult : -compareResult;
        });

        setFilteredAccommodations(filtered);
    };

    const handleSearch = (search) => {
        setSearchTerm(search);
        const maxDist = isLocationSortActive ? distanceRange : null;
        applyFiltersAndSort(accommodations, search, sortBy, sortOrder, maxDist);
    };

    const handleSort = (field, order) => {
        setSortBy(field);
        setSortOrder(order);
        const maxDist = isLocationSortActive ? distanceRange : null;
        applyFiltersAndSort(accommodations, searchTerm, field, order, maxDist);
    };

    const handleDistanceRangeChange = (newRange) => {
        setDistanceRange(newRange);
        applyFiltersAndSort(accommodations, searchTerm, sortBy, sortOrder, newRange);
    };

    const handleClearLocationFilter = async () => {
        setReferenceLocation(null);
        setIsLocationSortActive(false);
        setDistanceRange(5);
        setSortBy('newest');
        setSortOrder('desc');
        
        try {
            // Fetch fresh data and normalize without location
            const accommodationsResponse = await getAccommodations();
            const normalized = (accommodationsResponse?.data || accommodationsResponse || []).map((item) =>
                normalizeAccommodation(item)
            );
            
            setAccommodations(normalized);
            applyFiltersAndSort(normalized, searchTerm, 'newest', 'desc', null);
            toast.success('Location filter cleared');
        } catch (error) {
            console.error('Error clearing location filter:', error);
            toast.error('Failed to clear location filter');
        }
    };

    useEffect(() => {
        const maxDist = isLocationSortActive ? distanceRange : null;
        applyFiltersAndSort(accommodations, searchTerm, sortBy, sortOrder, maxDist);
    }, [accommodations, searchTerm, sortBy, sortOrder, distanceRange, isLocationSortActive]);

    const handleShowDetails = (accommodationId) => {
        setSelectedAccommodationId(accommodationId);
        setShowDetailModal(true);
    };

    const handleCloseModal = () => {
        setShowDetailModal(false);
        setSelectedAccommodationId(null);
        const loadData = async () => {
            try {
                const accommodationsResponse = await getAccommodations();
                const normalized = (accommodationsResponse?.data || accommodationsResponse || []).map((item) =>
                    normalizeAccommodation(item)
                );
                setAccommodations(normalized);
                applyFiltersAndSort(normalized, searchTerm, sortBy, sortOrder);
            } catch (err) {
                console.error("Failed to refresh accommodations:", err);
            }
        };
        loadData();
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
                    <UserSidebar active="accommodations" />
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
                                <UserSidebar active="accommodations" />
                            </div>
                        </div>
                    </>
                )}

                {/* Main Content */}
                <main className="flex-1 w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Accommodations</h1>
                            <p className="text-gray-600 text-sm sm:text-base">Discover restaurants and hotels near amazing places</p>
                        </div>

                        {/* Controls Bar */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <SearchBar
                                        onSearch={handleSearch}
                                        placeholder="Search accommodations..."
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
                                    <FilterBar
                                        onSort={handleSort}
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                    />
                                </div>
                            </div>

                            {/* Mobile Filters */}
                            {showFilters && (
                                <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
                                    <FilterBar
                                        onSort={handleSort}
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                    />
                                </div>
                            )}
                            
                            {/* Distance Range Filter */}
                            {isLocationSortActive && referenceLocation && (
                                <div className="mt-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-sm font-semibold text-blue-900 mb-1">
                                                📍 Near: {referenceLocation.placeName}
                                            </p>
                                            <p className="text-xs text-blue-700">
                                                Showing accommodations within {distanceRange}km
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleClearLocationFilter}
                                            className="p-1.5 hover:bg-blue-100 rounded-full transition-colors"
                                            title="Clear location filter"
                                        >
                                            <X className="w-4 h-4 text-blue-700" />
                                        </button>
                                    </div>
                                    <RangeSlider
                                        value={distanceRange}
                                        onChange={handleDistanceRangeChange}
                                        min={1}
                                        max={100}
                                        step={1}
                                        label="Distance Range"
                                        unit="km"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Stats Bar */}
                        {!accommodationsLoading && accommodations.length > 0 && (
                            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 mb-6 border border-emerald-200">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                        <span className="font-semibold text-gray-900">
                                            {filteredAccommodations.length} {filteredAccommodations.length === 1 ? 'Accommodation' : 'Accommodations'} Found
                                        </span>
                                    </div>
                                    {isLocationSortActive && (
                                        <span className="text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                                            📍 Near {referenceLocation?.placeName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        {accommodationsError && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-slideDown">
                                {accommodationsError}
                            </div>
                        )}

                        {accommodationsLoading && (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                            </div>
                        )}

                        {!accommodationsLoading && accommodations.length === 0 && !accommodationsError && (
                            <div className="p-12 bg-white border-2 border-dashed border-gray-300 rounded-xl text-center">
                                <div className="max-w-md mx-auto">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <TrendingUp className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No accommodations yet</h3>
                                    <p className="text-gray-500">Check back later for restaurants and hotels!</p>
                                </div>
                            </div>
                        )}

                        {!accommodationsLoading && accommodations.length > 0 && filteredAccommodations.length === 0 && (
                            <div className="p-8 bg-white border border-gray-200 rounded-xl text-center">
                                <p className="text-gray-500">No accommodations found matching your criteria.</p>
                            </div>
                        )}

                        {/* Accommodations Grid */}
                        {filteredAccommodations.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredAccommodations.map((item) => (
                                    <AccommodationCard
                                        key={item.id}
                                        accommodation={item}
                                        onExplore={() => handleShowDetails(item.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <ToastContainer />

            {/* Accommodation Detail Modal */}
            <AccommodationDetailModal
                accommodationId={selectedAccommodationId}
                isOpen={showDetailModal}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default Accommodations;

