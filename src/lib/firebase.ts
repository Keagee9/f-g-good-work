import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'studio-2472646169-beca8',
  appId: '1:696866392485:web:66faa301873319d0c4c04c',
  storageBucket: 'studio-2472646169-beca8.firebasestorage.app',
  apiKey: 'AIzaSyCVMuTAzk9VZ4YC8CMn-skcHqQy_GFNPDw',
  authDomain: 'studio-2472646169-beca8.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '696866392485',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
