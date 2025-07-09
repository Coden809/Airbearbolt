import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Real-time subscriptions helper
export const subscribeToRideUpdates = (rideId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`ride-${rideId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rides',
        filter: `id=eq.${rideId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToDriverLocation = (driverId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`driver-location-${driverId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'drivers',
        filter: `id=eq.${driverId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToOrderUpdates = (orderId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'snack_orders',
        filter: `id=eq.${orderId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToNotifications = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

// Location utilities
export const updateDriverLocation = async (driverId: string, latitude: number, longitude: number) => {
  const { error } = await supabase
    .from('drivers')
    .update({
      current_location: `POINT(${longitude} ${latitude})`,
      last_location_update: new Date().toISOString()
    })
    .eq('id', driverId)

  if (error) throw error
}

export const findNearbyDrivers = async (latitude: number, longitude: number, radiusKm: number = 10) => {
  const { data, error } = await supabase
    .rpc('find_nearby_drivers', {
      pickup_lat: latitude,
      pickup_lon: longitude,
      radius_km: radiusKm
    })

  if (error) throw error
  return data
}

// Authentication helpers
export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })

  if (error) throw error

  // Create profile after successful signup
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role || 'user',
        terms_accepted_at: new Date().toISOString()
      })

    if (profileError) throw profileError
  }

  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError
    return { user, profile }
  }

  return { user: null, profile: null }
}