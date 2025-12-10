import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  DollarSign,
  Home,
  Package,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  createBookingApi,
  getCookie,
  getExtraServicesApi,
} from "../../apis/Api";
import PageContainer from "../../components/user/PageContainer";
import SectionCard from "../../components/user/SectionCard";

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [extraServices, setExtraServices] = useState([]);

  const bookingData = location.state || {};

  const [formData, setFormData] = useState({
    accommodation_id: bookingData.accommodationId || "",
    room_id: bookingData.roomId || "",
    check_in_date: bookingData.checkIn || "",
    check_out_date: bookingData.checkOut || "",
    number_of_rooms: 1,
    number_of_guests: 1,
    special_requests: "",
    services: [],
  });

  useEffect(() => {
    const token = getCookie("auth_token") || localStorage.getItem("token");
    console.log(
      "BookingPage - Token check:",
      token ? "Token exists" : "No token found"
    );

    if (!token) {
      toast.error("Please login to book");
      navigate("/login");
      return;
    }

    if (!bookingData.accommodationId || !bookingData.roomId) {
      toast.error("Invalid booking data");
      navigate("/accommodations");
      return;
    }

    fetchExtraServices();
  }, [bookingData.accommodationId, navigate]);

  const fetchExtraServices = async () => {
    if (!bookingData.accommodationId) return;

    const response = await getExtraServicesApi(bookingData.accommodationId);
    if (response.status) {
      setExtraServices(response.data.filter((service) => service.is_active));
    }
  };

  const calculateNights = () => {
    if (!formData.check_in_date || !formData.check_out_date) return 0;
    const checkIn = new Date(formData.check_in_date);
    const checkOut = new Date(formData.check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const calculateRoomTotal = () => {
    const nights = calculateNights();
    return bookingData.roomPrice * formData.number_of_rooms * nights;
  };

  const calculateServicesTotal = () => {
    return formData.services.reduce((total, service) => {
      const serviceData = extraServices.find(
        (s) => s.id === service.service_id
      );
      return total + (serviceData ? serviceData.price * service.quantity : 0);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateRoomTotal() + calculateServicesTotal();
  };

  const handleServiceToggle = (serviceId) => {
    const existingService = formData.services.find(
      (s) => s.service_id === serviceId
    );

    if (existingService) {
      setFormData({
        ...formData,
        services: formData.services.filter((s) => s.service_id !== serviceId),
      });
    } else {
      setFormData({
        ...formData,
        services: [
          ...formData.services,
          { service_id: serviceId, quantity: 1 },
        ],
      });
    }
  };

  const handleServiceQuantityChange = (serviceId, quantity) => {
    setFormData({
      ...formData,
      services: formData.services.map((s) =>
        s.service_id === serviceId ? { ...s, quantity: parseInt(quantity) } : s
      ),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify token exists before making the request
      const token = getCookie("auth_token") || localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const response = await createBookingApi(formData);
      if (response.status) {
        toast.success(
          `Booking confirmed! Reference: ${response.data.booking_reference}`
        );
        navigate("/my-bookings");
      } else {
        toast.error(response.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Booking creation error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to create booking"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      activePage="bookings"
      title="Confirm Booking"
      subtitle="Review your booking details and complete your reservation"
      actions={
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          <ChevronLeft size={20} />
          Back
        </button>
      }
    >
      <div className="max-w-4xl mx-auto">
        <SectionCard className="mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Home className="text-emerald-600" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {bookingData.accommodationName}
              </h2>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <span className="font-medium">{bookingData.roomName}</span>
                <span className="text-emerald-600 font-semibold">
                  Rs. {bookingData.roomPrice} / night
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Guest Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Check-in Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.check_in_date}
                  onChange={(e) =>
                    setFormData({ ...formData, check_in_date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Check-out Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.check_out_date}
                  onChange={(e) =>
                    setFormData({ ...formData, check_out_date: e.target.value })
                  }
                  min={formData.check_in_date}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Home size={16} />
                  Number of Rooms
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={formData.number_of_rooms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number_of_rooms: parseInt(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Users size={16} />
                  Number of Guests
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.number_of_guests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number_of_guests: parseInt(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Extra Services */}
            {extraServices.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Package size={20} />
                  Extra Services
                </h3>
                <div className="grid gap-3">
                  {extraServices.map((service) => {
                    const selected = formData.services.find(
                      (s) => s.service_id === service.id
                    );
                    return (
                      <div
                        key={service.id}
                        className={`flex items-center justify-between border-2 rounded-lg p-4 transition-all ${
                          selected
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={!!selected}
                            onChange={() => handleServiceToggle(service.id)}
                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {service.service_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Rs. {service.price}
                              {service.unit && ` / ${service.unit}`}
                            </p>
                          </div>
                        </div>
                        {selected && (
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">
                              Qty:
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={selected.quantity}
                              onChange={(e) =>
                                handleServiceQuantityChange(
                                  service.id,
                                  e.target.value
                                )
                              }
                              className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                rows="3"
                value={formData.special_requests}
                onChange={(e) =>
                  setFormData({ ...formData, special_requests: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Any special requirements or preferences..."
              />
            </div>

            {/* Price Breakdown */}
            <div className="border-t pt-6 bg-gray-50 rounded-lg p-6 -mx-6 mx-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign size={20} />
                Price Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>
                    Room ({calculateNights()} night
                    {calculateNights() > 1 ? "s" : ""} ×{" "}
                    {formData.number_of_rooms} room
                    {formData.number_of_rooms > 1 ? "s" : ""})
                  </span>
                  <span className="font-semibold">
                    Rs. {calculateRoomTotal().toLocaleString()}
                  </span>
                </div>
                {formData.services.length > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Extra Services</span>
                    <span className="font-semibold">
                      Rs. {calculateServicesTotal().toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-bold text-emerald-600 pt-3 border-t-2 border-gray-300">
                  <span>Total Amount</span>
                  <span>Rs. {calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 to-emerald-700 text-white py-4 rounded-lg font-bold text-lg hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Confirm Booking
                </>
              )}
            </button>
          </form>
        </SectionCard>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </PageContainer>
  );
};

export default BookingPage;
