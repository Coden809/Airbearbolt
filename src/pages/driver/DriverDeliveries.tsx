import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Package, MapPin, Clock, User, Coffee } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Delivery {
  id: string;
  userName: string;
  userEmail: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  createdAt: Date;
  deliveryAddress?: string;
}

const DriverDeliveries: React.FC = () => {
  const { userData } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      fetchDeliveries();
    }
  }, [userData, filter]);

  const fetchDeliveries = async () => {
    if (!userData) return;

    try {
      let q = query(
        collection(db, 'snackOrders'),
        where('driverId', '==', userData.uid),
        orderBy('createdAt', 'desc')
      );

      if (filter !== 'all') {
        q = query(
          collection(db, 'snackOrders'),
          where('driverId', '==', userData.uid),
          where('status', '==', filter),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const deliveriesData: Delivery[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        deliveriesData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Delivery);
      });

      setDeliveries(deliveriesData);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (deliveryId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'snackOrders', deliveryId), {
        status: newStatus,
        updatedAt: new Date()
      });

      toast.success('Delivery status updated');
      fetchDeliveries();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error('Failed to update delivery status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Deliveries' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready for Pickup' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <Layout title="My Deliveries">
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Delivery History</h2>
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

        {/* Deliveries List */}
        <div className="bg-white rounded-xl shadow-sm border">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading deliveries...</p>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No deliveries found</p>
              <p className="text-sm text-gray-400 mt-1">
                {filter === 'all' ? 'Your deliveries will appear here' : `No ${filter} deliveries found`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{delivery.userName}</p>
                          <p className="text-sm text-gray-500">{delivery.userEmail}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                          {delivery.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2 text-blue-500" />
                            <span>{format(delivery.createdAt, 'MMM d, yyyy h:mm a')}</span>
                          </div>
                          {delivery.deliveryAddress && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-red-500" />
                              <span>{delivery.deliveryAddress}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            <strong>Total: ${delivery.total?.toFixed(2)}</strong>
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Delivery Fee: $5.00</strong>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Coffee className="w-4 h-4 mr-2" />
                          Order Items
                        </h4>
                        <div className="space-y-1">
                          {delivery.items?.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      {delivery.status === 'ready' && (
                        <button
                          onClick={() => updateDeliveryStatus(delivery.id, 'out_for_delivery')}
                          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Start Delivery
                        </button>
                      )}
                      {delivery.status === 'out_for_delivery' && (
                        <button
                          onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {(delivery.status === 'preparing' || delivery.status === 'ready' || delivery.status === 'out_for_delivery') && (
                        <button
                          onClick={() => updateDeliveryStatus(delivery.id, 'cancelled')}
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

export default DriverDeliveries;