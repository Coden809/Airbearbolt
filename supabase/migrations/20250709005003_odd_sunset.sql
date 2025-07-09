/*
  # Row Level Security Policies

  1. Profile Policies
    - Users can read/update their own profile
    - Admins can read/update all profiles
    - Public read access for basic driver info

  2. Driver Policies
    - Drivers can read/update their own data
    - Users can read basic driver info for assigned rides
    - Admins have full access

  3. Ride Policies
    - Users can create rides and read their own rides
    - Drivers can read assigned rides and update status
    - Admins have full access

  4. Payment Policies
    - Users can read their own payment history
    - Secure payment data access
    - Admins have full access for support
*/

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can read basic driver info" ON profiles
  FOR SELECT USING (
    role = 'driver' AND 
    is_active = true
  );

-- Drivers policies
CREATE POLICY "Drivers can read own data" ON drivers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Drivers can update own data" ON drivers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read assigned driver info" ON drivers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rides 
      WHERE driver_id = drivers.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all drivers" ON drivers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Vehicles policies
CREATE POLICY "Drivers can manage own vehicles" ON vehicles
  FOR ALL USING (auth.uid() = driver_id);

CREATE POLICY "Users can read vehicle info for rides" ON vehicles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rides 
      WHERE driver_id = vehicles.driver_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all vehicles" ON vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- GPS Spots policies
CREATE POLICY "Anyone can read active GPS spots" ON gps_spots
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage GPS spots" ON gps_spots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Rides policies
CREATE POLICY "Users can create rides" ON rides
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own rides" ON rides
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own rides" ON rides
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    status IN ('requested', 'assigned')
  );

CREATE POLICY "Drivers can read assigned rides" ON rides
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can update assigned rides" ON rides
  FOR UPDATE USING (
    auth.uid() = driver_id AND 
    status IN ('assigned', 'in_progress')
  );

CREATE POLICY "Admins can manage all rides" ON rides
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Snacks policies
CREATE POLICY "Anyone can read available snacks" ON snacks
  FOR SELECT USING (is_available = true);

CREATE POLICY "Admins can manage snacks" ON snacks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Snack Orders policies
CREATE POLICY "Users can create orders" ON snack_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own orders" ON snack_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own pending orders" ON snack_orders
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    status = 'pending'
  );

CREATE POLICY "Drivers can read assigned orders" ON snack_orders
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can update assigned orders" ON snack_orders
  FOR UPDATE USING (
    auth.uid() = driver_id AND 
    status IN ('ready', 'out_for_delivery')
  );

CREATE POLICY "Admins can manage all orders" ON snack_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payments policies
CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create payments" ON payments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notifications policies
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- Allow system to create notifications

CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Audit Logs policies
CREATE POLICY "Admins can read audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true); -- Allow system to create audit logs