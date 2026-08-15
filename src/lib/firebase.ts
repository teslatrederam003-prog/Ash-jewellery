import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Explicitly ensure browser local persistence for Auth
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase auth setPersistence notice:', err);
  });
} catch (err) {
  console.warn('Firebase auth setPersistence error:', err);
}

// Initialize Storage
export const storage = getStorage(app);

export default app;
