import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Car, MapPin, Clock, User, Phone } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Ride {
  id: string;
  userName: string;
  userEmail: string;
  pickup: string;
  destination: string;
  fare: number;
  rideType: string;
  status: string;
  createdAt: Date;
  notes?: string;
}

const DriverRides: React.FC = () => {
  const { userData } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      fetchRides();
    }
  }, [userData, filter]);

  const fetchRides = async () => {
    if (!userData) return;

    try {
      let q = query(
        collection(db, 'rides'),
        where('driverId', '==', userData.uid),
        orderBy('createdAt', 'desc')
      );

      if (filter !== 'all') {
        q = query(
          collection(db, 'rides'),
          where('driverId', '==', userData.uid),
          where('status', '==', filter),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const ridesData: Ride[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ridesData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Ride);
      });

      setRides(ridesData);
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  const updateRideStatus = async (rideId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'rides', rideId), {
        status: newStatus,
        updatedAt: new Date()
      });

      toast.success('Ride status updated');
      fetchRides();
    } catch (error) {
      console.error('Error updating ride status:', error);
      toast.error('Failed to update ride status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Rides' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <Layout title="My Rides">
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Ride History</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rides List */}
        <div className="bg-white rounded-xl shadow-sm border">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading rides...</p>
            </div>
          ) : rides.length === 0 ? (
            <div className="p-8 text-center">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No rides found</p>
              <p className="text-sm text-gray-400 mt-1">
                {filter === 'all' ? 'Your rides will appear here' : `No ${filter} rides found`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {rides.map((ride) => (
                <div key={ride.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{ride.userName}</p>
                          <p className="text-sm text-gray-500">{ride.userEmail}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                          {ride.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-green-500" />
                            <span><strong>From:</strong> {ride.pickup}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-red-500" />
                            <span><strong>To:</strong> {ride.destination}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2 text-blue-500" />
                            <span>{format(ride.createdAt, 'MMM d, yyyy h:mm a')}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Car className="w-4 h-4 mr-2 text-purple-500" />
                            <span className="capitalize">{ride.rideType} - ${ride.fare?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {ride.notes && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700">
                            <strong>Notes:</strong> {ride.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      {ride.status === 'assigned' && (
                        <button
                          onClick={() => updateRideStatus(ride.id, 'in_progress')}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Start Ride
                        </button>
                      )}
                      {ride.status === 'in_progress' && (
                        <button
                          onClick={() => updateRideStatus(ride.id, 'completed')}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Complete Ride
                        </button>
                      )}
                      {(ride.status === 'assigned' || ride.status === 'in_progress') && (
                        <button
                          onClick={() => updateRideStatus(ride.id, 'cancelled')}
                          className="px-4 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DriverRides;