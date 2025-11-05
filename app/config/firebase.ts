import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your Firebase config
// Get these values from Firebase Console > Project Settings > General
const firebaseConfig = {
  apiKey: "AIzaSyCoso8vP9ZY6fCGq3g-bgOyEdLDja9Dyo0",
  authDomain: "sarina-ai-2b2c1.firebaseapp.com",
  projectId: "sarina-ai-2b2c1",
  storageBucket: "sarina-ai-2b2c1.firebasestorage.app",
  messagingSenderId: "1051121433445",
  appId: "1:1051121433445:web:b3d60bb5ea0190e09c7f8c",
  measurementId: "G-SX1919QG46"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;
