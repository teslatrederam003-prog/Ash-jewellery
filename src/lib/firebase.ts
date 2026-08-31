import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific databaseId and long-polling configuration for resilient cloud connectivity
const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, dbId);

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
