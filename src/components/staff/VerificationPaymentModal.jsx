import React, { useState, useEffect } from 'react';
import { X, CreditCard, Shield } from 'lucide-react';
import KhaltiCheckout from 'khalti-checkout-web';
import { verifyVerificationPayment } from '../../apis/Api';
import { toast } from 'react-toastify';

const VerificationPaymentModal = ({ isOpen, onClose, accommodation, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen || !accommodation) return;

    // Initialize Khalti
    const config = {
      publicKey: process.env.REACT_APP_KHALTI_PUBLIC_KEY,
      productIdentity: `verification_${accommodation.id}`,
      productName: `Verification Fee - ${accommodation.name}`,
      productUrl: window.location.origin,
      eventHandler: {
        onSuccess: async (payload) => {
          console.log('Khalti payment success:', payload);
          await handlePaymentVerification(payload.token);
        },
        onError: (error) => {
          console.error('Khalti payment error:', error);
          toast.error('Payment failed. Please try again.');
          setIsProcessing(false);
        },
        onClose: () => {
          console.log('Khalti widget closed');
          setIsProcessing(false);
        }
      },
      paymentPreference: ["KHALTI", "EBANKING", "MOBILE_BANKING", "CONNECT_IPS", "SCT"],
    };

    const checkout = new KhaltiCheckout(config);
    
    // Store checkout instance
    window.verificationKhaltiCheckout = checkout;

    return () => {
      window.verificationKhaltiCheckout = null;
    };
    
  }, [isOpen, accommodation]);

  const handlePaymentVerification = async (token) => {
    setIsProcessing(true);
    
    try {
      console.log('Verifying payment with token:', token);
      console.log('Accommodation ID:', accommodation.id);
      
      const response = await verifyVerificationPayment(accommodation.id, {
        token: token
      });

      console.log('Payment verification response:', response);

      if (response.status) {
        toast.success('Verification fee paid successfully! Admin can now verify your accommodation.', { 
          autoClose: 3000 
        });
        
        if (onPaymentSuccess) {
          onPaymentSuccess(response.accommodation);
        }
        
        onClose();
      } else {
        console.error('Payment verification failed:', response);
        toast.error(response.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Payment verification failed';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const initiatePayment = () => {
    if (!window.verificationKhaltiCheckout) {
      toast.error('Payment system not initialized');
      return;
    }

    setIsProcessing(true);

    // Amount is Rs. 10 = 1000 paisa
    const amountInPaisa = 1000;

    window.verificationKhaltiCheckout.show({ amount: amountInPaisa });
  };

  if (!isOpen || !accommodation) return null;

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
            <Shield className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pay Verification Fee</h2>
          <p className="text-gray-600">Get your accommodation verified</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600">Accommodation:</span>
            <span className="font-medium text-gray-900">
              {accommodation.name}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium text-gray-900 capitalize">
              {accommodation.type}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600">Current Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              accommodation.is_verified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {accommodation.is_verified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Verification Fee:</span>
              <span className="text-2xl font-bold text-blue-600">
                NPR 10.00
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <Shield className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
            <div>
              <h4 className="font-semibold text-blue-900 text-sm mb-1">Why pay verification fee?</h4>
              <p className="text-xs text-blue-800">
                This one-time fee of Rs. 10 enables admin verification. Once verified, your accommodation 
                will be visible to users and you can start receiving bookings.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={initiatePayment}
          disabled={isProcessing}
          className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard size={20} />
              <span>Pay Rs. 10 with Khalti</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment powered by Khalti. Your payment information is encrypted and secure.
        </p>
      </div>
    </div>
  );
};

export default VerificationPaymentModal;
