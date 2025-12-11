import { Eye, MapPin, Star, UtensilsCrossed } from "lucide-react";
import { IMAGE_PLACEHOLDER } from "../../utils/media";

const AccommodationCard = ({ accommodation, onExplore }) => {
  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Type Badge */}
      <div className="relative">
        <img
          src={accommodation.image || IMAGE_PLACEHOLDER}
          alt={accommodation.name}
          className="w-full h-56 object-cover"
        />
        <div className="absolute top-3 right-3 px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold uppercase shadow-lg">
          {accommodation.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{accommodation.name}</h3>

        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{accommodation.description}</p>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => {
              const filled = i < Math.round(accommodation.averageRating ?? 0);
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
            {accommodation.averageRating?.toFixed(1) || "0.0"}
          </span>
          <span className="text-xs text-gray-500">
            ({accommodation.reviewCount || 0} {accommodation.reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onExplore(accommodation.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
          >
            <Eye className="w-4 h-4" />
            Explore
          </button>
          <a
            href={accommodation.mapLink}
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

export default AccommodationCard;
