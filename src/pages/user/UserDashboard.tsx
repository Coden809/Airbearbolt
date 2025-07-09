import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Car, Coffee, Clock, MapPin, Star, TrendingUp } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';

interface RecentActivity {
  id: string;
  type: 'ride' | 'snack';
  status: string;
  createdAt: Date;
  amount: number;
  destination?: string;
  items?: { name: string; quantity: number }[];
}

const UserDashboard: React.FC = () => {
  const { userData } = useAuth();
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [stats, setStats] = useState({
    totalRides: 0,
    totalSpent: 0,
    avgRating: 4.8,
    totalOrders: 0
  });

  useEffect(() => {
    fetchRecentActivity();
    fetchStats();
  }, [userData]);

  const fetchRecentActivity = async () => {
    if (!userData) return;

    try {
      // Fetch recent rides
      const ridesQuery = query(
        collection(db, 'rides'),
        where('userId', '==', userData.uid),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      
      // Fetch recent snack orders
      const snacksQuery = query(
        collection(db, 'snackOrders'),
        where('userId', '==', userData.uid),
        orderBy('createdAt', 'desc'),
        limit(3)
      );

      const [ridesSnapshot, snacksSnapshot] = await Promise.all([
        getDocs(ridesQuery),
        getDocs(snacksQuery)
      ]);

      const activities: RecentActivity[] = [];

      ridesSnapshot.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'ride',
          status: data.status,
          createdAt: data.createdAt.toDate(),
          amount: data.fare,
          destination: data.destination
        });
      });

      snacksSnapshot.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'snack',
          status: data.status,
          createdAt: data.createdAt.toDate(),
          amount: data.total,
          items: data.items
        });
      });

      // Sort by date and take latest 5
      activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const fetchStats = async () => {
    if (!userData) return;

    try {
      const ridesQuery = query(
        collection(db, 'rides'),
        where('userId', '==', userData.uid)
      );
      
      const snacksQuery = query(
        collection(db, 'snackOrders'),
        where('userId', '==', userData.uid)
      );

      const [ridesSnapshot, snacksSnapshot] = await Promise.all([
        getDocs(ridesQuery),
        getDocs(snacksQuery)
      ]);

      let totalSpent = 0;
      let totalRides = ridesSnapshot.size;
      let totalOrders = snacksSnapshot.size;

      ridesSnapshot.forEach(doc => {
        totalSpent += doc.data().fare || 0;
      });

      snacksSnapshot.forEach(doc => {
        totalSpent += doc.data().total || 0;
      });

      setStats({
        totalRides,
        totalSpent,
        avgRating: 4.8,
        totalOrders
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <Layout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {userData?.name}!</h2>
          <p className="text-blue-100 mb-6">Ready for your next adventure? Book a ride or order some snacks.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/user/rides"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Car className="w-5 h-5 mr-2" />
              Book a Ride
            </Link>
            <Link
              to="/user/snacks"
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-400 transition-colors"
            >
              <Coffee className="w-5 h-5 mr-2" />
              Order Snacks
            </Link>
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
              <span className="text-green-500">+12%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+8%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Snack Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Coffee className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+25%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgRating}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-yellow-500">★★★★★</span>
              <span className="text-gray-500 ml-1">Excellent service</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400 mt-1">Your rides and orders will appear here</p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === 'ride' ? 'bg-blue-100' : 'bg-orange-100'
                      }`}>
                        {activity.type === 'ride' ? (
                          <Car className={`w-5 h-5 ${activity.type === 'ride' ? 'text-blue-600' : 'text-orange-600'}`} />
                        ) : (
                          <Coffee className={`w-5 h-5 ${activity.type === 'ride' ? 'text-blue-600' : 'text-orange-600'}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {activity.type === 'ride' ? 'Ride' : 'Snack Order'}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{format(activity.createdAt, 'MMM d, yyyy')}</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : activity.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {activity.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        {activity.destination && (
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>{activity.destination}</span>
                          </div>
                        )}
                        {activity.items && (
                          <div className="mt-1 text-sm text-gray-500">
                            {activity.items.map((item, index) => (
                              <span key={index}>
                                {item.quantity}x {item.name}
                                {index < activity.items!.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${activity.amount.toFixed(2)}</p>
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

export default UserDashboard;