import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// Trigger when a new ride is created
export const onRideCreated = functions.firestore
  .document('rides/{rideId}')
  .onCreate(async (snap, context) => {
    const rideData = snap.data();
    const rideId = context.params.rideId;

    try {
      // Find available drivers nearby (simplified logic)
      const driversSnapshot = await db.collection('users')
        .where('role', '==', 'driver')
        .where('isActive', '==', true)
        .limit(5)
        .get();

      if (!driversSnapshot.empty) {
        // Assign to first available driver
        const driverDoc = driversSnapshot.docs[0];
        const driverId = driverDoc.id;

        await snap.ref.update({
          driverId: driverId,
          status: 'assigned',
          assignedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Ride ${rideId} assigned to driver ${driverId}`);
      } else {
        console.log('No available drivers found');
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
    }
  });

// Trigger when a new snack order is created
export const onSnackOrderCreated = functions.firestore
  .document('snackOrders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderData = snap.data();
    const orderId = context.params.orderId;

    try {
      // Find available drivers for delivery
      const driversSnapshot = await db.collection('users')
        .where('role', '==', 'driver')
        .where('isActive', '==', true)
        .limit(5)
        .get();

      if (!driversSnapshot.empty) {
        // Assign to first available driver
        const driverDoc = driversSnapshot.docs[0];
        const driverId = driverDoc.id;

        await snap.ref.update({
          driverId: driverId,
          status: 'preparing',
          assignedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Snack order ${orderId} assigned to driver ${driverId}`);
      } else {
        console.log('No available drivers found for delivery');
      }
    } catch (error) {
      console.error('Error assigning delivery driver:', error);
    }
  });

// HTTP function to get ride statistics
export const getRideStats = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const ridesSnapshot = await db.collection('rides').get();
    const snackOrdersSnapshot = await db.collection('snackOrders').get();

    const stats = {
      totalRides: ridesSnapshot.size,
      totalOrders: snackOrdersSnapshot.size,
      totalRevenue: 0,
      activeRides: 0,
      completedRides: 0
    };

    ridesSnapshot.forEach(doc => {
      const data = doc.data();
      stats.totalRevenue += data.fare || 0;
      if (data.status === 'in_progress') stats.activeRides += 1;
      if (data.status === 'completed') stats.completedRides += 1;
    });

    snackOrdersSnapshot.forEach(doc => {
      const data = doc.data();
      stats.totalRevenue += data.total || 0;
    });

    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// HTTP function to update ride status
export const updateRideStatus = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { rideId, status, driverId } = req.body;

    if (!rideId || !status) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const updateData: any = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (status === 'in_progress') {
      updateData.startedAt = admin.firestore.FieldValue.serverTimestamp();
    } else if (status === 'completed') {
      updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await db.collection('rides').doc(rideId).update(updateData);

    res.json({ success: true, message: 'Ride status updated' });
  } catch (error) {
    console.error('Error updating ride status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});