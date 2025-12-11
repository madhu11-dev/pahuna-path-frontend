import { CheckCircle, ChevronLeft, ChevronRight, Eye, Image as ImageIcon, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { IMAGE_PLACEHOLDER } from "../../utils/media";

const DEFAULT_PROFILE_IMAGE = "/images/default-profile.png";

const PlaceCard = ({ place, onExplore }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (place.images && place.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % place.images.length);
    }
  };

  const prevImage = () => {
    if (place.images && place.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length);
    }
  };

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Author Info */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
          <img
            src={place.authorProfilePicture || DEFAULT_PROFILE_IMAGE}
            alt={`${place.author}'s profile`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = DEFAULT_PROFILE_IMAGE;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-gray-900 truncate">{place.author}</h4>
            <span className="text-gray-400">•</span>
            <span className="text-xs text-gray-500">{new Date(place.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h5 className="font-medium text-gray-800 truncate">{place.name}</h5>
            {place.isVerified && (
              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Carousel */}
      <div className="relative group">
        {place.images && place.images.length > 0 ? (
          <>
            <img
              src={place.images[currentImageIndex]}
              alt={`${place.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-64 object-cover transition-transform duration-300"
            />
            {place.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full">
                  <ImageIcon className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs font-medium">
                    {currentImageIndex + 1} / {place.images.length}
                  </span>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Location */}
        <p className="text-sm text-gray-500 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{place.location}</span>
        </p>

        {/* Description */}
        <p className="text-gray-700 leading-relaxed text-sm line-clamp-3">{place.description}</p>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => {
              const filled = i < Math.round(place.averageRating ?? 0);
              return (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    filled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                />
              );
            })}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {place.averageRating?.toFixed(1) || "0.0"}
          </span>
          <span className="text-xs text-gray-500">
            ({place.reviewCount || 0} {place.reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onExplore(place.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
          >
            <Eye className="w-4 h-4" />
            Explore
          </button>
          <a
            href={place.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              <MapPin className="w-4 h-4" />
              Maps
            </button>
          </a>
        </div>
      </div>
    </article>
  );
};

export default PlaceCard;
