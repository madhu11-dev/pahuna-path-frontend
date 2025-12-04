import React, { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, User, MessageSquare, X, Building2 } from 'lucide-react';
import { getAccommodation, getAccommodationReviews, createAccommodationReview } from '../apis/Api';
import { resolveImageUrl, IMAGE_PLACEHOLDER } from '../utils/media';
import { toast } from 'react-toastify';

const AccommodationDetailModal = ({ accommodationId, isOpen, onClose }) => {
    const [accommodation, setAccommodation] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        if (isOpen && accommodationId) {
            fetchAccommodationDetails();
        }
    }, [isOpen, accommodationId]);

    const fetchAccommodationDetails = async () => {
        setLoading(true);
        try {
            const [accommodationResponse, reviewsResponse] = await Promise.all([
                getAccommodation(accommodationId),
                getAccommodationReviews(accommodationId)
            ]);
            
            const accommodationData = accommodationResponse?.data ?? accommodationResponse;
            const reviewsData = reviewsResponse?.data ?? reviewsResponse;
            
            setAccommodation(accommodationData);
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        } catch (error) {
            console.error('Error fetching accommodation details:', error);
            toast.error('Failed to load accommodation details');
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
            const response = await createAccommodationReview(accommodationId, reviewForm);
            const newReview = response?.data ?? response;
            
            setReviews(prev => [newReview, ...prev]);
            setReviewForm({ rating: 5, comment: '' });
            setShowReviewForm(false);
            toast.success('Review added successfully!');
            
            // Refresh accommodation details to get updated average rating
            fetchAccommodationDetails();
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
                    <p className="text-center mt-4 text-gray-600">Loading accommodation details...</p>
                </div>
            </div>
        );
    }

    if (!accommodation) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-xl">
                    <p className="text-center text-gray-600">Accommodation not found</p>
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

    const images = Array.isArray(accommodation.images) ? accommodation.images.map(resolveImageUrl) : [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{accommodation.name}</h2>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {accommodation.type}
                                </span>
                                <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="font-medium text-gray-900">
                                        {accommodation.average_rating ? accommodation.average_rating.toFixed(1) : '0.0'}
                                    </span>
                                    <span className="text-gray-500">({accommodation.review_count || 0} reviews)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    {/* Image Gallery */}
                    {images.length > 0 && (
                        <div className="relative h-64 bg-gray-100">
                            <img
                                src={images[currentImageIndex] || IMAGE_PLACEHOLDER}
                                alt={accommodation.name}
                                className="w-full h-full object-cover"
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => 
                                            prev === 0 ? images.length - 1 : prev - 1
                                        )}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                                    >
                                        ←
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => 
                                            prev === images.length - 1 ? 0 : prev + 1
                                        )}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                                    >
                                        →
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                        {images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`w-2 h-2 rounded-full ${
                                                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="p-6 space-y-6">
                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-700 leading-relaxed">{accommodation.description}</p>
                        </div>

                        {/* Map Link */}
                        {accommodation.google_map_link && (
                            <div>
                                <a
                                    href={accommodation.google_map_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium"
                                >
                                    <MapPin className="w-4 h-4" />
                                    <span>View on Google Maps</span>
                                </a>
                            </div>
                        )}

                        {/* Reviews Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                    <MessageSquare className="w-5 h-5" />
                                    <span>Reviews ({reviews.length})</span>
                                </h3>
                                <button
                                    onClick={() => setShowReviewForm(true)}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                                >
                                    Write a Review
                                </button>
                            </div>

                            {/* Review Form */}
                            {showReviewForm && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Rating
                                            </label>
                                            <div className="flex space-x-1">
                                                {[1, 2, 3, 4, 5].map((rating) => (
                                                    <button
                                                        key={rating}
                                                        type="button"
                                                        onClick={() => setReviewForm(prev => ({ ...prev, rating }))}
                                                        className={`p-1 ${
                                                            rating <= reviewForm.rating 
                                                                ? 'text-yellow-400' 
                                                                : 'text-gray-300'
                                                        } hover:text-yellow-400 transition-colors`}
                                                    >
                                                        <Star className="w-6 h-6 fill-current" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Comment (optional)
                                            </label>
                                            <textarea
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                placeholder="Share your experience..."
                                                maxLength={1000}
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowReviewForm(false);
                                                    setReviewForm({ rating: 5, comment: '' });
                                                }}
                                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                            >
                                                Submit Review
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Reviews List */}
                            <div className="space-y-4">
                                {reviews.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">
                                        No reviews yet. Be the first to review this accommodation!
                                    </p>
                                ) : (
                                    reviews.map((review) => (
                                        <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <User className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</p>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="flex space-x-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`w-4 h-4 ${
                                                                            star <= review.rating
                                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                                : 'text-gray-300'
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-gray-700 mt-2">{review.comment}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccommodationDetailModal;