'use client';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

export function signInWithGoogle(auth: Auth) {
  return signInWithPopup(auth, provider);
}

export function signOut(auth: Auth) {
  return firebaseSignOut(auth);
}
