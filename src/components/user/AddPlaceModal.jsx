import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import GoogleMapsPicker from "../GoogleMapsPicker";

const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_IMAGES = 10;

const AddPlaceModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    place_name: "",
    description: "",
    google_map_link: "",
    imageFiles: [],
  });
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        place_name: "",
        description: "",
        google_map_link: "",
        imageFiles: [],
      });
      setSelectedMapLocation(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  // Cleanup object URLs when imageFiles change
  useEffect(() => {
    const urls = formData.imageFiles.map((file) => URL.createObjectURL(file));
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [formData.imageFiles]);

  const handleMapLocationSelect = (locationData) => {
    if (locationData) {
      setSelectedMapLocation(locationData);
      setFormData((prev) => ({
        ...prev,
        google_map_link: locationData.googleMapsUrl,
      }));
    } else {
      setSelectedMapLocation(null);
      setFormData((prev) => ({
        ...prev,
        google_map_link: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    setFormData({ ...formData, imageFiles: files });
  };

  const removeImage = (index) => {
    const newFiles = formData.imageFiles.filter((_, i) => i !== index);
    setFormData({ ...formData, imageFiles: newFiles });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, selectedMapLocation);
  };

  if (!isOpen) return null;

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const hasGoogleMapsAPI = apiKey && apiKey.trim() !== "" && apiKey !== "your_google_maps_api_key_here";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-900">Share Your Favorite Place</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Place Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Place Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter place name"
              value={formData.place_name}
              onChange={(e) => setFormData({ ...formData, place_name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Share the story behind this place... Describe what makes it special, its history, your experience, or any tips for visitors."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
              rows="4"
              maxLength={MAX_DESCRIPTION_LENGTH}
              required
            />
            <p className="text-xs text-gray-500 mt-1.5 text-right">
              {formData.description.length}/{MAX_DESCRIPTION_LENGTH} characters
            </p>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images <span className="text-red-500">*</span>{" "}
              <span className="text-gray-500 font-normal">(Max {MAX_IMAGES})</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                id="file-upload"
                required
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-8 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
              >
                <ImagePlus className="w-6 h-6 text-gray-400" />
                <span className="text-gray-600">Click to upload images</span>
              </label>
            </div>
            {formData.imageFiles.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">
                  {formData.imageFiles.length} file{formData.imageFiles.length > 1 ? "s" : ""} selected
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {formData.imageFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            {hasGoogleMapsAPI ? (
              <GoogleMapsPicker onLocationSelect={handleMapLocationSelect} className="w-full" />
            ) : (
              <div>
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={formData.google_map_link}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      google_map_link: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
                <p className="text-xs text-amber-600 mt-2">
                  📍 Google Maps integration not configured. Please paste the Google Maps link manually.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? "Sharing..." : "Share Place"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlaceModal;
