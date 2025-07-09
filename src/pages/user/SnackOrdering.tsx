import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Plus, Minus, Coffee, Clock, Star } from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

interface SnackItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  prepTime: string;
  available: boolean;
}

interface CartItem extends SnackItem {
  quantity: number;
}

const SnackOrdering: React.FC = () => {
  const { userData } = useAuth();
  const [snacks, setSnacks] = useState<SnackItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);

  const categories = ['all', 'beverages', 'snacks', 'desserts', 'healthy'];

  useEffect(() => {
    fetchSnacks();
  }, []);

  const fetchSnacks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'snacks'));
      const snacksData: SnackItem[] = [];
      
      querySnapshot.forEach((doc) => {
        snacksData.push({ id: doc.id, ...doc.data() } as SnackItem);
      });

      // If no snacks in database, use sample data
      if (snacksData.length === 0) {
        setSnacks(sampleSnacks);
      } else {
        setSnacks(snacksData);
      }
    } catch (error) {
      console.error('Error fetching snacks:', error);
      setSnacks(sampleSnacks);
    }
  };

  const sampleSnacks: SnackItem[] = [
    {
      id: '1',
      name: 'Classic Coffee',
      description: 'Rich, bold coffee made from premium beans',
      price: 4.50,
      category: 'beverages',
      image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=300',
      rating: 4.8,
      prepTime: '5 min',
      available: true
    },
    {
      id: '2',
      name: 'Chocolate Croissant',
      description: 'Buttery, flaky croissant with rich chocolate filling',
      price: 6.00,
      category: 'snacks',
      image: 'https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg?auto=compress&cs=tinysrgb&w=300',
      rating: 4.9,
      prepTime: '8 min',
      available: true
    },
    {
      id: '3',
      name: 'Fresh Fruit Bowl',
      description: 'Seasonal fresh fruits with honey drizzle',
      price: 8.50,
      category: 'healthy',
      image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=300',
      rating: 4.7,
      prepTime: '3 min',
      available: true
    },
    {
      id: '4',
      name: 'Iced Matcha Latte',
      description: 'Refreshing matcha with creamy milk over ice',
      price: 5.50,
      category: 'beverages',
      image: 'https://images.pexels.com/photos/6802025/pexels-photo-6802025.jpeg?auto=compress&cs=tinysrgb&w=300',
      rating: 4.6,
      prepTime: '6 min',
      available: true
    },
    {
      id: '5',
      name: 'Blueberry Muffin',
      description: 'Soft, fluffy muffin bursting with fresh blueberries',
      price: 4.00,
      category: 'snacks',
      image: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=300',
      rating: 4.5,
      prepTime: '2 min',
      available: true
    },
    {
      id: '6',
      name: 'Cheesecake Slice',
      description: 'Creamy New York style cheesecake with berry topping',
      price: 7.50,
      category: 'desserts',
      image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=300',
      rating: 4.9,
      prepTime: '1 min',
      available: true
    }
  ];

  const filteredSnacks = selectedCategory === 'all' 
    ? snacks 
    : snacks.filter(snack => snack.category === selectedCategory);

  const addToCart = (snack: SnackItem) => {
    const existingItem = cart.find(item => item.id === snack.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === snack.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...snack, quantity: 1 }]);
    }
    toast.success(`${snack.name} added to cart`);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => 
        item.id === id 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!userData || cart.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        userId: userData.uid,
        userEmail: userData.email,
        userName: userData.name,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: getTotalPrice(),
        status: 'pending',
        createdAt: serverTimestamp(),
        estimatedDelivery: '20-30 min'
      };

      await addDoc(collection(db, 'snackOrders'), orderData);
      
      toast.success('Order placed successfully!');
      setCart([]);
      setShowCart(false);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Order Snacks">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Delicious Snacks</h2>
            <p className="text-gray-600">Fresh snacks and beverages delivered to you</p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart ({getTotalItems()})
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {getTotalItems()}
              </span>
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Snacks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSnacks.map((snack) => (
            <div key={snack.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <img
                src={snack.image}
                alt={snack.name}
                className="w-full h-48 object-cover rounded-t-xl"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{snack.name}</h3>
                  <span className="text-xl font-bold text-blue-600">${snack.price.toFixed(2)}</span>
                </div>
                <p className="text-gray-600 mb-4">{snack.description}</p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{snack.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 ml-1">{snack.prepTime}</span>
                  </div>
                </div>

                <button
                  onClick={() => addToCart(snack)}
                  disabled={!snack.available}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Your Order</h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                        <span>Total:</span>
                        <span>${getTotalPrice().toFixed(2)}</span>
                      </div>
                      
                      <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg font-semibold"
                      >
                        {loading ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Coffee className="w-6 h-6 mr-2" />
                            Place Order
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SnackOrdering;