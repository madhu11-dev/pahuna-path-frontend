import { useState, useEffect } from 'react';
import { Package, Plus, Edit3, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { getExtraServicesApi, createExtraServiceApi, updateExtraServiceApi, deleteExtraServiceApi } from '../../apis/Api';
import ConfirmationModal from '../ConfirmationModal';

const ServicesManagement = ({ accommodations }) => {
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null });
  const [serviceForm, setServiceForm] = useState({
    service_name: '',
    description: '',
    price: '',
    unit: '',
    is_active: true
  });

  useEffect(() => {
    if (accommodations && accommodations.length > 0 && !selectedAccommodation) {
      setSelectedAccommodation(accommodations[0].id);
    }
  }, [accommodations]);

  useEffect(() => {
    if (selectedAccommodation) {
      fetchServices();
    }
  }, [selectedAccommodation]);

  const fetchServices = async () => {
    if (!selectedAccommodation) return;
    
    setLoading(true);
    try {
      const response = await getExtraServicesApi(selectedAccommodation);
      if (response.status) {
        setServices(response.data);
      }
    } catch (error) {
      toast.error('Failed to load services');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingService) {
        await updateExtraServiceApi(selectedAccommodation, editingService.id, serviceForm);
        toast.success('Service updated successfully');
      } else {
        await createExtraServiceApi(selectedAccommodation, serviceForm);
        toast.success('Service created successfully');
      }
      
      resetForm();
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setServiceForm({
      service_name: service.service_name,
      description: service.description || '',
      price: service.price,
      unit: service.unit || '',
      is_active: service.is_active
    });
    setShowAddForm(true);
  };

  const handleDelete = (serviceId) => {
    setConfirmModal({
      isOpen: true,
      data: { serviceId },
    });
  };

  const executeDelete = async () => {
    const { serviceId } = confirmModal.data;
    setConfirmModal({ ...confirmModal, isOpen: false });
    try {
      await deleteExtraServiceApi(selectedAccommodation, serviceId);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const handleToggleActive = async (service) => {
    try {
      await updateExtraServiceApi(selectedAccommodation, service.id, {
        ...service,
        is_active: !service.is_active ? 1 : 0,
      });
      toast.success(`Service ${!service.is_active ? 'activated' : 'deactivated'}`);
      fetchServices();
    } catch (error) {
      toast.error('Failed to update service status');
    }
  };

  const resetForm = () => {
    setServiceForm({
      service_name: '',
      description: '',
      price: '',
      unit: '',
      is_active: true
    });
    setShowAddForm(false);
    setEditingService(null);
  };

  if (!accommodations || accommodations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Accommodations</h3>
        <p className="text-gray-600">Please add an accommodation first to manage services</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Package className="w-6 h-6 text-emerald-600 mr-2" />
            Extra Services Management
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
          <span>{showAddForm ? 'Cancel' : 'Add Service'}</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
              <input
                type="text"
                required
                value={serviceForm.service_name}
                onChange={(e) => setServiceForm({...serviceForm, service_name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Airport Pickup"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={serviceForm.price}
                onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input
                type="text"
                value={serviceForm.unit}
                onChange={(e) => setServiceForm({...serviceForm, unit: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="per person, per day, etc."
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={serviceForm.is_active}
                  onChange={(e) => setServiceForm({...serviceForm, is_active: e.target.checked})}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={serviceForm.description}
              onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
              placeholder="Service description..."
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
              {editingService ? 'Update Service' : 'Add Service'}
            </button>
          </div>
        </form>
      )}

      {/* Services List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No services found. Add your first service!
        </div>
      ) : (
        <div className="space-y-4">
          {services.map(service => (
            <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-gray-800">{service.service_name}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      service.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-emerald-600 mt-2">
                    Rs. {service.price} {service.unit && `/ ${service.unit}`}
                  </p>
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-2">{service.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleActive(service)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title={service.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {service.is_active ? (
                      <ToggleRight size={20} className="text-emerald-600" />
                    ) : (
                      <ToggleLeft size={20} />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
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
        message="Are you sure you want to delete this service? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmButtonColor="red"
      />
    </div>
  );
};

export default ServicesManagement;
