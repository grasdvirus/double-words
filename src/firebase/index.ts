
'use client';

import { firebaseConfig } from '@/firebase/client-config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// This object holds the initialized Firebase services.
let firebaseServices: {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} | null = null;


// This function initializes Firebase and returns the services.
// It ensures that initialization only happens once.
export function initializeFirebase() {
  if (firebaseServices) {
    return firebaseServices;
  }

  if (getApps().length === 0) {
    // Initialize the Firebase app with the provided config.
    const firebaseApp = initializeApp(firebaseConfig);
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);
    firebaseServices = { firebaseApp, auth, firestore };
  } else {
    // If the app is already initialized, get the existing services.
    const firebaseApp = getApp();
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);
    firebaseServices = { firebaseApp, auth, firestore };
  }

  return firebaseServices;
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';
