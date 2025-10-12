'use client';
import {
  Auth,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

export function signInWithGoogle(auth: Auth) {
  // Utilise la redirection, qui est plus fiable en production et sur mobile
  signInWithRedirect(auth, provider).catch(error => {
    console.error("Erreur de redirection de connexion Google : ", error);
  });
}

export function signOut(auth: Auth) {
  return firebaseSignOut(auth);
}
