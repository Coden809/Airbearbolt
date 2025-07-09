import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "your-firebase-api-key",
  authDomain: "your-firebase-project.firebaseapp.com",
  projectId: "your-firebase-project-id",
  storageBucket: "your-firebase-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-firebase-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;