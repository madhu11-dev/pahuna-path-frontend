import { Plus, Edit3, Trash2, XCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getExtraServicesApi,
  createExtraServiceApi,
  updateExtraServiceApi,
  deleteExtraServiceApi,
} from "../apis/Api";
import ConfirmationModal from "./ConfirmationModal";

const ExtraServiceManagement = ({ accommodationId }) => {
  const [services, setServices] = useState([]);
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null });

  const [serviceForm, setServiceForm] = useState({
    service_name: "",
    price: "",
    unit: "",
    description: "",
    is_active: true,
  });

  const fetchServices = async () => {
    if (!accommodationId) return;
    
    setLoading(true);
    const response = await getExtraServicesApi(accommodationId);
    if (response.status) {
      setServices(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, [accommodationId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServiceForm({
      ...serviceForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...serviceForm,
      is_active: serviceForm.is_active ? 1 : 0
    };
    
    if (editingService) {
      const response = await updateExtraServiceApi(accommodationId, editingService.id, submitData);
      if (response.status) {
        toast.success("Service updated successfully");
        setEditingService(null);
      } else {
        toast.error(response.message || "Failed to update service");
      }
    } else {
      const response = await createExtraServiceApi(accommodationId, submitData);
      if (response.status) {
        toast.success("Service added successfully");
        setShowAddService(false);
      } else {
        toast.error(response.message || "Failed to add service");
      }
    }

    setServiceForm({
      service_name: "",
      price: "",
      unit: "",
      description: "",
      is_active: true,
    });
    fetchServices();
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setServiceForm({
      service_name: service.service_name,
      price: service.price,
      unit: service.unit || "",
      description: service.description || "",
      is_active: service.is_active,
    });
    setShowAddService(true);
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
    const response = await deleteExtraServiceApi(accommodationId, serviceId);
    if (response.status) {
      toast.success("Service deleted successfully");
      fetchServices();
    } else {
      toast.error("Failed to delete service");
    }
  };

  const handleToggleActive = async (service) => {
    const response = await updateExtraServiceApi(accommodationId, service.id, {
      ...service,
      is_active: !service.is_active ? 1 : 0,
    });
    if (response.status) {
      toast.success(`Service ${!service.is_active ? "activated" : "deactivated"}`);
      fetchServices();
    } else {
      toast.error("Failed to update service status");
    }
  };

  const handleCancel = () => {
    setShowAddService(false);
    setEditingService(null);
    setServiceForm({
      service_name: "",
      price: "",
      unit: "",
      description: "",
      is_active: true,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Extra Services</h2>
        {!showAddService && (
          <button
            onClick={() => setShowAddService(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            <Plus size={20} />
            Add Service
          </button>
        )}
      </div>

      {showAddService && (
        <form onSubmit={handleSubmit} className="mb-6 border-b pb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingService ? "Edit Service" : "Add New Service"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name
              </label>
              <input
                type="text"
                name="service_name"
                value={serviceForm.service_name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g., Airport Pickup"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={serviceForm.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit (Optional)
              </label>
              <input
                type="text"
                name="unit"
                value={serviceForm.unit}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g., per person, per trip"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={serviceForm.is_active}
                  onChange={handleInputChange}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={serviceForm.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Service details..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
            >
              {editingService ? "Update Service" : "Add Service"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-600">Loading services...</p>
        ) : services.length === 0 ? (
          <p className="text-gray-600">No extra services added yet.</p>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition ${
                !service.is_active ? "bg-gray-50 opacity-60" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {service.service_name}
                    {!service.is_active && (
                      <span className="ml-2 text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </h3>
                  <p className="text-emerald-600 font-semibold mt-1">
                    Rs. {service.price}
                    {service.unit && (
                      <span className="text-sm text-gray-600 ml-1">
                        {service.unit}
                      </span>
                    )}
                  </p>
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {service.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(service)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    title={service.is_active ? "Deactivate" : "Activate"}
                  >
                    {service.is_active ? (
                      <ToggleRight size={20} className="text-emerald-600" />
                    ) : (
                      <ToggleLeft size={20} />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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

export default ExtraServiceManagement;
