import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Coffee, Users, Smartphone, Shield, Zap } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Ride & Snack
              <span className="block text-yellow-400">On Demand</span>
            </h1>
            <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto">
              The ultimate platform for ride booking and snack delivery. 
              Fast, reliable, and available 24/7 with real-time tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Driver/Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive platform with features designed for users, drivers, and administrators
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Car className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Rides</h3>
              <p className="text-gray-600">
                Book rides instantly with real-time driver tracking and ETA updates. 
                Safe, reliable transportation whenever you need it.
              </p>
            </div>
            
            <div className="group p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Snack Delivery</h3>
              <p className="text-gray-600">
                Craving something delicious? Order from our curated selection of snacks 
                and get them delivered hot and fresh.
              </p>
            </div>
            
            <div className="group p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-Role Platform</h3>
              <p className="text-gray-600">
                Dedicated interfaces for users, drivers, and administrators. 
                Streamlined experience for every type of user.
              </p>
            </div>
            
            <div className="group p-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Mobile Ready</h3>
              <p className="text-gray-600">
                Responsive web app that works perfectly on all devices. 
                Native mobile apps available for download.
              </p>
            </div>
            
            <div className="group p-8 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure & Safe</h3>
              <p className="text-gray-600">
                Advanced security measures, verified drivers, and secure payment processing. 
                Your safety is our top priority.
              </p>
            </div>
            
            <div className="group p-8 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Updates</h3>
              <p className="text-gray-600">
                Live tracking, instant notifications, and real-time status updates. 
                Stay informed every step of the way.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of satisfied customers who trust us for their transportation and snack needs.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-10 py-4 border border-transparent text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Your Journey
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">RideSnack</span>
              </div>
              <p className="text-gray-400">
                The ultimate platform for on-demand rides and snack delivery. 
                Fast, reliable, and available 24/7.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Services</h3>
              <ul className="space-y-4 text-gray-400">
                <li>Ride Booking</li>
                <li>Snack Delivery</li>
                <li>Driver Registration</li>
                <li>Business Solutions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-4 text-gray-400">
                <li>Help Center</li>
                <li>Safety Guidelines</li>
                <li>Contact Us</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 RideSnack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;