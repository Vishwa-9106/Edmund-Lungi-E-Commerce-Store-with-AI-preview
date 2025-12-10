// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAYA1CmRDIYan8B7w8jGWiLVDiAS81Dtiw",
    authDomain: "edmund-lungi.firebaseapp.com",
    projectId: "edmund-lungi",
    storageBucket: "edmund-lungi.firebasestorage.app",
    messagingSenderId: "757821326336",
    appId: "1:757821326336:web:74623875ce41d1951d04e5",
    measurementId: "G-LL21W4H327"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Initialize Firestore with experimental long polling to avoid ad blocker issues
// This bypasses the WebChannel connection that ad blockers often block
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    }),
    experimentalForceLongPolling: true // This fixes ERR_BLOCKED_BY_CLIENT by using HTTP long-polling instead of WebChannel
});

export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
