import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Car, MapPin, Clock, CreditCard, Navigation } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

const RideBooking: React.FC = () => {
  const { userData } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    pickup: '',
    destination: '',
    rideType: 'standard',
    scheduledTime: '',
    notes: ''
  });

  const rideTypes = [
    {
      id: 'economy',
      name: 'Economy',
      description: 'Affordable rides for everyday trips',
      price: 8.50,
      eta: '5-10 min',
      icon: '💰'
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Comfortable rides with reliable service',
      price: 12.00,
      eta: '3-8 min',
      icon: '🚗'
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Luxury vehicles with premium service',
      price: 18.50,
      eta: '5-12 min',
      icon: '✨'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const handleBookRide = async () => {
    if (!userData) return;

    setLoading(true);
    try {
      const selectedRideType = rideTypes.find(type => type.id === bookingData.rideType);
      
      await addDoc(collection(db, 'rides'), {
        userId: userData.uid,
        userEmail: userData.email,
        userName: userData.name,
        pickup: bookingData.pickup,
        destination: bookingData.destination,
        rideType: bookingData.rideType,
        fare: selectedRideType?.price || 0,
        scheduledTime: bookingData.scheduledTime ? new Date(bookingData.scheduledTime) : null,
        notes: bookingData.notes,
        status: 'requested',
        createdAt: serverTimestamp(),
        estimatedDuration: '15-25 min',
        estimatedArrival: selectedRideType?.eta || '5-10 min'
      });

      toast.success('Ride booked successfully!');
      setStep(3);
    } catch (error) {
      console.error('Error booking ride:', error);
      toast.error('Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setStep(1);
    setBookingData({
      pickup: '',
      destination: '',
      rideType: 'standard',
      scheduledTime: '',
      notes: ''
    });
  };

  if (step === 3) {
    return (
      <Layout title="Ride Booked">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ride Booked Successfully!</h2>
            <p className="text-gray-600 mb-8">
              Your ride has been requested. A driver will be assigned shortly and you'll receive a notification.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm font-medium text-gray-500">From</p>
                  <p className="font-semibold text-gray-900">{bookingData.pickup}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">To</p>
                  <p className="font-semibold text-gray-900">{bookingData.destination}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Ride Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{bookingData.rideType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estimated Fare</p>
                  <p className="font-semibold text-gray-900">
                    ${rideTypes.find(type => type.id === bookingData.rideType)?.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetBooking}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Another Ride
              </button>
              <button
                onClick={() => window.location.href = '/user'}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Book a Ride">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Locations</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Details</span>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Where are you going?</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="pickup"
                    value={bookingData.pickup}
                    onChange={handleInputChange}
                    placeholder="Enter pickup address..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="destination"
                    value={bookingData.destination}
                    onChange={handleInputChange}
                    placeholder="Enter destination address..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rideTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setBookingData({ ...bookingData, rideType: type.id })}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      bookingData.rideType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <h3 className="font-semibold text-gray-900">{type.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                      <div className="mt-3 space-y-1">
                        <p className="font-bold text-lg text-gray-900">${type.price}</p>
                        <p className="text-sm text-gray-500">{type.eta}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!bookingData.pickup || !bookingData.destination}
                className="w-full py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ride Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule for Later (Optional)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    name="scheduledTime"
                    value={bookingData.scheduledTime}
                    onChange={handleInputChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  name="notes"
                  value={bookingData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any special instructions for the driver..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">From:</span>
                    <span className="font-medium text-gray-900">{bookingData.pickup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium text-gray-900">{bookingData.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ride Type:</span>
                    <span className="font-medium text-gray-900 capitalize">{bookingData.rideType}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-semibold text-gray-900">Estimated Fare:</span>
                    <span className="font-bold text-gray-900">
                      ${rideTypes.find(type => type.id === bookingData.rideType)?.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleBookRide}
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Book Ride
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RideBooking;