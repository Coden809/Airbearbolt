/*
  # Real-time Functions and Triggers

  1. Location Tracking
    - Update driver location
    - Notify nearby users of driver availability
    - Calculate ETA and distance

  2. Ride Management
    - Auto-assign drivers to rides
    - Update ride status
    - Send notifications

  3. Order Processing
    - Update order status
    - Notify drivers of new orders
    - Calculate delivery times
*/

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
BEGIN
  RETURN ST_Distance(
    ST_GeogFromText('POINT(' || lon1 || ' ' || lat1 || ')'),
    ST_GeogFromText('POINT(' || lon2 || ' ' || lat2 || ')')
  ) / 1000; -- Convert to kilometers
END;
$$ LANGUAGE plpgsql;

-- Function to find nearby drivers
CREATE OR REPLACE FUNCTION find_nearby_drivers(
  pickup_lat DOUBLE PRECISION,
  pickup_lon DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10
) RETURNS TABLE (
  driver_id UUID,
  distance_km DOUBLE PRECISION,
  rating DECIMAL,
  total_rides INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    ST_Distance(
      d.current_location,
      ST_GeogFromText('POINT(' || pickup_lon || ' ' || pickup_lat || ')')
    ) / 1000 AS distance_km,
    d.rating,
    d.total_rides
  FROM drivers d
  WHERE 
    d.is_online = true
    AND d.current_location IS NOT NULL
    AND ST_DWithin(
      d.current_location,
      ST_GeogFromText('POINT(' || pickup_lon || ' ' || pickup_lat || ')'),
      radius_km * 1000
    )
    AND NOT EXISTS (
      SELECT 1 FROM rides r 
      WHERE r.driver_id = d.id 
      AND r.status IN ('assigned', 'in_progress')
    )
  ORDER BY distance_km, d.rating DESC, d.total_rides DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign driver to ride
CREATE OR REPLACE FUNCTION auto_assign_driver()
RETURNS TRIGGER AS $$
DECLARE
  nearest_driver UUID;
  pickup_lat DOUBLE PRECISION;
  pickup_lon DOUBLE PRECISION;
BEGIN
  -- Extract coordinates from pickup location
  pickup_lat := ST_Y(NEW.pickup_location::geometry);
  pickup_lon := ST_X(NEW.pickup_location::geometry);
  
  -- Find the nearest available driver
  SELECT driver_id INTO nearest_driver
  FROM find_nearby_drivers(pickup_lat, pickup_lon, 15)
  LIMIT 1;
  
  -- If driver found, assign the ride
  IF nearest_driver IS NOT NULL THEN
    NEW.driver_id := nearest_driver;
    NEW.status := 'assigned';
    NEW.assigned_at := now();
    
    -- Create notification for driver
    INSERT INTO notifications (user_id, title, message, type, data)
    VALUES (
      nearest_driver,
      'New Ride Request',
      'You have been assigned a new ride request',
      'ride',
      jsonb_build_object('ride_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-assigning drivers
CREATE TRIGGER trigger_auto_assign_driver
  BEFORE INSERT ON rides
  FOR EACH ROW
  WHEN (NEW.status = 'requested')
  EXECUTE FUNCTION auto_assign_driver();

-- Function to update driver stats
CREATE OR REPLACE FUNCTION update_driver_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE drivers 
    SET 
      total_rides = total_rides + 1,
      rating = CASE 
        WHEN NEW.rating IS NOT NULL THEN 
          (rating * total_rides + NEW.rating) / (total_rides + 1)
        ELSE rating
      END
    WHERE id = NEW.driver_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating driver stats
CREATE TRIGGER trigger_update_driver_stats
  AFTER UPDATE ON rides
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_stats();

-- Function to send ride status notifications
CREATE OR REPLACE FUNCTION notify_ride_status_change()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Determine notification content based on status
  CASE NEW.status
    WHEN 'assigned' THEN
      notification_title := 'Driver Assigned';
      notification_message := 'A driver has been assigned to your ride';
    WHEN 'in_progress' THEN
      notification_title := 'Ride Started';
      notification_message := 'Your ride has started';
    WHEN 'completed' THEN
      notification_title := 'Ride Completed';
      notification_message := 'Your ride has been completed';
    WHEN 'cancelled' THEN
      notification_title := 'Ride Cancelled';
      notification_message := 'Your ride has been cancelled';
    ELSE
      RETURN NEW;
  END CASE;
  
  -- Send notification to user
  INSERT INTO notifications (user_id, title, message, type, data)
  VALUES (
    NEW.user_id,
    notification_title,
    notification_message,
    'ride',
    jsonb_build_object('ride_id', NEW.id, 'status', NEW.status)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ride status notifications
CREATE TRIGGER trigger_notify_ride_status
  AFTER UPDATE ON rides
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_ride_status_change();

-- Function to auto-assign delivery driver
CREATE OR REPLACE FUNCTION auto_assign_delivery_driver()
RETURNS TRIGGER AS $$
DECLARE
  nearest_driver UUID;
  delivery_lat DOUBLE PRECISION;
  delivery_lon DOUBLE PRECISION;
BEGIN
  -- Extract coordinates from delivery location
  delivery_lat := ST_Y(NEW.delivery_location::geometry);
  delivery_lon := ST_X(NEW.delivery_location::geometry);
  
  -- Find the nearest available driver
  SELECT driver_id INTO nearest_driver
  FROM find_nearby_drivers(delivery_lat, delivery_lon, 20)
  LIMIT 1;
  
  -- If driver found, assign the order
  IF nearest_driver IS NOT NULL THEN
    NEW.driver_id := nearest_driver;
    NEW.status := 'preparing';
    NEW.assigned_at := now();
    NEW.estimated_delivery_time := now() + INTERVAL '30 minutes';
    
    -- Create notification for driver
    INSERT INTO notifications (user_id, title, message, type, data)
    VALUES (
      nearest_driver,
      'New Delivery Order',
      'You have been assigned a new delivery order',
      'order',
      jsonb_build_object('order_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-assigning delivery drivers
CREATE TRIGGER trigger_auto_assign_delivery
  BEFORE INSERT ON snack_orders
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION auto_assign_delivery_driver();

-- Function to send order status notifications
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Determine notification content based on status
  CASE NEW.status
    WHEN 'preparing' THEN
      notification_title := 'Order Confirmed';
      notification_message := 'Your order is being prepared';
    WHEN 'ready' THEN
      notification_title := 'Order Ready';
      notification_message := 'Your order is ready for pickup';
    WHEN 'out_for_delivery' THEN
      notification_title := 'Out for Delivery';
      notification_message := 'Your order is on the way';
    WHEN 'delivered' THEN
      notification_title := 'Order Delivered';
      notification_message := 'Your order has been delivered';
    WHEN 'cancelled' THEN
      notification_title := 'Order Cancelled';
      notification_message := 'Your order has been cancelled';
    ELSE
      RETURN NEW;
  END CASE;
  
  -- Send notification to user
  INSERT INTO notifications (user_id, title, message, type, data)
  VALUES (
    NEW.user_id,
    notification_title,
    notification_message,
    'order',
    jsonb_build_object('order_id', NEW.id, 'status', NEW.status)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for order status notifications
CREATE TRIGGER trigger_notify_order_status
  AFTER UPDATE ON snack_orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_order_status_change();

-- Function to create audit log
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers to important tables
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_rides AFTER INSERT OR UPDATE OR DELETE ON rides FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE FUNCTION create_audit_log();