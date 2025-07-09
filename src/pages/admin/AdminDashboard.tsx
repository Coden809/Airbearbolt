import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Users, Car, Coffee, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalRides: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeRides: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let totalUsers = 0;
      let totalDrivers = 0;

      usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.role === 'driver') {
          totalDrivers += 1;
        } else if (data.role === 'user') {
          totalUsers += 1;
        }
      });

      // Fetch rides
      const ridesSnapshot = await getDocs(collection(db, 'rides'));
      let totalRevenue = 0;
      let activeRides = 0;

      ridesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'completed') {
          totalRevenue += data.fare || 0;
        }
        if (data.status === 'in_progress' || data.status === 'assigned') {
          activeRides += 1;
        }
      });

      // Fetch snack orders
      const ordersSnapshot = await getDocs(collection(db, 'snackOrders'));
      let pendingOrders = 0;

      ordersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'delivered') {
          totalRevenue += data.total || 0;
        }
        if (data.status === 'pending' || data.status === 'preparing') {
          pendingOrders += 1;
        }
      });

      setStats({
        totalUsers,
        totalDrivers,
        totalRides: ridesSnapshot.size,
        totalOrders: ordersSnapshot.size,
        totalRevenue,
        activeRides,
        pendingOrders
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Drivers',
      value: stats.totalDrivers,
      icon: Car,
      color: 'bg-green-100 text-green-600',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-100 text-purple-600',
      change: '+25%',
      changeType: 'positive'
    },
    {
      title: 'Total Rides',
      value: stats.totalRides,
      icon: Activity,
      color: 'bg-orange-100 text-orange-600',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Snack Orders',
      value: stats.totalOrders,
      icon: Coffee,
      color: 'bg-pink-100 text-pink-600',
      change: '+30%',
      changeType: 'positive'
    },
    {
      title: 'Active Rides',
      value: stats.activeRides,
      icon: Car,
      color: 'bg-yellow-100 text-yellow-600',
      change: 'Real-time',
      changeType: 'neutral'
    }
  ];

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-blue-100">
            Monitor and manage your ride and snack delivery platform
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="mt-4 h-4 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    {stat.changeType === 'positive' && (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    )}
                    <span className={`${
                      stat.changeType === 'positive' ? 'text-green-500' : 
                      stat.changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {stat.change}
                    </span>
                    {stat.changeType !== 'neutral' && (
                      <span className="text-gray-500 ml-1">from last month</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                View All Users
              </button>
              <button className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                Manage Drivers
              </button>
              <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                View Reports
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">New user registered</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Ride completed</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Snack order delivered</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Driver went online</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Platform Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment System</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Notifications</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Working</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;