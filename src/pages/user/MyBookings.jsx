import {
  Calendar,
  Clock,
  CreditCard,
  Home,
  IndianRupee,
  Package,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cancelBookingApi, getBookingsApi, getCookie } from "../../apis/Api";
import EmptyState from "../../components/user/EmptyState";
import LoadingSpinner from "../../components/user/LoadingSpinner";
import PageContainer from "../../components/user/PageContainer";
import PaymentModal from "../../components/user/PaymentModal";
import SectionCard from "../../components/user/SectionCard";
import StatusBadge from "../../components/user/StatusBadge";
import ConfirmationModal from "../../components/ConfirmationModal";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [refundingId, setRefundingId] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, data: null });
  const [activeTab, setActiveTab] = useState("current"); // 'current' or 'expired'

  useEffect(() => {
    const token = getCookie("auth_token");
    if (!token) {
      toast.error("Please login to view bookings");
      navigate("/login");
      return;
    }

    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    const response = await getBookingsApi();
    if (response.status) {
      setBookings(response.data);
    } else {
      toast.error("Failed to load bookings");
    }
    setLoading(false);
  };

  const handleRefundBooking = (bookingId) => {
    setConfirmModal({
      isOpen: true,
      action: 'refund',
      data: { bookingId },
    });
  };

  const executeRefundBooking = async () => {
    const { bookingId } = confirmModal.data;
    setConfirmModal({ ...confirmModal, isOpen: false });
    setRefundingId(bookingId);
    const response = await cancelBookingApi(bookingId, {
      cancellation_reason: "Refund requested by user",
    });

    if (response.status) {
      const refundAmount = response.refund_amount || response.data?.refund_amount || 0;
      const refundMessage =
        response.refund_message ||
        response.message ||
        "Booking cancelled successfully";

      if (refundAmount > 0) {
        toast.success(`${refundMessage}`, { autoClose: 5000 });
      } else {
        toast.success(refundMessage);
      }
      fetchBookings();
    } else {
      toast.error(response.message || "Failed to cancel booking");
    }
    setRefundingId(null);
  };

  const handleCancelBooking = (bookingId) => {
    setConfirmModal({
      isOpen: true,
      action: 'cancel',
      data: { bookingId },
    });
  };

  const executeCancelBooking = async () => {
    const { bookingId } = confirmModal.data;
    setConfirmModal({ ...confirmModal, isOpen: false });
    setCancellingId(bookingId);
    const response = await cancelBookingApi(bookingId, {
      cancellation_reason: "Cancelled by user",
    });

    if (response.status) {
      const refundAmount = response.data?.refund_amount || 0;
      const refundMessage =
        response.refund_message ||
        response.message ||
        "Booking cancelled successfully";

      if (refundAmount > 0) {
        toast.success(`${refundMessage}`, { autoClose: 5000 });
      } else {
        toast.success(refundMessage);
      }
      fetchBookings();
    } else {
      toast.error(response.message || "Failed to cancel booking");
    }
    setCancellingId(null);
  };

  const handlePayNow = (booking) => {
    setSelectedBooking(booking);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (updatedBooking) => {
    setBookings(
      bookings.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
    setPaymentModalOpen(false);
    setSelectedBooking(null);
    // Optionally refresh all bookings to ensure consistency
    setTimeout(() => fetchBookings(), 1000);
  };

  // Filter bookings based on active tab
  const filterBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab === "current") {
      // Current: pending, confirmed, checked_in, and future bookings that are not cancelled
      return bookings.filter((booking) => {
        const checkOutDate = new Date(booking.check_out_date);
        checkOutDate.setHours(0, 0, 0, 0);

        return (
          booking.booking_status !== "cancelled" &&
          (booking.booking_status === "pending" ||
            booking.booking_status === "confirmed" ||
            booking.booking_status === "checked_in" ||
            checkOutDate >= today)
        );
      });
    } else {
      // Expired: cancelled bookings or checked_out/past bookings
      return bookings.filter((booking) => {
        const checkOutDate = new Date(booking.check_out_date);
        checkOutDate.setHours(0, 0, 0, 0);

        return (
          booking.booking_status === "cancelled" ||
          (booking.booking_status === "checked_out" && checkOutDate < today) ||
          (booking.booking_status !== "cancelled" &&
            booking.booking_status !== "checked_in" &&
            booking.booking_status !== "pending" &&
            booking.booking_status !== "confirmed" &&
            checkOutDate < today)
        );
      });
    }
  };

  const filteredBookings = filterBookings();

  // Check if booking is eligible for 80% refund (2+ days before check-in and paid)
  const isEligibleForRefund = (booking) => {
    if (booking.payment_status !== "paid") return false;
    if (!["pending", "confirmed"].includes(booking.booking_status))
      return false;

    const checkInDate = new Date(booking.check_in_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkInDate.setHours(0, 0, 0, 0);

    const daysUntilCheckIn = Math.ceil(
      (checkInDate - today) / (1000 * 60 * 60 * 24)
    );
    return daysUntilCheckIn >= 2;
  };

  if (loading) {
    return (
      <PageContainer activePage="bookings">
        <LoadingSpinner text="Loading your bookings..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      activePage="bookings"
      title="My Bookings"
      subtitle="View and manage all your accommodation bookings"
      className="mt-4"
    >
      {bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Bookings Yet"
          description="Start exploring accommodations and make your first booking"
          action={() => navigate("/accommodations")}
          actionText="Browse Accommodations"
        />
      ) : (
        <>
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("current")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "current"
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Current Bookings
                  <span
                    className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === "current"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {
                      bookings.filter((booking) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const checkOutDate = new Date(booking.check_out_date);
                        checkOutDate.setHours(0, 0, 0, 0);
                        return (
                          booking.booking_status !== "cancelled" &&
                          (booking.booking_status === "pending" ||
                            booking.booking_status === "confirmed" ||
                            booking.booking_status === "checked_in" ||
                            checkOutDate >= today)
                        );
                      }).length
                    }
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("expired")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "expired"
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Expired & Cancelled
                  <span
                    className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === "expired"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {
                      bookings.filter((booking) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const checkOutDate = new Date(booking.check_out_date);
                        checkOutDate.setHours(0, 0, 0, 0);
                        return (
                          booking.booking_status === "cancelled" ||
                          (booking.booking_status === "checked_out" &&
                            checkOutDate < today) ||
                          (booking.booking_status !== "cancelled" &&
                            booking.booking_status !== "checked_in" &&
                            booking.booking_status !== "pending" &&
                            booking.booking_status !== "confirmed" &&
                            checkOutDate < today)
                        );
                      }).length
                    }
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={
                activeTab === "current"
                  ? "No Current Bookings"
                  : "No Expired or Cancelled Bookings"
              }
              description={
                activeTab === "current"
                  ? "You have no active bookings at the moment"
                  : "You have no past or cancelled bookings"
              }
            />
          ) : (
            <div className="grid gap-6">
              {filteredBookings.map((booking) => (
                <SectionCard key={booking.id}>
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Home className="text-emerald-600" size={24} />
                            <h2 className="text-2xl font-bold text-gray-800">
                              {booking.accommodation?.name}
                            </h2>
                          </div>
                          <p className="text-gray-600 font-mono text-sm">
                            Ref: {booking.booking_reference}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <StatusBadge
                            status={booking.booking_status}
                            type="booking"
                          />
                          <StatusBadge
                            status={booking.payment_status}
                            type="payment"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Room Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Home size={16} />
                            Room Details
                          </h3>
                          <p className="text-gray-800 font-medium">
                            {booking.room?.room_name}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Home size={14} />
                              {booking.number_of_rooms} room
                              {booking.number_of_rooms > 1 ? "s" : ""}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              {booking.number_of_guests} guest
                              {booking.number_of_guests > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        {/* Date Info */}
                        <div className="bg-emerald-50 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Calendar size={16} />
                            Stay Duration
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-700">
                              <span className="font-medium">Check-in:</span>{" "}
                              {new Date(
                                booking.check_in_date
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Check-out:</span>{" "}
                              {new Date(
                                booking.check_out_date
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Clock size={14} />
                              {booking.total_nights} night
                              {booking.total_nights > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Extra Services */}
                      {booking.services && booking.services.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Package size={16} />
                            Extra Services
                          </h3>
                          <ul className="space-y-1">
                            {booking.services.map((service) => (
                              <li
                                key={service.id}
                                className="text-sm text-gray-700 flex items-center justify-between"
                              >
                                <span>{service.service?.service_name}</span>
                                <span className="font-medium">
                                  Qty: {service.quantity}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Special Requests */}
                      {booking.special_requests && (
                        <div className="border-l-4 border-yellow-400 bg-yellow-50 rounded-r-lg p-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-1">
                            Special Requests:
                          </h3>
                          <p className="text-sm text-gray-700">
                            {booking.special_requests}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Sidebar with Price and Actions */}
                    <div className="lg:w-64 space-y-4">
                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                        <p className="text-emerald-600 font-bold text-m mb-1">
                          Total Amount
                        </p>
                        <p className="text-2xl text-emerald-700 flex items-start">
                          <IndianRupee size={24} className="mr-1 mt-1" />
                          {booking.total_amount}
                        </p>
                      </div>

                      {booking.payment_status === "unpaid" &&
                        (booking.booking_status === "pending" ||
                          booking.booking_status === "confirmed") && (
                          <button
                            onClick={() => handlePayNow(booking)}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition-all shadow-lg hover:shadow-xl"
                          >
                            <CreditCard size={18} />
                            Pay Now
                          </button>
                        )}

                      {isEligibleForRefund(booking) && (
                        <button
                          onClick={() => handleRefundBooking(booking.id)}
                          disabled={refundingId === booking.id}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-2 py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                        >
                          <CreditCard size={18} />
                          {refundingId === booking.id
                            ? "Processing Refund..."
                            : "Request Refund (80%)"}
                        </button>
                      )}

                      {(booking.booking_status === "pending" ||
                        booking.booking_status === "confirmed") &&
                        !isEligibleForRefund(booking) &&
                        booking.payment_status === "paid" && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 border-2 border-red-200 px-2 py-2 rounded-lg hover:bg-red-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <XCircle size={18} />
                            {cancellingId === booking.id
                              ? "Cancelling..."
                              : "Cancel Booking (No Refund)"}
                          </button>
                        )}

                      {booking.payment_status === "unpaid" &&
                        (booking.booking_status === "pending" ||
                          booking.booking_status === "confirmed") && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 border-2 border-red-200 px-4 py-3 rounded-lg hover:bg-red-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <XCircle size={18} />
                            {cancellingId === booking.id
                              ? "Cancelling..."
                              : "Cancel Booking"}
                          </button>
                        )}

                      <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Booked:</span>{" "}
                          {new Date(booking.created_at).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                        {booking.cancelled_at && (
                          <p className="text-red-600">
                            <span className="font-medium">Cancelled:</span>{" "}
                            {new Date(booking.cancelled_at).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              ))}
            </div>
          )}
        </>
      )}

      {paymentModalOpen && selectedBooking && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null, data: null })}
        onConfirm={() => {
          if (confirmModal.action === 'refund') executeRefundBooking();
          else if (confirmModal.action === 'cancel') executeCancelBooking();
        }}
        title={confirmModal.action === 'refund' ? 'Confirm Refund Request' : 'Confirm Cancellation'}
        message={
          confirmModal.action === 'refund'
            ? 'Are you sure you want to request a refund and cancel this booking? You will receive 80% of the booking amount.'
            : 'Are you sure you want to cancel this booking?'
        }
        confirmText="Yes, Proceed"
        cancelText="Cancel"
        confirmButtonColor="red"
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </PageContainer>
  );
};

export default MyBookings;
