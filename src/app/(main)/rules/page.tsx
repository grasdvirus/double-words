import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Award, Star, TrendingUp, Gem } from "lucide-react";

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
              À chaque niveau, vous devez créer un mot ou une phrase qui respecte une contrainte spécifique, généralement l'inclusion d'une double lettre (comme "ee", "rr", etc.).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comment Jouer ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>1. Lisez la consigne du niveau affichée en haut de l'écran.</p>
            <p>2. Tapez votre mot ou phrase dans le champ de texte.</p>
            <p>3. Utilisez le clavier virtuel à l'écran ou votre propre clavier.</p>
            <p>4. Cliquez sur "Valider" pour soumettre votre réponse.</p>
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
                <p className="text-sm text-muted-foreground">Votre réponse respecte la consigne.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Star className="text-primary h-6 w-6" />
              <div>
                <h3 className="font-semibold">Bonus d'Originalité : +5 points</h3>
                <p className="text-sm text-muted-foreground">Le mot ou la phrase n'a jamais été utilisé auparavant.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <TrendingUp className="text-blue-500 h-6 w-6" />
               <div>
                <h3 className="font-semibold">Phrase longue (> 10 mots) : +5 points (Bonus Créativité)</h3>
                <p className="text-sm text-muted-foreground">Votre créativité est récompensée.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <XCircle className="text-destructive h-6 w-6" />
               <div>
                <h3 className="font-semibold">Erreur : -5 points</h3>
                <p className="text-sm text-muted-foreground">Ne baissez pas les bras !</p>
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
              Les défis deviennent de plus en plus complexes à mesure que vous montez de niveau. Attendez-vous à des doubles consonnes, des doubles voyelles, et même des lettres triplées ! Chaque 5 niveaux, l'ambiance visuelle et sonore change pour renouveler l'expérience.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center gap-4">
              <Award className="text-yellow-500 h-6 w-6" />
              <p><span className="font-semibold">Poète :</span> Validez 20 phrases.</p>
            </div>
            <div className="flex items-center gap-4">
              <Award className="text-slate-400 h-6 w-6" />
              <p><span className="font-semibold">Grammairien fou :</span> Trouvez 100 mots.</p>
            </div>
            <div className="flex items-center gap-4">
              <Gem className="text-primary h-6 w-6" />
              <p><span className="font-semibold">Lettre d’or :</span> Réalisez 10 combos parfaits consécutifs.</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
