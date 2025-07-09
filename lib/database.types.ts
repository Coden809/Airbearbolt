export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: 'user' | 'driver' | 'admin'
          avatar_url: string | null
          is_active: boolean
          terms_accepted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          role?: 'user' | 'driver' | 'admin'
          avatar_url?: string | null
          is_active?: boolean
          terms_accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'user' | 'driver' | 'admin'
          avatar_url?: string | null
          is_active?: boolean
          terms_accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          license_number: string
          license_expiry: string
          background_check_status: string
          background_check_date: string | null
          rating: number
          total_rides: number
          is_online: boolean
          current_location: unknown | null
          last_location_update: string | null
          verification_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          license_number: string
          license_expiry: string
          background_check_status?: string
          background_check_date?: string | null
          rating?: number
          total_rides?: number
          is_online?: boolean
          current_location?: unknown | null
          last_location_update?: string | null
          verification_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          license_number?: string
          license_expiry?: string
          background_check_status?: string
          background_check_date?: string | null
          rating?: number
          total_rides?: number
          is_online?: boolean
          current_location?: unknown | null
          last_location_update?: string | null
          verification_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          driver_id: string
          make: string
          model: string
          year: number
          color: string
          license_plate: string
          vehicle_type: 'sedan' | 'suv' | 'hatchback' | 'motorcycle'
          insurance_expiry: string
          registration_expiry: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          driver_id: string
          make: string
          model: string
          year: number
          color: string
          license_plate: string
          vehicle_type: 'sedan' | 'suv' | 'hatchback' | 'motorcycle'
          insurance_expiry: string
          registration_expiry: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          driver_id?: string
          make?: string
          model?: string
          year?: number
          color?: string
          license_plate?: string
          vehicle_type?: 'sedan' | 'suv' | 'hatchback' | 'motorcycle'
          insurance_expiry?: string
          registration_expiry?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      gps_spots: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string
          location: unknown
          spot_type: string
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address: string
          location: unknown
          spot_type?: string
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string
          location?: unknown
          spot_type?: string
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rides: {
        Row: {
          id: string
          user_id: string
          driver_id: string | null
          pickup_location: unknown
          pickup_address: string
          dropoff_location: unknown
          dropoff_address: string
          pickup_spot_id: string | null
          dropoff_spot_id: string | null
          ride_type: string
          status: 'requested' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          fare_amount: number | null
          distance_km: number | null
          estimated_duration: number | null
          actual_duration: number | null
          scheduled_time: string | null
          assigned_at: string | null
          started_at: string | null
          completed_at: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          special_instructions: string | null
          rating: number | null
          feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          driver_id?: string | null
          pickup_location: unknown
          pickup_address: string
          dropoff_location: unknown
          dropoff_address: string
          pickup_spot_id?: string | null
          dropoff_spot_id?: string | null
          ride_type?: string
          status?: 'requested' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          fare_amount?: number | null
          distance_km?: number | null
          estimated_duration?: number | null
          actual_duration?: number | null
          scheduled_time?: string | null
          assigned_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          special_instructions?: string | null
          rating?: number | null
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          driver_id?: string | null
          pickup_location?: unknown
          pickup_address?: string
          dropoff_location?: unknown
          dropoff_address?: string
          pickup_spot_id?: string | null
          dropoff_spot_id?: string | null
          ride_type?: string
          status?: 'requested' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          fare_amount?: number | null
          distance_km?: number | null
          estimated_duration?: number | null
          actual_duration?: number | null
          scheduled_time?: string | null
          assigned_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          special_instructions?: string | null
          rating?: number | null
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      snacks: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: string
          image_url: string | null
          ingredients: string[] | null
          allergens: string[] | null
          nutritional_info: Json | null
          preparation_time: number
          is_available: boolean
          stock_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category: string
          image_url?: string | null
          ingredients?: string[] | null
          allergens?: string[] | null
          nutritional_info?: Json | null
          preparation_time?: number
          is_available?: boolean
          stock_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string
          image_url?: string | null
          ingredients?: string[] | null
          allergens?: string[] | null
          nutritional_info?: Json | null
          preparation_time?: number
          is_available?: boolean
          stock_quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      snack_orders: {
        Row: {
          id: string
          user_id: string
          driver_id: string | null
          delivery_address: string
          delivery_location: unknown | null
          items: Json
          subtotal: number
          delivery_fee: number
          tax_amount: number
          total_amount: number
          status: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
          estimated_delivery_time: string | null
          assigned_at: string | null
          prepared_at: string | null
          picked_up_at: string | null
          delivered_at: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          special_instructions: string | null
          rating: number | null
          feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          driver_id?: string | null
          delivery_address: string
          delivery_location?: unknown | null
          items: Json
          subtotal: number
          delivery_fee?: number
          tax_amount?: number
          total_amount: number
          status?: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
          estimated_delivery_time?: string | null
          assigned_at?: string | null
          prepared_at?: string | null
          picked_up_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          special_instructions?: string | null
          rating?: number | null
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          driver_id?: string | null
          delivery_address?: string
          delivery_location?: unknown | null
          items?: Json
          subtotal?: number
          delivery_fee?: number
          tax_amount?: number
          total_amount?: number
          status?: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
          estimated_delivery_time?: string | null
          assigned_at?: string | null
          prepared_at?: string | null
          picked_up_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          special_instructions?: string | null
          rating?: number | null
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          ride_id: string | null
          order_id: string | null
          stripe_payment_intent_id: string | null
          amount: number
          currency: string
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          payment_method: string | null
          transaction_fee: number | null
          net_amount: number | null
          processed_at: string | null
          refunded_at: string | null
          refund_amount: number | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ride_id?: string | null
          order_id?: string | null
          stripe_payment_intent_id?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          payment_method?: string | null
          transaction_fee?: number | null
          net_amount?: number | null
          processed_at?: string | null
          refunded_at?: string | null
          refund_amount?: number | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ride_id?: string | null
          order_id?: string | null
          stripe_payment_intent_id?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          payment_method?: string | null
          transaction_fee?: number | null
          net_amount?: number | null
          processed_at?: string | null
          refunded_at?: string | null
          refund_amount?: number | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          data: Json | null
          is_read: boolean
          read_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          data?: Json | null
          is_read?: boolean
          read_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          data?: Json | null
          is_read?: boolean
          read_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_nearby_drivers: {
        Args: {
          pickup_lat: number
          pickup_lon: number
          radius_km?: number
        }
        Returns: {
          driver_id: string
          distance_km: number
          rating: number
          total_rides: number
        }[]
      }
      calculate_distance: {
        Args: {
          lat1: number
          lon1: number
          lat2: number
          lon2: number
        }
        Returns: number
      }
    }
    Enums: {
      user_role: 'user' | 'driver' | 'admin'
      ride_status: 'requested' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
      order_status: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
      vehicle_type: 'sedan' | 'suv' | 'hatchback' | 'motorcycle'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}