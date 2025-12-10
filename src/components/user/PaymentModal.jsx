import KhaltiCheckout from "khalti-checkout-web";
import { CreditCard, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { verifyPaymentApi } from "../../apis/Api";

const PaymentModal = ({ isOpen, onClose, booking, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Initialize Khalti

    const config = {
      publicKey: process.env.REACT_APP_KHALTI_PUBLIC_KEY,
      productIdentity: booking.booking_reference,
      productName: `Booking - ${
        booking.accommodation?.name || "Accommodation"
      }`,
      productUrl: window.location.origin,
      eventHandler: {
        onSuccess: async (payload) => {
          console.log("Khalti payment success:", payload);
          await handlePaymentVerification(payload.token);
        },
        onError: (error) => {
          console.error("Khalti payment error:", error);
          toast.error("Payment failed. Please try again.");
          setIsProcessing(false);
        },
        onClose: () => {
          console.log("Khalti widget closed");
          setIsProcessing(false);
        },
      },
      paymentPreference: [
        "KHALTI",
        "EBANKING",
        "MOBILE_BANKING",
        "CONNECT_IPS",
        "SCT",
      ],
    };

    const checkout = new KhaltiCheckout(config);

    // Store checkout instance
    window.khaltiCheckout = checkout;

    return () => {
      window.khaltiCheckout = null;
    };
  }, [isOpen, booking]);

  const handlePaymentVerification = async (token) => {
    setIsProcessing(true);

    try {
      const response = await verifyPaymentApi({
        token: token,
        booking_id: booking.id,
      });

      // Backend returns booking directly in response, not nested under data
      if (response && response.booking) {
        toast.success("Payment successful! Booking confirmed.", {
          autoClose: 2000,
        });

        if (onPaymentSuccess) {
          onPaymentSuccess(response.booking);
        }

        onClose();

        // Reload page after a short delay to show updated booking status
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error("Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error(
        error.response?.data?.message || "Payment verification failed"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const initiatePayment = () => {
    if (!window.khaltiCheckout) {
      toast.error("Payment system not initialized");
      return;
    }

    setIsProcessing(true);

    // Amount should be in paisa (1 NPR = 100 paisa)
    const amountInPaisa = Math.round(booking.total_amount * 100);

    window.khaltiCheckout.show({ amount: amountInPaisa });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isProcessing}
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Payment
          </h2>
          <p className="text-gray-600">
            Booking Reference: {booking.booking_reference}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Accommodation:</span>
            <span className="font-medium text-gray-900">
              {booking.accommodation?.name || "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Check-in:</span>
            <span className="font-medium text-gray-900">
              {new Date(booking.check_in_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Check-out:</span>
            <span className="font-medium text-gray-900">
              {new Date(booking.check_out_date).toLocaleDateString()}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                Total Amount:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                NPR {parseFloat(booking.total_amount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={initiatePayment}
          disabled={isProcessing}
          className="w-full bg-emerald-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard size={20} />
              <span>Pay with Khalti</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment powered by Khalti. Your payment information is
          encrypted and secure.
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;
