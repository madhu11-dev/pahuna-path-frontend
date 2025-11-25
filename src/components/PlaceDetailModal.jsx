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
