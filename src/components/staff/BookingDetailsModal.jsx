import { X, User, Home, Calendar, CreditCard, DollarSign , XCircle } from 'lucide-react';

const BookingDetailsModal = ({ booking, isOpen, onClose, onCancel, isCancelling }) => {
  if (!isOpen || !booking) return null;

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      checked_in: 'bg-green-100 text-green-800',
      checked_out: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Calculate days until check-in
  const getDaysUntilCheckIn = () => {
    const checkInDate = new Date(booking.check_in_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkInDate.setHours(0, 0, 0, 0);
    const diffTime = checkInDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilCheckIn = getDaysUntilCheckIn();
  const canCancel = daysUntilCheckIn >= 2 && booking.booking_status !== 'cancelled';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Booking Reference and Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Booking Reference</p>
              <p className="text-xl font-bold text-gray-900">{booking.booking_reference}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(booking.booking_status)}`}>
                {booking.booking_status.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                booking.payment_status === 'paid' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {booking.payment_status?.toUpperCase() || 'UNPAID'}
              </span>
            </div>
          </div>

          {/* Guest Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User size={20} className="text-gray-600" />
              <h4 className="font-semibold text-gray-900">Guest Information</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {booking.user?.name || 'N/A'}</p>
              <p><span className="font-medium">Email:</span> {booking.user?.email || 'N/A'}</p>
              <p><span className="font-medium">Number of Guests:</span> {booking.number_of_guests}</p>
            </div>
          </div>

          {/* Accommodation & Room */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Home size={20} className="text-gray-600" />
              <h4 className="font-semibold text-gray-900">Accommodation & Room</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Accommodation:</span> {booking.accommodation?.name || 'N/A'}</p>
              <p><span className="font-medium">Room:</span> {booking.room?.room_name || 'N/A'}</p>
              <p><span className="font-medium">Room Type:</span> {booking.room?.room_type || 'N/A'}</p>
              <p><span className="font-medium">Number of Rooms:</span> {booking.number_of_rooms}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={20} className="text-gray-600" />
              <h4 className="font-semibold text-gray-900">Stay Duration</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Check-in</p>
                <p className="font-semibold">{new Date(booking.check_in_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Check-out</p>
                <p className="font-semibold">{new Date(booking.check_out_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Total Nights: <span className="font-semibold">{booking.total_nights}</span></p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={20} className="text-gray-600" />
              <h4 className="font-semibold text-gray-900">Payment Details</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Room Subtotal:</span>
                <span className="font-semibold flex items-center">
                  <DollarSign  size={14} />
                  {parseFloat(booking.room_subtotal).toFixed(2)}
                </span>
              </div>
              {booking.services_subtotal > 0 && (
                <div className="flex justify-between">
                  <span>Services Subtotal:</span>
                  <span className="font-semibold flex items-center">
                    <DollarSign  size={14} />
                    {parseFloat(booking.services_subtotal).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-bold">Total Amount:</span>
                <span className="font-bold text-lg flex items-center text-emerald-600">
                  <DollarSign  size={18} />
                  {parseFloat(booking.total_amount).toFixed(2)}
                </span>
              </div>
              {booking.payment_method && (
                <p className="pt-2"><span className="font-medium">Payment Method:</span> {booking.payment_method.toUpperCase()}</p>
              )}
            </div>
          </div>

          {/* Special Requests */}
          {booking.special_requests && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Special Requests</h4>
              <p className="text-sm text-gray-700">{booking.special_requests}</p>
            </div>
          )}

          {/* Cancellation Info */}
          {booking.booking_status === 'cancelled' && booking.cancellation_reason && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="font-semibold text-red-900 mb-2">Cancellation Reason</h4>
              <p className="text-sm text-red-700">{booking.cancellation_reason}</p>
              {booking.cancelled_at && (
                <p className="text-xs text-red-600 mt-2">
                  Cancelled on: {new Date(booking.cancelled_at).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
          {canCancel && (
            <button
              onClick={onCancel}
              disabled={isCancelling}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  Cancel with Refund (80%)
                </>
              )}
            </button>
          )}
          {!canCancel && booking.booking_status !== 'cancelled' && daysUntilCheckIn < 2 && (
            <div className="text-sm text-gray-600 italic">
              Cannot cancel - less than 2 days until check-in
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
