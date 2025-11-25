import { useEffect, useRef, useState } from 'react';
import { Star, User, MapPin, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { createPlace, getPlaces, getPlaceReviews, createPlaceReview } from "../../apis/Api";
import { ToastContainer, toast } from "react-toastify";
import UserSidebar from '../../components/user/UserSidebar';
import UserNavbar from '../../components/user/UserNavbar';
import PlaceDetailModal from '../../components/PlaceDetailModal';
import ReviewModal from '../../components/ReviewModal';
import { IMAGE_PLACEHOLDER, resolveImageUrl } from '../../utils/media';
