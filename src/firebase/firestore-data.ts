'use client';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

export async function saveScore(user: User, score: number) {
  if (!user) return;

  const db = getFirestore();
  const leaderboardRef = doc(db, 'leaderboard', user.uid);

  try {
    await setDoc(leaderboardRef, {
      displayName: user.displayName,
      photoURL: user.photoURL,
      score: score,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Error saving score to leaderboard: ", error);
    // Optionally, you can show a toast or notification to the user
  }
}
