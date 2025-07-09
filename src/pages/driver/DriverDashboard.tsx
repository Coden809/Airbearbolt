import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Car, Package, DollarSign, Clock, MapPin, TrendingUp } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

const DriverDashboard: React.FC = () => {
  const { userData } = useAuth();
  const [stats, setStats] = useState({
    totalRides: 0,
    totalEarnings: 0,
    activeRides: 0,
    totalDeliveries: 0
  });
  const [activeRides, setActiveRides] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      fetchDriverStats();
      fetchActiveRides();
    }
  }, [userData]);

  const fetchDriverStats = async () => {
    if (!userData) return;

    try {
      const ridesQuery = query(
        collection(db, 'rides'),
        where('driverId', '==', userData.uid)
      );
      
      const snackOrdersQuery = query(
        collection(db, 'snackOrders'),
        where('driverId', '==', userData.uid)
      );

      const [ridesSnapshot, snackOrdersSnapshot] = await Promise.all([
        getDocs(ridesQuery),
        getDocs(snackOrdersQuery)
      ]);

      let totalEarnings = 0;
      let totalRides = ridesSnapshot.size;
      let activeRides = 0;
      let totalDeliveries = snackOrdersSnapshot.size;

      ridesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'completed') {
          totalEarnings += (data.fare * 0.8) || 0; // 80% commission
        }
        if (data.status === 'in_progress' || data.status === 'assigned') {
          activeRides += 1;
        }
      });

      snackOrdersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'delivered') {
          totalEarnings += 5; // Fixed delivery fee
        }
      });

      setStats({
        totalRides,
        totalEarnings,
        activeRides,
        totalDeliveries
      });
    } catch (error) {
      console.error('Error fetching driver stats:', error);
    }
  };

  const fetchActiveRides = async () => {
    if (!userData) return;

    try {
      const ridesQuery = query(
        collection(db, 'rides'),
        where('driverId', '==', userData.uid),
        where('status', 'in', ['assigned', 'in_progress'])
      );

      const ridesSnapshot = await getDocs(ridesQuery);
      const rides: any[] = [];

      ridesSnapshot.forEach(doc => {
        rides.push({ id: doc.id, ...doc.data() });
      });

      setActiveRides(rides);
    } catch (error) {
      console.error('Error fetching active rides:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    if (!userData) return;

    setLoading(true);
    try {
      const newStatus = !isOnline;
      await updateDoc(doc(db, 'users', userData.uid), {
        isActive: newStatus,
        lastSeen: new Date()
      });

      setIsOnline(newStatus);
      toast.success(newStatus ? 'You are now online!' : 'You are now offline');
    } catch (error) {
      console.error('Error updating online status:', error);
      toast.error('Failed to update status');
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
      fetchActiveRides();
      fetchDriverStats();
    } catch (error) {
      console.error('Error updating ride status:', error);
      toast.error('Failed to update ride status');
    }
  };

  return (
    <Layout title="Driver Dashboard">
      <div className="space-y-8">
        {/* Status Toggle */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Driver Status</h3>
              <p className="text-gray-600">Toggle your availability to receive ride requests</p>
            </div>
            <button
              onClick={toggleOnlineStatus}
              disabled={loading}
              className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isOnline ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-10 w-10 transform rounded-full bg-white transition-transform ${
                  isOnline ? 'translate-x-12' : 'translate-x-1'
                }`}
              />
              <span className={`absolute text-sm font-medium ${
                isOnline ? 'left-2 text-white' : 'right-2 text-gray-600'
              }`}>
                {isOnline ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rides</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalRides}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+15%</span>
              <span className="text-gray-500 ml-1">from last week</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">${stats.totalEarnings.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+22%</span>
              <span className="text-gray-500 ml-1">from last week</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rides</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeRides}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Current active requests</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deliveries</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDeliveries}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+8%</span>
              <span className="text-gray-500 ml-1">from last week</span>
            </div>
          </div>
        </div>

        {/* Active Rides */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Rides</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {activeRides.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active rides</p>
                <p className="text-sm text-gray-400 mt-1">
                  {isOnline ? 'Waiting for ride requests...' : 'Go online to receive ride requests'}
                </p>
              </div>
            ) : (
              activeRides.map((ride) => (
                <div key={ride.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">{ride.userName}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ride.status === 'assigned' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ride.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-green-500" />
                          <span>From: {ride.pickup}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-red-500" />
                          <span>To: {ride.destination}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${ride.fare?.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{ride.rideType}</p>
                      </div>
                      <div className="flex space-x-2">
                        {ride.status === 'assigned' && (
                          <button
                            onClick={() => updateRideStatus(ride.id, 'in_progress')}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Start Ride
                          </button>
                        )}
                        {ride.status === 'in_progress' && (
                          <button
                            onClick={() => updateRideStatus(ride.id, 'completed')}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DriverDashboard;