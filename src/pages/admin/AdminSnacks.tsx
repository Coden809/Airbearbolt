import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Coffee, Search, Plus, Edit, Trash2, Package } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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

const AdminSnacks: React.FC = () => {
  const [snacks, setSnacks] = useState<SnackItem[]>([]);
  const [filteredSnacks, setFilteredSnacks] = useState<SnackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSnack, setEditingSnack] = useState<SnackItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'snacks',
    image: '',
    rating: 4.5,
    prepTime: '5 min',
    available: true
  });

  const categories = ['all', 'beverages', 'snacks', 'desserts', 'healthy'];

  useEffect(() => {
    fetchSnacks();
  }, []);

  useEffect(() => {
    filterSnacks();
  }, [snacks, searchTerm, categoryFilter]);

  const fetchSnacks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'snacks'));
      const snacksData: SnackItem[] = [];

      querySnapshot.forEach((doc) => {
        snacksData.push({ id: doc.id, ...doc.data() } as SnackItem);
      });

      setSnacks(snacksData);
    } catch (error) {
      console.error('Error fetching snacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSnacks = () => {
    let filtered = snacks;

    if (searchTerm) {
      filtered = filtered.filter(snack =>
        snack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snack.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(snack => snack.category === categoryFilter);
    }

    setFilteredSnacks(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSnack) {
        // Update existing snack
        await updateDoc(doc(db, 'snacks', editingSnack.id), formData);
        setSnacks(snacks.map(snack => 
          snack.id === editingSnack.id 
            ? { ...snack, ...formData }
            : snack
        ));
        toast.success('Snack updated successfully');
      } else {
        // Add new snack
        const docRef = await addDoc(collection(db, 'snacks'), formData);
        setSnacks([...snacks, { id: docRef.id, ...formData } as SnackItem]);
        toast.success('Snack added successfully');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving snack:', error);
      toast.error('Failed to save snack');
    }
  };

  const handleEdit = (snack: SnackItem) => {
    setEditingSnack(snack);
    setFormData({
      name: snack.name,
      description: snack.description,
      price: snack.price,
      category: snack.category,
      image: snack.image,
      rating: snack.rating,
      prepTime: snack.prepTime,
      available: snack.available
    });
    setShowModal(true);
  };

  const handleDelete = async (snackId: string) => {
    if (!confirm('Are you sure you want to delete this snack?')) return;

    try {
      await deleteDoc(doc(db, 'snacks', snackId));
      setSnacks(snacks.filter(snack => snack.id !== snackId));
      toast.success('Snack deleted successfully');
    } catch (error) {
      console.error('Error deleting snack:', error);
      toast.error('Failed to delete snack');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'snacks',
      image: '',
      rating: 4.5,
      prepTime: '5 min',
      available: true
    });
    setEditingSnack(null);
    setShowModal(false);
  };

  const sampleImages = [
    'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/6802025/pexels-photo-6802025.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=300'
  ];

  return (
    <Layout title="Snack Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Snack Management</h2>
              <p className="text-gray-600">Manage your snack menu and inventory</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Snack
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search snacks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <div className="text-sm text-gray-600 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Total Items: {snacks.length}
            </div>
          </div>
        </div>

        {/* Snacks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : filteredSnacks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Coffee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No snacks found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or add a new snack
              </p>
            </div>
          ) : (
            filteredSnacks.map((snack) => (
              <div key={snack.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <img
                  src={snack.image}
                  alt={snack.name}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{snack.name}</h3>
                    <span className="text-lg font-bold text-blue-600">${snack.price.toFixed(2)}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{snack.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      snack.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {snack.available ? 'Available' : 'Out of Stock'}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">{snack.category}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(snack)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(snack.id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingSnack ? 'Edit Snack' : 'Add New Snack'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="beverages">Beverages</option>
                      <option value="snacks">Snacks</option>
                      <option value="desserts">Desserts</option>
                      <option value="healthy">Healthy</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prep Time
                    </label>
                    <input
                      type="text"
                      value={formData.prepTime}
                      onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 5 min"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-2">Or choose from sample images:</p>
                    <div className="grid grid-cols-6 gap-2">
                      {sampleImages.map((img, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData({ ...formData, image: img })}
                          className="w-full h-12 rounded border-2 border-gray-200 hover:border-blue-500 overflow-hidden"
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available</span>
                  </label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingSnack ? 'Update Snack' : 'Add Snack'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminSnacks;