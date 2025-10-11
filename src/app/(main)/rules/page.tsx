import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Award, Star, TrendingUp, Gem, Trophy } from "lucide-react";

export default function RulesPage() {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-primary mb-8 text-center">Règles du jeu</h1>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Le But du Jeu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              À chaque niveau, vous devez trouver le mot secret à partir des lettres mélangées. Le mot doit également respecter la contrainte du défi (par exemple, contenir "CH").
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comment Jouer ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>1. Lisez la consigne du niveau ("Défi") affichée en haut de l'écran.</p>
            <p>2. Utilisez les lettres disponibles dans la grille pour former votre mot dans les cases.</p>
            <p>3. Si vous vous trompez, utilisez le bouton retour pour effacer la dernière lettre.</p>
            <p>4. Une fois le mot complet, cliquez sur "Valider" pour soumettre votre réponse.</p>
            <p>5. Attention, vous avez 60 secondes pour trouver le mot !</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Système de Points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <CheckCircle className="text-accent h-6 w-6" />
              <div>
                <h3 className="font-semibold">Bonne réponse : +10 points</h3>
                <p className="text-sm text-muted-foreground">Vous avez trouvé le mot secret.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Star className="text-primary h-6 w-6" />
              <div>
                <h3 className="font-semibold">Bonus d'Originalité : +5 points</h3>
                <p className="text-sm text-muted-foreground">Ce bonus est accordé si l'IA juge votre réponse originale (non utilisé dans la version actuelle).</p>
              </div>
            </div>
             <div className="flex items-center gap-4">
              <TrendingUp className="text-blue-500 h-6 w-6" />
               <div>
                <h3 className="font-semibold">Bonus Temps : jusqu'à +6 points</h3>
                <p className="text-sm text-muted-foreground">Plus vous êtes rapide, plus vous gagnez de points.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <XCircle className="text-destructive h-6 w-6" />
               <div>
                <h3 className="font-semibold">Erreur / Temps écoulé : -5 / -10 points</h3>
                <p className="text-sm text-muted-foreground">Une mauvaise réponse ou le temps écoulé vous pénalise.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Les niveaux sont illimités ! Les défis changent à chaque niveau pour garder le jeu intéressant. Votre progression est sauvegardée localement, vous pouvez donc reprendre là où vous vous êtes arrêté.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center gap-4">
              <Trophy className="text-yellow-500 h-6 w-6" />
              <p>Connectez-vous avec votre compte Google pour que votre score soit enregistré et apparaisse dans le classement des meilleurs joueurs !</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
