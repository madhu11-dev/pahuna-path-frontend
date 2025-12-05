import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { User, UtensilsCrossed, Star, X } from 'lucide-react';
import { newAccommodation, getAccommodations } from "../../apis/Api";
import AccommodationDetailModal from '../../components/AccommodationDetailModal';
import SearchBar from "../../components/SearchBar";
import FilterBar from "../../components/FilterBar";
import RangeSlider from "../../components/RangeSlider";
import { ToastContainer, toast } from "react-toastify";
import UserSidebar from '../../components/user/UserSidebar';
import UserNavbar from '../../components/user/UserNavbar';
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
    
    // Location-based filtering
    const [referenceLocation, setReferenceLocation] = useState(null);
    const [isLocationSortActive, setIsLocationSortActive] = useState(false);
    const [distanceRange, setDistanceRange] = useState(5); // Default 5km

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [newAccommodationData, setNewAccommodationData] = useState({
        name: '',
        type: 'restaurant',
        description: '',
        google_map_link: '',
        place_id: '2',
        imageFiles: []
    });
    const fileInputRef = useRef(null);

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
        // Refresh accommodations to get updated ratings
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newAccommodationData.name || !newAccommodationData.description || !newAccommodationData.google_map_link) {
            toast.error('Please fill in all required fields.');
            return;
        }

        if (!newAccommodationData.imageFiles.length) {
            toast.error('Please upload at least one image.');
            return;
        }

        const formData = new FormData();
        formData.append('name', newAccommodationData.name);
        formData.append('type', newAccommodationData.type);
        formData.append('description', newAccommodationData.description);
        formData.append('google_map_link', newAccommodationData.google_map_link);
        formData.append('place_id', newAccommodationData.place_id);
        newAccommodationData.imageFiles.forEach((file) => formData.append('images[]', file));

        try {
            const response = await newAccommodation(formData);
            const createdAccommodation = response?.data ?? response;

            if (createdAccommodation) {
                toast.success("New accommodation successfully added!");
                setShowModal(false);
                setNewAccommodationData({
                    name: '',
                    type: 'restaurant',
                    description: '',
                    google_map_link: '',
                    place_id: '2',
                    imageFiles: []
                });
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }

                // Refresh accommodation list
                setAccommodations((prev) => [normalizeAccommodation(createdAccommodation), ...prev]);
            } else {
                toast.error("Failed to add accommodation. Please try again.");
            }
        } catch (error) {
            console.error("Error while posting new accommodation:", error);
            const responseMessage = error?.response?.data?.message;
            const validationMessage = Object.values(error?.response?.data?.errors ?? {})[0]?.[0];
            toast.error(responseMessage || validationMessage || "Something went wrong while adding the accommodation.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <UserNavbar />

            <div className="flex pt-20">
                <UserSidebar active="accommodations" />

                <main className="ml-64 flex-1 px-8 py-6 max-w-4xl mx-auto">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Accommodations</h2>
                        <p className="text-gray-600">Discover restaurants and hotels near amazing places</p>
                    </div>

                    {/* Header with Search and Sort */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <SearchBar
                                    onSearch={handleSearch}
                                    placeholder="Search accommodations by name..."
                                    className="w-full"
                                />
                            </div>
                            <div className="w-full lg:w-auto">
                                <FilterBar
                                    onSort={handleSort}
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        
                        {/* Distance Range Filter - only show when location-based */}
                        {isLocationSortActive && referenceLocation && (
                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900 mb-1">
                                            Near: {referenceLocation.placeName}
                                        </p>
                                        <p className="text-xs text-blue-700">
                                            Showing accommodations within {distanceRange}km
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleClearLocationFilter}
                                        className="p-1 hover:bg-blue-100 rounded-full transition-colors"
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

                    {/* Modal removed - accommodation adding moved to staff only */}

                    {/* Accommodations list */}
                    <div className="space-y-6">
                        {accommodationsError && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{accommodationsError}</div>
                        )}

                        {accommodationsLoading && (
                            <div className="p-4 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg">
                                Loading accommodations...
                            </div>
                        )}

                        {!accommodationsLoading && accommodations.length === 0 && !accommodationsError && (
                            <div className="p-8 bg-white border border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                                No accommodations shared yet. Be the first to add one!
                            </div>
                        )}
                        {!accommodationsLoading && accommodations.length > 0 && filteredAccommodations.length === 0 && (
                            <div className="p-8 bg-white border border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                                No accommodations found matching your search criteria.
                            </div>
                        )}

                        {filteredAccommodations.map((item) => (
                            <article key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-3 flex-wrap">
                                            {item.name}
                                            <span className="text-xs font-medium uppercase px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                                                {item.type}
                                            </span>
                                        </h4>
                                    </div>
                                </div>

                                <div className="flex flex-col lg:flex-row">
                                    <div className="lg:w-2/3">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-80 object-cover"
                                        />
                                    </div>
                                    <div className="lg:w-1/3 p-6 flex flex-col">
                                        <p className="text-gray-700 leading-relaxed mb-4">{item.description}</p>

                                        <div className="mt-auto space-y-3">
                                            {/* Rating Display */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => {
                                                        const filled = i < Math.round(item.averageRating ?? 0);
                                                        return (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {item.averageRating ? item.averageRating.toFixed(1) : '0.0'}
                                                </span>
                                                <span className="text-sm text-gray-500">({item.reviewCount || 0} reviews)</span>
                                            </div>
                                            {/* Action Buttons */}
                                            <div className="space-y-2">
                                                <button
                                                    onClick={() => handleShowDetails(item.id)}
                                                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                                                >
                                                    Explore
                                                </button>
                                            </div>
                                            <a
                                                href={item.mapLink}
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
                            </article>
                        ))}
            </div>
        </main>
            </div >
    <ToastContainer />

{/* Accommodation Detail Modal */ }
<AccommodationDetailModal
    accommodationId={selectedAccommodationId}
    isOpen={showDetailModal}
    onClose={handleCloseModal}
/>
        </div >
    );
};

export default Accommodations;

