import { useState, useEffect } from 'react';
// TODO: Uncomment after running npm install
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
import { toast } from 'react-toastify';
import { getBookingsApi } from '../../apis/Api';

const BookingCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
          if (booking.booking_status === 'checked_in') color = '#10b981'; // green
          if (booking.booking_status === 'checked_out') color = '#6b7280'; // gray
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
    
    const details = `
Booking Reference: ${booking.booking_reference}
Accommodation: ${booking.accommodation?.name || 'N/A'}
Room: ${booking.room?.room_name || 'N/A'}
Guest: ${booking.user?.name || 'N/A'}
Guests: ${booking.number_of_guests}
Status: ${booking.booking_status}
Payment: ${booking.payment_status}
Total: NPR ${booking.total_amount}
Check-in: ${new Date(booking.check_in_date).toLocaleDateString()}
Check-out: ${new Date(booking.check_out_date).toLocaleDateString()}
    `.trim();

    alert(details);
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
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
          <span>Checked In</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6b7280' }}></div>
          <span>Checked Out</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
          <span>Cancelled</span>
        </div>
      </div>

      {/* TODO: Uncomment after npm install */}
      {/*
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
      */}

      {/* Temporary list view until packages are installed */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700 mb-3">Upcoming Bookings</h3>
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bookings found</p>
        ) : (
          events.slice(0, 10).map((event) => (
            <div
              key={event.id}
              className="p-3 border rounded-lg hover:bg-gray-50"
              style={{ borderLeftWidth: '4px', borderLeftColor: event.backgroundColor }}
            >
              <div className="font-medium">{event.title}</div>
              <div className="text-sm text-gray-600">
                {new Date(event.start).toLocaleDateString()} - {new Date(event.end).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingCalendar;
