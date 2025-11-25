import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, X, Send, Heart } from 'lucide-react';
import { getPlaceReviews, createPlaceReview } from '../apis/Api';
import { toast } from 'react-toastify';

const ReviewModal = ({ placeId, placeName, isOpen, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && placeId) {
            fetchReviews();
        }
    }, [isOpen, placeId]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await getPlaceReviews(placeId);
            const reviewsData = response?.data ?? response;
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!newReview.rating) {
            toast.error('Please provide a rating');
            return;
        }

        setSubmitting(true);
        try {
            const response = await createPlaceReview(placeId, newReview);
            const createdReview = response?.data ?? response;
            
            setReviews(prev => [createdReview, ...prev]);
            setNewReview({ rating: 5, comment: '' });
            toast.success('Review added successfully!');
        } catch (error) {
            console.error('Error submitting review:', error);
            const message = error?.response?.data?.message || 'Failed to submit review';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Reviews</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Place name */}
                <div className="px-4 py-2 bg-gray-50 border-b">
                    <p className="text-sm font-medium text-gray-900">{placeName}</p>
                </div>

                {/* Review form */}
                <div className="p-4 border-b bg-gray-50">
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        className={`w-6 h-6 ${
                                            star <= newReview.rating
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                        } hover:text-yellow-400 transition-colors`}
                                    />
                                </button>
                            ))}
                            <span className="text-sm text-gray-600 ml-2">
                                {newReview.rating} star{newReview.rating !== 1 ? 's' : ''}
                            </span>
                        </div>
                        
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                placeholder="Add a comment..."
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                maxLength="500"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Reviews list */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="divide-y">
                            {reviews.map((review) => (
                                <div key={review.id} className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-xs font-medium">
                                                {(review.user?.name || 'A')[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm">
                                                    {review.user?.name || 'Anonymous'}
                                                </span>
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3 h-3 ${
                                                                i < review.rating
                                                                    ? 'text-yellow-400 fill-yellow-400'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {review.comment && (
                                                <p className="text-sm text-gray-700">{review.comment}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                            <MessageSquare className="w-12 h-12 mb-2" />
                            <p className="text-center">No reviews yet</p>
                            <p className="text-sm text-center">Be the first to share your experience!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;