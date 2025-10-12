'use client';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

/**
 * Ouvre une fenêtre pop-up pour la connexion avec Google.
 * @param auth L'instance d'authentification Firebase.
 */
export async function signInWithGoogle(auth: Auth): Promise<void> {
  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    // Si l'utilisateur ferme la fenêtre, une erreur est levée.
    // Nous ne voulons pas la traiter comme une erreur fatale, donc nous ne la propageons pas.
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('Connexion annulée par l\'utilisateur.');
      return;
    }
    // Pour les autres erreurs, nous les propageons pour qu'elles soient gérées.
    console.error("Erreur de connexion Google :", error);
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
