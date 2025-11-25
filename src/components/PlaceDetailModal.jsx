import React, { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, User, MessageSquare, X } from 'lucide-react';
import { getPlace, getPlaceReviews, createPlaceReview } from '../apis/Api';
import { resolveImageUrl, IMAGE_PLACEHOLDER } from '../utils/media';
import { toast } from 'react-toastify';

const PlaceDetailModal = ({ placeId, isOpen, onClose }) => {
    const [place, setPlace] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        if (isOpen && placeId) {
            fetchPlaceDetails();
        }
    }, [isOpen, placeId]);

    const fetchPlaceDetails = async () => {
        setLoading(true);
        try {
            const [placeResponse, reviewsResponse] = await Promise.all([
                getPlace(placeId),
                getPlaceReviews(placeId)
            ]);
            
            const placeData = placeResponse?.data ?? placeResponse;
            const reviewsData = reviewsResponse?.data ?? reviewsResponse;
            
            setPlace(placeData);
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        } catch (error) {
            console.error('Error fetching place details:', error);
            toast.error('Failed to load place details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!reviewForm.rating) {
            toast.error('Please provide a rating');
            return;
        }

        try {
            const response = await createPlaceReview(placeId, reviewForm);
            const newReview = response?.data ?? response;
            
            setReviews(prev => [newReview, ...prev]);
            setReviewForm({ rating: 5, comment: '' });
            setShowReviewForm(false);
            toast.success('Review added successfully!');
            
            // Refresh place details to get updated average rating
            fetchPlaceDetails();
        } catch (error) {
            console.error('Error submitting review:', error);
            const message = error?.response?.data?.message || 'Failed to submit review';
            toast.error(message);
        }
    };

    if (!isOpen) return null;

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="text-center mt-4 text-gray-600">Loading place details...</p>
                </div>
            </div>
        );
    }

    if (!place) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-xl">
                    <p className="text-center text-gray-600">Place not found</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const images = Array.isArray(place.images) ? place.images.map(resolveImageUrl) : [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{place.place_name}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Images Section */}
                    {images.length > 0 && (
                        <div className="mb-6">
                            <div className="relative">
                                <img
                                    src={images[currentImageIndex] || IMAGE_PLACEHOLDER}
                                    alt={`${place.place_name} - Image ${currentImageIndex + 1}`}
                                    className="w-full h-96 object-cover rounded-lg"
                                />
                                {images.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                        {images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`w-3 h-3 rounded-full transition-colors ${
                                                    index === currentImageIndex
                                                        ? 'bg-white'
                                                        : 'bg-white bg-opacity-50'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            {images.length > 1 && (
                                <div className="flex gap-2 mt-4 overflow-x-auto">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                                                index === currentImageIndex
                                                    ? 'border-emerald-500'
                                                    : 'border-gray-200'
                                            }`}
                                        >
                                            <
                                                src={image}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Place Info */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Description</h3>
                            <p className="text-gray-700 leading-relaxed">{place.description}</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700">Shared by {place.user?.name || 'Anonymous'}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700">
                                    Added {new Date(place.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-gray-500" />
                                <a
                                    href={place.google_map_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:text-emerald-700 underline"
                                >
                                    View on Google Maps
                                </a>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${
                                                i < Math.round(place.average_rating || 0)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="font-semibold">
                                    {(place.average_rating || 0).toFixed(1)}
                                </span>
                                <span className="text-gray-500 text-sm">
                                    ({place.review_count || 0} review{place.review_count !== 1 ? 's' : ''})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Reviews ({reviews.length})
                            </h3>
                            <button
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                Add Review
                            </button>
                        </div>

                        {/* Review Form */}
                        {showReviewForm && (
                            <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rating *
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-6 h-6 ${
                                                        star <= reviewForm.rating
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300'
                                                    } hover:text-yellow-400 transition-colors`}
                                                />
                                            </button>
                                        ))}
                                        <span className="ml-2 text-sm text-gray-600">
                                            {reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Comment (Optional)
                                    </label>
                                    <textarea
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        placeholder="Share your experience about this place..."
                                        className="w-full border border-gray-300 rounded-lg p-3"
                                        rows="3"
                                        maxLength="1000"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {reviewForm.comment.length}/1000 characters
                                    </p>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                    >
                                        Submit Review
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowReviewForm(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Reviews List */}
                        <div className="space-y-4">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {review.user?.name || 'Anonymous'}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${
                                                                        i < review.rating
                                                                            ? 'text-yellow-400 fill-yellow-400'
                                                                            : 'text-gray-300'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(review.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-gray-700 ml-11">{review.comment}</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    No reviews yet. Be the first to review this place!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceDetailModal;