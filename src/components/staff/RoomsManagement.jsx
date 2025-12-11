import { useState, useEffect } from 'react';
import { Building2, Plus, Edit3, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { getRoomsApi, createRoomApi, updateRoomApi, deleteRoomApi } from '../../apis/Api';
import ConfirmationModal from '../ConfirmationModal';

const RoomsManagement = ({ accommodations }) => {
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null });
  const [roomForm, setRoomForm] = useState({
    room_name: '',
    room_type: 'standard',
    has_ac: false,
    capacity: 1,
    total_rooms: 1,
    base_price: '',
    description: '',
    imageFiles: []
  });

  useEffect(() => {
    if (accommodations && accommodations.length > 0 && !selectedAccommodation) {
      setSelectedAccommodation(accommodations[0].id);
    }
  }, [accommodations]);

  useEffect(() => {
    if (selectedAccommodation) {
      fetchRooms();
    }
  }, [selectedAccommodation]);

  const fetchRooms = async () => {
    if (!selectedAccommodation) return;
    
    setLoading(true);
    try {
      const response = await getRoomsApi(selectedAccommodation);
      if (response.status) {
        setRooms(response.data);
      }
    } catch (error) {
      toast.error('Failed to load rooms');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('room_name', roomForm.room_name);
    formData.append('room_type', roomForm.room_type);
    formData.append('has_ac', roomForm.has_ac ? '1' : '0');
    formData.append('capacity', roomForm.capacity);
    formData.append('total_rooms', roomForm.total_rooms);
    formData.append('base_price', roomForm.base_price);
    formData.append('description', roomForm.description);
    
    if (roomForm.imageFiles.length > 0) {
      roomForm.imageFiles.forEach(file => {
        formData.append('images[]', file);
      });
    }

    try {
      if (editingRoom) {
        await updateRoomApi(selectedAccommodation, editingRoom.id, formData);
        toast.success('Room updated successfully');
      } else {
        await createRoomApi(selectedAccommodation, formData);
        toast.success('Room created successfully');
      }
      
      resetForm();
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save room');
    }
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
      description: room.description || '',
      imageFiles: []
    });
    setShowAddForm(true);
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
    try {
      await deleteRoomApi(selectedAccommodation, roomId);
      toast.success('Room deleted successfully');
      fetchRooms();
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  const resetForm = () => {
    setRoomForm({
      room_name: '',
      room_type: 'standard',
      has_ac: false,
      capacity: 1,
      total_rooms: 1,
      base_price: '',
      description: '',
      imageFiles: []
    });
    setShowAddForm(false);
    setEditingRoom(null);
  };

  if (!accommodations || accommodations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Accommodations</h3>
        <p className="text-gray-600">Please add an accommodation first to manage rooms</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Building2 className="w-6 h-6 text-emerald-600 mr-2" />
            Room Management
          </h3>
          
          {accommodations.length > 1 && (
            <select
              value={selectedAccommodation || ''}
              onChange={(e) => setSelectedAccommodation(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {accommodations.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Cancel' : 'Add Room'}</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Name *</label>
              <input
                type="text"
                required
                value={roomForm.room_name}
                onChange={(e) => setRoomForm({...roomForm, room_name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Deluxe Suite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
              <select
                required
                value={roomForm.room_type}
                onChange={(e) => setRoomForm({...roomForm, room_type: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="standard">Standard</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
                <option value="family">Family</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
              <input
                type="number"
                required
                min="1"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({...roomForm, capacity: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Rooms *</label>
              <input
                type="number"
                required
                min="1"
                value={roomForm.total_rooms}
                onChange={(e) => setRoomForm({...roomForm, total_rooms: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (Rs.) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={roomForm.base_price}
                onChange={(e) => setRoomForm({...roomForm, base_price: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={roomForm.has_ac}
                  onChange={(e) => setRoomForm({...roomForm, has_ac: e.target.checked})}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Air Conditioned</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={roomForm.description}
              onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
              placeholder="Room description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setRoomForm({...roomForm, imageFiles: Array.from(e.target.files)})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              {editingRoom ? 'Update Room' : 'Add Room'}
            </button>
          </div>
        </form>
      )}

      {/* Rooms List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No rooms found. Add your first room!
        </div>
      ) : (
        <div className="space-y-4">
          {rooms.map(room => (
            <div key={room.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-800">{room.room_name}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
                      {room.room_type}
                    </span>
                    {room.has_ac && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                        AC
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      Capacity: {room.capacity}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      Total Rooms: {room.total_rooms}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-emerald-600 mt-2">
                    Rs. {room.base_price} / night
                  </p>
                  {room.description && (
                    <p className="text-sm text-gray-600 mt-2">{room.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default RoomsManagement;
