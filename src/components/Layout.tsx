import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Car, 
  Coffee, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  MapPin,
  Package
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getNavItems = () => {
    if (!userData) return [];

    switch (userData.role) {
      case 'user':
        return [
          { path: '/user', icon: Home, label: 'Dashboard' },
          { path: '/user/rides', icon: Car, label: 'Book Ride' },
          { path: '/user/snacks', icon: Coffee, label: 'Order Snacks' },
        ];
      case 'driver':
        return [
          { path: '/driver', icon: Home, label: 'Dashboard' },
          { path: '/driver/rides', icon: MapPin, label: 'Rides' },
          { path: '/driver/deliveries', icon: Package, label: 'Deliveries' },
        ];
      case 'admin':
        return [
          { path: '/admin', icon: BarChart3, label: 'Dashboard' },
          { path: '/admin/users', icon: Users, label: 'Users' },
          { path: '/admin/rides', icon: Car, label: 'Rides' },
          { path: '/admin/snacks', icon: Coffee, label: 'Snacks' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white shadow-lg">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">RideSnack</span>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="px-4 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {userData?.role.toUpperCase()} PANEL
              </p>
            </div>
            <nav className="px-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {userData?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{userData?.name}</p>
                <p className="text-xs text-gray-500">{userData?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};