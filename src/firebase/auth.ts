
'use client';
import {
  Auth,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

/**
 * Lance la connexion avec Google en utilisant une redirection.
 * Cette méthode est plus fiable sur les appareils mobiles et évite les problèmes de pop-ups.
 * @param auth L'instance d'authentification Firebase.
 */
export async function signInWithGoogle(auth: Auth): Promise<void> {
  try {
    // La redirection démarre ici. La résolution de la promesse a lieu
    // sur la page de redirection via onAuthStateChanged.
    await signInWithRedirect(auth, provider);
  } catch (error) {
    // Cette erreur se produit si la redirection ne peut pas être initiée.
    console.error("Erreur lors de l'initiation de la redirection Google :", error);
    // Nous propageons l'erreur pour qu'elle soit gérée par l'appelant (par ex. afficher un toast).
    throw error;
  }
}

/**
 * Déconnecte l'utilisateur actuel.
 * @param auth L'instance d'authentification Firebase.
 */
export function signOut(auth: Auth): Promise<void> {
  return firebaseSignOut(auth);
}
