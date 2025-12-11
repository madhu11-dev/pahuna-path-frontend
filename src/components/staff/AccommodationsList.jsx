import { Edit3, Plus, XCircle, Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  deleteAccommodationApi,
  newAccommodation,
  updateAccommodationApi,
} from "../../apis/Api";
import GoogleMapsPicker from "../GoogleMapsPicker";
import ConfirmationModal from "../ConfirmationModal";
import VerificationPaymentModal from "./VerificationPaymentModal";

const AccommodationsList = ({ accommodations, onRefresh }) => {
  const [showAddAccommodation, setShowAddAccommodation] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [editSelectedMapLocation, setEditSelectedMapLocation] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, accommodation: null });

  const [accommodationForm, setAccommodationForm] = useState({
    name: "",
    type: "guesthouse",
    description: "",
    google_map_link: "",
    imageFiles: [],
  });

  const [editAccommodationForm, setEditAccommodationForm] = useState({
    name: "",
    type: "guesthouse",
    description: "",
    google_map_link: "",
    imageFiles: [],
  });

  const handleAccommodationSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", accommodationForm.name);
      formData.append("type", accommodationForm.type);
      formData.append("description", accommodationForm.description);

      if (accommodationForm.google_map_link) {
        formData.append("google_map_link", accommodationForm.google_map_link);
      }

      if (accommodationForm.imageFiles && accommodationForm.imageFiles.length > 0) {
        for (let i = 0; i < accommodationForm.imageFiles.length; i++) {
          formData.append("images[]", accommodationForm.imageFiles[i]);
        }
      }

      const response = await newAccommodation(formData);

      // Backend returns AccommodationResource which has data object
      if (response && (response.data || response.id)) {
        toast.success("Accommodation added successfully!");
        setAccommodationForm({
          name: "",
          type: "guesthouse",
          description: "",
          google_map_link: "",
          imageFiles: [],
        });
        setShowAddAccommodation(false);
        setSelectedMapLocation(null);
        onRefresh();
      } else {
        toast.error("Failed to add accommodation");
      }
    } catch (error) {
      console.error("Error adding accommodation:", error);
      toast.error("An error occurred while adding accommodation");
    }
  };

  const handleEditAccommodationSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", editAccommodationForm.name);
      formData.append("type", editAccommodationForm.type);
      formData.append("description", editAccommodationForm.description);

      if (editAccommodationForm.google_map_link) {
        formData.append("google_map_link", editAccommodationForm.google_map_link);
      }

      if (editAccommodationForm.imageFiles && editAccommodationForm.imageFiles.length > 0) {
        for (let i = 0; i < editAccommodationForm.imageFiles.length; i++) {
          formData.append("images[]", editAccommodationForm.imageFiles[i]);
        }
      }

      const response = await updateAccommodationApi(editingAccommodation.id, formData);

      // Backend returns AccommodationResource
      if (response && (response.data || response.id)) {
        toast.success("Accommodation updated successfully!");
        setEditingAccommodation(null);
        setEditAccommodationForm({
          name: "",
          type: "guesthouse",
          description: "",
          google_map_link: "",
          imageFiles: [],
        });
        setEditSelectedMapLocation(null);
        onRefresh();
      } else {
        toast.error("Failed to update accommodation");
      }
    } catch (error) {
      console.error("Error updating accommodation:", error);
      toast.error("An error occurred while updating accommodation");
    }
  };

  const startEditingAccommodation = (accommodation) => {
    setEditingAccommodation(accommodation);
    setEditAccommodationForm({
      name: accommodation.name,
      type: accommodation.type,
      description: accommodation.description || "",
      google_map_link: accommodation.google_map_link || "",
      imageFiles: [],
    });
    setEditSelectedMapLocation(null);
  };

  const handleAccommodationDelete = (accommodationId) => {
    setConfirmModal({
      isOpen: true,
      data: {
        id: accommodationId,
        action: 'delete-accommodation'
      }
    });
  };

  const confirmAccommodationDelete = async () => {
    try {
      const accommodationId = confirmModal.data.id;
      const response = await deleteAccommodationApi(accommodationId);

      // Backend returns { message: '...' } without status field
      if (response && (response.message || response.data?.message)) {
        toast.success("Accommodation deleted successfully!");
        onRefresh();
      } else {
        toast.error("Failed to delete accommodation");
      }
    } catch (error) {
      console.error("Error deleting accommodation:", error);
      toast.error(error.response?.data?.message || "An error occurred while deleting accommodation");
    } finally {
      setConfirmModal({ isOpen: false, data: null });
    }
  };

  const handlePayVerificationFee = (accommodation) => {
    setPaymentModal({ isOpen: true, accommodation });
  };

  const handlePaymentSuccess = (updatedAccommodation) => {
    setPaymentModal({ isOpen: false, accommodation: null });
    // Toast is already shown in VerificationPaymentModal
    onRefresh();
  };

  const handleMapLocationSelect = (locationData) => {
    if (locationData) {
      setSelectedMapLocation(locationData);
      setAccommodationForm(prevForm => ({
        ...prevForm,
        google_map_link: locationData.googleMapsUrl
      }));
    } else {
      setSelectedMapLocation(null);
      setAccommodationForm(prevForm => ({
        ...prevForm,
        google_map_link: ""
      }));
    }
  };

  const handleEditMapLocationSelect = (locationData) => {
    if (locationData) {
      setEditSelectedMapLocation(locationData);
      setEditAccommodationForm(prevForm => ({
        ...prevForm,
        google_map_link: locationData.googleMapsUrl
      }));
    } else {
      setEditSelectedMapLocation(null);
      setEditAccommodationForm(prevForm => ({
        ...prevForm,
        google_map_link: ""
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">My Accommodations</h3>
        <button
          onClick={() => setShowAddAccommodation(!showAddAccommodation)}
          disabled={
            accommodations &&
            accommodations.length > 0 &&
            !showAddAccommodation
          }
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            accommodations &&
            accommodations.length > 0 &&
            !showAddAccommodation
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>
            {accommodations &&
            accommodations.length > 0 &&
            !showAddAccommodation
              ? "Already have accommodation"
              : showAddAccommodation
              ? "Cancel"
              : "Add Accommodation"}
          </span>
        </button>
      </div>

      {/* Add Accommodation Form */}
      {showAddAccommodation && (
        <form
          onSubmit={handleAccommodationSubmit}
          className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accommodation Name *
              </label>
              <input
                type="text"
                required
                value={accommodationForm.name}
                onChange={(e) =>
                  setAccommodationForm({
                    ...accommodationForm,
                    name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                required
                value={accommodationForm.type}
                onChange={(e) =>
                  setAccommodationForm({
                    ...accommodationForm,
                    type: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="guesthouse">Guesthouse</option>
                <option value="hotel">Hotel</option>
                <option value="resort">Resort</option>
                <option value="homestay">Homestay</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={accommodationForm.description}
              onChange={(e) =>
                setAccommodationForm({
                  ...accommodationForm,
                  description: e.target.value,
                })
              }
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Maps Location
            </label>
            {(() => {
              const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
              return apiKey && apiKey.trim() !== '' && apiKey !== 'your_google_maps_api_key_here';
            })() ? (
              <GoogleMapsPicker
                onLocationSelect={handleMapLocationSelect}
                className="w-full"
              />
            ) : (
              <div>
                <input
                  type="url"
                  value={accommodationForm.google_map_link}
                  onChange={(e) =>
                    setAccommodationForm({
                      ...accommodationForm,
                      google_map_link: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://maps.google.com/..."
                />
                <p className="text-xs text-amber-600 mt-1">
                  📍 Google Maps integration not configured. Please paste the Google Maps link manually.
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setAccommodationForm({
                  ...accommodationForm,
                  imageFiles: Array.from(e.target.files),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Add Accommodation
          </button>
        </form>
      )}

      {/* Accommodations List */}
      {accommodations && accommodations.length > 0 ? (
        accommodations.map((accommodation) => (
          <div
            key={accommodation.id}
            className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            {editingAccommodation?.id === accommodation.id ? (
              // Edit Form
              <form onSubmit={handleEditAccommodationSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accommodation Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editAccommodationForm.name}
                      onChange={(e) =>
                        setEditAccommodationForm({
                          ...editAccommodationForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      required
                      value={editAccommodationForm.type}
                      onChange={(e) =>
                        setEditAccommodationForm({
                          ...editAccommodationForm,
                          type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="guesthouse">Guesthouse</option>
                      <option value="hotel">Hotel</option>
                      <option value="resort">Resort</option>
                      <option value="homestay">Homestay</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editAccommodationForm.description}
                    onChange={(e) =>
                      setEditAccommodationForm({
                        ...editAccommodationForm,
                        description: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Maps Location
                  </label>
                  {(() => {
                    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
                    return apiKey && apiKey.trim() !== '' && apiKey !== 'your_google_maps_api_key_here';
                  })() ? (
                    <GoogleMapsPicker
                      onLocationSelect={handleEditMapLocationSelect}
                      className="w-full"
                    />
                  ) : (
                    <div>
                      <input
                        type="url"
                        value={editAccommodationForm.google_map_link || ''}
                        onChange={(e) =>
                          setEditAccommodationForm({
                            ...editAccommodationForm,
                            google_map_link: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="https://maps.google.com/..."
                      />
                      <p className="text-xs text-amber-600 mt-1">
                        📍 Google Maps integration not configured. Please paste the Google Maps link manually.
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Images (optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setEditAccommodationForm({
                        ...editAccommodationForm,
                        imageFiles: Array.from(e.target.files),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAccommodation(null);
                      setEditSelectedMapLocation(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // Display View
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {accommodation.name}
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditingAccommodation(accommodation)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAccommodationDelete(accommodation.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {accommodation.type}
                  </p>

                  <p>
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        accommodation.is_verified
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {accommodation.is_verified ? "Verified" : "Pending"}
                    </span>
                  </p>

                  <p>
                    <span className="font-medium">Verification Fee:</span>
                    <span
                      className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        accommodation.has_paid_verification
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {accommodation.has_paid_verification ? "Paid" : "Unpaid"}
                    </span>
                  </p>
                </div>

                {!accommodation.has_paid_verification && (
                  <div className="mt-4">
                    <button
                      onClick={() => handlePayVerificationFee(accommodation)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Pay Verification Fee (Rs. 10)
                    </button>
                    <p className="text-xs text-gray-600 mt-2">
                      💡 Pay Rs. 10 verification fee to admin to get your accommodation verified
                    </p>
                  </div>
                )}
                {accommodation.description && (
                  <p className="mt-2 text-gray-600">
                    {accommodation.description}
                  </p>
                )}
                {accommodation.google_map_link && (
                  <div className="mt-2">
                    <a
                      href={accommodation.google_map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View on Maps
                    </a>
                  </div>
                )}
                {accommodation.images &&
                  accommodation.images.length > 0 && (
                    <div className="mt-2 flex space-x-2">
                      {accommodation.images
                        .slice(0, 3)
                        .map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${accommodation.name} - ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ))}
                      {accommodation.images.length > 3 && (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-600">
                          +{accommodation.images.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No accommodations added yet</p>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, data: null })}
        onConfirm={confirmAccommodationDelete}
        title="Delete Accommodation"
        message="Are you sure you want to delete this accommodation? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Verification Payment Modal */}
      <VerificationPaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, accommodation: null })}
        accommodation={paymentModal.accommodation}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default AccommodationsList;
