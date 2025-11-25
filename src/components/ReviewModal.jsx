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