
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Users, Gamepad, KeyRound, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";


export default function DuelLobbyPage() {
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const handleJoinGame = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Vous devez être connecté pour rejoindre un duel.",
      });
      return;
    }

    if (!joinCode || joinCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Code invalide",
        description: "Veuillez entrer un code de partie à 6 caractères.",
      });
      return;
    }

    setIsJoining(true);

    try {
      const q = query(
        collection(firestore, "duels"),
        where("gameCode", "==", joinCode.toUpperCase()),
        where("status", "==", "waiting")
      );
      
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Partie non trouvée",
          description: "Aucune partie en attente avec ce code. Vérifiez le code et réessayez.",
        });
        setIsJoining(false);
        return;
      }

      const gameDoc = querySnapshot.docs[0];
      const gameData = gameDoc.data();

      if (gameData.hostId === user.uid) {
        toast({
          variant: "destructive",
          title: "Impossible de rejoindre",
          description: "Vous ne pouvez pas rejoindre votre propre partie.",
        });
        setIsJoining(false);
        return;
      }
      
      if (gameData.players.length >= 2) {
          toast({
             variant: "destructive",
             title: "Partie complète",
             description: "Cette partie a déjà deux joueurs.",
          });
          setIsJoining(false);
          return;
      }


      const player2 = {
        uid: user.uid,
        displayName: user.displayName || 'Anonyme',
        photoURL: user.photoURL || '',
      };

      await updateDoc(doc(firestore, "duels", gameDoc.id), {
        players: arrayUnion(player2),
        status: 'active'
      });
      
      // Redirection to the game page
      router.push(`/duel/play/${gameDoc.id}`);

    } catch (error) {
      console.error("Error joining duel:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue en tentant de rejoindre la partie.",
      });
      setIsJoining(false);
    }
  };


  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8 max-w-2xl mx-auto animate-fade-in">
          <h1 className="text-4xl font-bold text-primary mb-8 text-center flex items-center justify-center gap-4">
            <Users className="h-10 w-10" />
            Mode Duel
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Gamepad className="h-6 w-6 text-primary" />
                  Créer une partie
                </CardTitle>
                <CardDescription>
                  Créez une nouvelle salle de jeu et invitez un ami avec un code.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                <Button asChild className="w-full" disabled={isUserLoading}>
                  <Link href="/duel/create">
                    Créer et obtenir un code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <KeyRound className="h-6 w-6 text-primary" />
                  Rejoindre une partie
                </CardTitle>
                <CardDescription>
                  Entrez le code d'une partie existante pour rejoindre le duel.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end gap-4">
                 <Input 
                    placeholder="ENTREZ LE CODE" 
                    className="text-center text-lg h-12 tracking-widest font-mono" 
                    maxLength={6}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    disabled={isJoining || isUserLoading}
                  />
                 <Button className="w-full" onClick={handleJoinGame} disabled={isJoining || isUserLoading}>
                    {isJoining ? <Loader2 className="animate-spin" /> : "Rejoindre la partie"}
                    {!isJoining && <ArrowRight className="ml-2 h-4 w-4" />}
                 </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
