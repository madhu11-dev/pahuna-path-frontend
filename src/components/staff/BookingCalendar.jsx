import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast } from 'react-toastify';
import { getBookingsApi, updateBookingStatusApi } from '../../apis/Api';
import BookingDetailsModal from './BookingDetailsModal';
import ConfirmationModal from '../ConfirmationModal';

const BookingCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getBookingsApi();
      if (response.status) {
        const calendarEvents = response.data.map(booking => {
          let color = '#3b82f6'; // blue for confirmed
          
          if (booking.booking_status === 'pending') color = '#f59e0b'; // orange
          if (booking.booking_status === 'cancelled') color = '#ef4444'; // red

          return {
            id: booking.id,
            title: `${booking.booking_reference} - ${booking.accommodation?.name || 'N/A'}`,
            start: booking.check_in_date,
            end: booking.check_out_date,
            backgroundColor: color,
            borderColor: color,
            extendedProps: {
              booking: booking
            }
          };
        });
        setEvents(calendarEvents);
      }
    } catch (error) {
      toast.error('Failed to load bookings');
      console.error(error);
    }
    setLoading(false);
  };

  const handleEventClick = (info) => {
    const booking = info.event.extendedProps.booking;
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCancelBooking = () => {
    if (!selectedBooking) return;
    setConfirmModal({ isOpen: true });
  };

  const executeCancelBooking = async () => {
    setConfirmModal({ isOpen: false });
    setCancelling(true);
    try {
      const response = await updateBookingStatusApi(selectedBooking.id, {
        booking_status: 'cancelled'
      });

      if (response.status) {
        const refundAmount = response.data?.refund_amount || 0;
        if (refundAmount > 0) {
          toast.success(`Booking cancelled successfully. Refund of Rs. ${refundAmount.toFixed(2)} will be processed.`);
        } else {
          toast.success('Booking cancelled successfully');
        }
        setShowModal(false);
        setSelectedBooking(null);
        fetchBookings(); // Refresh calendar
      } else {
        toast.error(response.message || 'Failed to cancel booking');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
      console.error(error);
    }
    setCancelling(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Calendar</h2>

      <div className="mb-4 flex gap-4 flex-wrap text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
          <span>Cancelled</span>
        </div>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        eventClick={handleEventClick}
        height="auto"
        editable={false}
        selectable={false}
      />

      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={showModal}
        onClose={closeModal}
        onCancel={handleCancelBooking}
        isCancelling={cancelling}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={executeCancelBooking}
        title="Cancel Booking with Refund"
        message={`Are you sure you want to cancel booking ${selectedBooking?.booking_reference}? The customer will receive an 80% refund if the booking was paid.`}
        confirmText="Yes, Cancel & Refund"
        cancelText="No, Keep Booking"
        confirmButtonColor="red"
      />
    </div>
  );
};

export default BookingCalendar;


