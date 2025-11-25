import { useEffect, useRef, useState } from 'react';
import { Star, User, MapPin, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { createPlace, getPlaces, getPlaceReviews, createPlaceReview } from "../../apis/Api";
import { ToastContainer, toast } from "react-toastify";
import UserSidebar from '../../components/user/UserSidebar';
import UserNavbar from '../../components/user/UserNavbar';
import PlaceDetailModal from '../../components/PlaceDetailModal';
import ReviewModal from '../../components/ReviewModal';
import { IMAGE_PLACEHOLDER, resolveImageUrl } from '../../utils/media';


const normalizePlace = (place) => {
    const rawImages = Array.isArray(place.images)
        ? place.images
        : place.images
            ? [place.images]
            : [];
    const images = rawImages.map(resolveImageUrl);

    return {
        id: place.id,
        name: place.place_name,
        description: place.description,
        averageRating: place.average_rating ?? 0,
        reviewCount: place.review_count ?? 0,
        mapLink: place.google_map_link || '#',
        location: place.place_name,
        author: place.user?.name || 'Anonymous',
        authorId: place.user?.id,
        authorProfilePicture: place.user?.profile_picture_url || 'http://localhost:8090/images/default-profile.png',
        image: images[0] || IMAGE_PLACEHOLDER,
        images,
        latitude: place.latitude,
        longitude: place.longitude,
        createdAt: place.created_at,
        reviews: place.reviews || [],
    };
};

const Feedpage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState({});
    const [selectedPlaceId, setSelectedPlaceId] = useState(null);
    const [selectedPlaceForReview, setSelectedPlaceForReview] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [newPost, setNewPost] = useState({
        place_name: '',
        description: '',
        google_map_link: '',
        imageFiles: []
    });
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchPlaces = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getPlaces();
                const fetched = (response?.data || []).map(normalizePlace);
                setPosts(fetched);
            } catch (err) {
                console.error("Failed to fetch places:", err);
                setError('Unable to load places. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlaces();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newPost.place_name || !newPost.description || !newPost.google_map_link) {
            toast.error('Please fill in all fields.');
            return;
        }

        if (!newPost.imageFiles.length) {
            toast.error('Please upload at least one image.');
            return;
        }

        const formData = new FormData();
        formData.append('place_name', newPost.place_name);
        formData.append('description', newPost.description);
        formData.append('google_map_link', newPost.google_map_link);
        newPost.imageFiles.forEach((file) => formData.append('images[]', file));

        try {
            const response = await createPlace(formData);
            const createdPlace = response?.data ?? response;

            if (createdPlace) {
                toast.success("New place successfully shared!");

                // Close modal and reset form
                setShowModal(false);
                setNewPost({
                    place_name: '',
                    description: '',
                    google_map_link: '',
                    imageFiles: []
                });
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }

                // Refresh the places list to show the new place
                try {
                    const response = await getPlaces();
                    const fetched = (response?.data || []).map(normalizePlace);
                    setPosts(fetched);
                } catch (err) {
                    console.error("Failed to refresh places:", err);
                }
            } else {
                toast.error("Failed to share place. Please try again.");
            }
        } catch (error) {
            console.error("Error while posting new place:", error);
            const responseMessage = error?.response?.data?.message;
            const validationMessage = Object.values(error?.response?.data?.errors ?? {})[0]?.[0];
            toast.error(responseMessage || validationMessage || "Something went wrong while posting the place.");
        }
    };

    const nextImage = (postId, totalImages) => {
        setCurrentImageIndex(prev => ({
            ...prev,
            [postId]: ((prev[postId] || 0) + 1) % totalImages
        }));
    };

    const prevImage = (postId, totalImages) => {
        setCurrentImageIndex(prev => ({
            ...prev,
            [postId]: ((prev[postId] || 0) - 1 + totalImages) % totalImages
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <UserNavbar />

            <div className="flex pt-20">

                <UserSidebar active="places" />

                <main className="ml-64 flex-1 px-8 py-6 max-w-4xl mx-auto">

                    {/* Add place button */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Share a new place</h3>
                            <p className="text-sm text-gray-500">Help other travelers discover your favorite spot.</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                        >
                            <User className="w-5 h-5" />
                            <span>Add Place</span>
                        </button>
                    </div>

                    