import { Plus, Edit3, Trash2, XCircle, Users, Home, IndianRupee , ImageIcon, Wind, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../apis/Api";
import {
  getRoomsApi,
  createRoomApi,
  updateRoomApi,
  deleteRoomApi,
} from "../apis/Api";
import ConfirmationModal from "./ConfirmationModal";

const RoomManagement = ({ accommodationId }) => {
  const [rooms, setRooms] = useState([]);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null });

  const [roomForm, setRoomForm] = useState({
    room_name: "",
    room_type: "single",
    has_ac: false,
    capacity: 1,
    total_rooms: 1,
    base_price: "",
    description: "",
    imageFiles: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  const fetchRooms = async () => {
    if (!accommodationId) return;
    
    setLoading(true);
    const response = await getRoomsApi(accommodationId);
    if (response.status) {
      setRooms(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, [accommodationId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoomForm({
      ...roomForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setRoomForm({
      ...roomForm,
      imageFiles: files,
    });

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImagePreview = (index) => {
    const newFiles = roomForm.imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(imagePreviews[index]);
    
    setRoomForm({ ...roomForm, imageFiles: newFiles });
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    Object.keys(roomForm).forEach((key) => {
      if (key === "imageFiles") {
        roomForm.imageFiles.forEach((file, index) => {
          formData.append(`images[${index}]`, file);
        });
      } else if (key === "has_ac") {
        formData.append(key, roomForm[key] ? "1" : "0");
      } else {
        formData.append(key, roomForm[key]);
      }
    });

    if (editingRoom) {
      const response = await updateRoomApi(accommodationId, editingRoom.id, formData);
      if (response.status) {
        toast.success("Room updated successfully");
        setShowAddRoom(false);
        setEditingRoom(null);
      } else {
        toast.error(response.message || "Failed to update room");
      }
    } else {
      const response = await createRoomApi(accommodationId, formData);
      if (response.status) {
        toast.success("Room added successfully");
        setShowAddRoom(false);
      } else {
        toast.error(response.message || "Failed to add room");
      }
    }

    setRoomForm({
      room_name: "",
      room_type: "single",
      has_ac: false,
      capacity: 1,
      total_rooms: 1,
      base_price: "",
      description: "",
      imageFiles: [],
    });
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
    fetchRooms();
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setRoomForm({
      room_name: room.room_name,
      room_type: room.room_type,
      has_ac: room.has_ac,
      capacity: room.capacity,
      total_rooms: room.total_rooms,
      base_price: room.base_price,
      description: room.description || "",
      imageFiles: [],
    });
    setShowAddRoom(true);
  };

  const handleDelete = (roomId) => {
    setConfirmModal({
      isOpen: true,
      data: { roomId },
    });
  };

  const executeDelete = async () => {
    const { roomId } = confirmModal.data;
    setConfirmModal({ ...confirmModal, isOpen: false });
    const response = await deleteRoomApi(accommodationId, roomId);
    if (response.status) {
      toast.success("Room deleted successfully");
      fetchRooms();
    } else {
      toast.error(response.message || "Failed to delete room");
    }
  };

  const handleCancel = () => {
    setShowAddRoom(false);
    setEditingRoom(null);
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
    setRoomForm({
      room_name: "",
      room_type: "single",
      has_ac: false,
      capacity: 1,
      total_rooms: 1,
      base_price: "",
      description: "",
      imageFiles: [],
    });
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Home className="text-emerald-600" size={28} />
            Room Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">Manage your accommodation room types and pricing</p>
        </div>
        {!showAddRoom && (
          <button
            onClick={() => setShowAddRoom(true)}
            className="flex items-center gap-2 bg-gradient-to-r bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 shadow-md transition-all"
          >
            <Plus size={20} />
            Add Room Type
          </button>
        )}
      </div>

      {showAddRoom && (
        <form onSubmit={handleSubmit} className="mb-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3">
            {editingRoom ? "Edit Room Type" : "Add New Room Type"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Room Name
              </label>
              <input
                type="text"
                name="room_name"
                value={roomForm.room_name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="e.g., Deluxe Suite"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Room Type
              </label>
              <select
                name="room_type"
                value={roomForm.room_type}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              >
                <option value="single">Single Room</option>
                <option value="double">Double Room</option>
                <option value="suite">Suite</option>
                <option value="family">Family Room</option>
                <option value="dormitory">Dormitory</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Users size={16} className="inline mr-1" />
                Guest Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={roomForm.capacity}
                onChange={handleInputChange}
                required
                min="1"
                max="20"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Home size={16} className="inline mr-1" />
                Total Rooms Available
              </label>
              <input
                type="number"
                name="total_rooms"
                value={roomForm.total_rooms}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <IndianRupee  size={16} className="inline mr-1" />
                Base Price (Per Night)
              </label>
              <input
                type="number"
                name="base_price"
                value={roomForm.base_price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center pt-7">
              <label className="flex items-center cursor-pointer bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition w-full">
                <input
                  type="checkbox"
                  name="has_ac"
                  checked={roomForm.has_ac}
                  onChange={handleInputChange}
                  className="mr-3 w-5 h-5 text-emerald-600 focus:ring-emerald-500 rounded"
                />
                <Wind size={18} className="mr-2 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Air Conditioned
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={roomForm.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="Room amenities, features, and details..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <ImageIcon size={16} className="inline mr-1" />
                Room Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImagePreview(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button
              type="submit"
              className="bg-emerald-600 text-white px-8 py-2.5 rounded-lg hover:bg-emerald-700 font-semibold shadow-md transition-all"
            >
              {editingRoom ? "Update Room" : "Add Room"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 text-gray-700 px-8 py-2.5 rounded-lg hover:bg-gray-300 font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
            <p className="text-gray-600 mt-3">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Home size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No rooms added yet.</p>
            <p className="text-sm text-gray-500 mt-1">Click the "Add New Room" button to create your first room type.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Room Images */}
                {room.images && room.images.length > 0 && (
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={`${BASE_URL}/storage/${room.images[0]}`}
                      alt={room.room_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {room.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
                        <ImageIcon size={12} className="inline mr-1" />
                        {room.images.length} photos
                      </div>
                    )}
                  </div>
                )}

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {room.room_name}
                      </h3>
                      <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded mt-1 capitalize">
                        {room.room_type}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(room)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Room"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Room"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                      <Users size={16} className="mr-2 text-emerald-600" />
                      <span><strong>{room.capacity}</strong> guests</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                      <Home size={16} className="mr-2 text-emerald-600" />
                      <span><strong>{room.total_rooms}</strong> rooms</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-lg font-bold text-emerald-600">
                      <IndianRupee  size={20} className="mr-1" />
                      Rs. {room.base_price}
                      <span className="text-sm font-normal text-gray-600 ml-1">/ night</span>
                    </div>
                    {room.has_ac && (
                      <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        <Wind size={14} className="mr-1" />
                        AC
                      </div>
                    )}
                  </div>

                  {room.description && (
                    <p className="text-sm text-gray-600 border-t pt-3 line-clamp-2">
                      {room.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, data: null })}
        onConfirm={executeDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this room? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmButtonColor="red"
      />
    </div>
  );
};

export default RoomManagement;
