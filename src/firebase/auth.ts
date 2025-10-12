
'use client';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

export function signInWithGoogle(auth: Auth) {
  signInWithPopup(auth, provider).catch(error => {
    // Gère l'erreur "popup-closed-by-user" qui se produit
    // lorsque l'utilisateur ferme la fenêtre de connexion.
    // Ce n'est pas une erreur critique, donc nous pouvons l'ignorer.
    if (error.code !== 'auth/popup-closed-by-user') {
      console.error(error);
    }
  });
}

export function signOut(auth: Auth) {
  return firebaseSignOut(auth);
}
