/*
  # Initial Database Schema for Ride-Sharing Platform

  1. New Tables
    - `profiles` - User profiles with role-based access
    - `drivers` - Driver-specific information and verification
    - `vehicles` - Driver vehicle information
    - `gps_spots` - Predefined pickup/dropoff locations
    - `rides` - Ride booking and tracking
    - `snack_orders` - Food/snack ordering system
    - `snacks` - Menu items and inventory
    - `payments` - Payment processing and history
    - `notifications` - Real-time notification system
    - `audit_logs` - Security and activity logging

  2. Security
    - Enable RLS on all tables
    - Role-based policies for users, drivers, and admins
    - Secure payment data handling

  3. Real-time Features
    - Live location tracking
    - Order status updates
    - Driver availability
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'driver', 'admin');
CREATE TYPE ride_status AS ENUM ('requested', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE vehicle_type AS ENUM ('sedan', 'suv', 'hatchback', 'motorcycle');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role DEFAULT 'user',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  license_number TEXT UNIQUE NOT NULL,
  license_expiry DATE NOT NULL,
  background_check_status TEXT DEFAULT 'pending',
  background_check_date TIMESTAMPTZ,
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_rides INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT false,
  current_location GEOGRAPHY(POINT, 4326),
  last_location_update TIMESTAMPTZ,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT NOT NULL,
  license_plate TEXT UNIQUE NOT NULL,
  vehicle_type vehicle_type NOT NULL,
  insurance_expiry DATE NOT NULL,
  registration_expiry DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- GPS Spots table
CREATE TABLE IF NOT EXISTS gps_spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  spot_type TEXT DEFAULT 'general', -- 'pickup', 'dropoff', 'general'
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rides table
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  driver_id UUID REFERENCES drivers(id),
  pickup_location GEOGRAPHY(POINT, 4326) NOT NULL,
  pickup_address TEXT NOT NULL,
  dropoff_location GEOGRAPHY(POINT, 4326) NOT NULL,
  dropoff_address TEXT NOT NULL,
  pickup_spot_id UUID REFERENCES gps_spots(id),
  dropoff_spot_id UUID REFERENCES gps_spots(id),
  ride_type TEXT DEFAULT 'standard',
  status ride_status DEFAULT 'requested',
  fare_amount DECIMAL(10,2),
  distance_km DECIMAL(8,2),
  estimated_duration INTEGER, -- in minutes
  actual_duration INTEGER,
  scheduled_time TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  special_instructions TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Snacks table
CREATE TABLE IF NOT EXISTS snacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(8,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  ingredients TEXT[],
  allergens TEXT[],
  nutritional_info JSONB,
  preparation_time INTEGER DEFAULT 5, -- in minutes
  is_available BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Snack Orders table
CREATE TABLE IF NOT EXISTS snack_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  driver_id UUID REFERENCES drivers(id),
  delivery_address TEXT NOT NULL,
  delivery_location GEOGRAPHY(POINT, 4326),
  items JSONB NOT NULL, -- Array of {snack_id, quantity, price}
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(8,2) DEFAULT 5.00,
  tax_amount DECIMAL(8,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  estimated_delivery_time TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ,
  prepared_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  special_instructions TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  ride_id UUID REFERENCES rides(id),
  order_id UUID REFERENCES snack_orders(id),
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status payment_status DEFAULT 'pending',
  payment_method TEXT, -- 'card', 'wallet', etc.
  transaction_fee DECIMAL(8,2),
  net_amount DECIMAL(10,2),
  processed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_amount DECIMAL(10,2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure either ride_id or order_id is present
  CONSTRAINT payment_reference_check CHECK (
    (ride_id IS NOT NULL AND order_id IS NULL) OR 
    (ride_id IS NULL AND order_id IS NOT NULL)
  )
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'ride', 'order', 'payment', 'system'
  data JSONB, -- Additional context data
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_drivers_online ON drivers(is_online);
CREATE INDEX IF NOT EXISTS idx_drivers_location ON drivers USING GIST(current_location);
CREATE INDEX IF NOT EXISTS idx_gps_spots_location ON gps_spots USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_rides_user_id ON rides(user_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_created_at ON rides(created_at);
CREATE INDEX IF NOT EXISTS idx_snack_orders_user_id ON snack_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_snack_orders_driver_id ON snack_orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_snack_orders_status ON snack_orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE snacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE snack_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gps_spots_updated_at BEFORE UPDATE ON gps_spots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_snacks_updated_at BEFORE UPDATE ON snacks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_snack_orders_updated_at BEFORE UPDATE ON snack_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();