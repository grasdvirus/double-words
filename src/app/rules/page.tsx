
'use client';

import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Award, Star, TrendingUp, Gem, Trophy, ArrowLeft, Users, Calendar, Swords, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/use-translations";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


export default function RulesPage() {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8 max-w-4xl mx-auto animate-fade-in">
          
          <div className="relative mb-8 text-center">
            <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="absolute left-0 top-1/2 -translate-y-1/2 animate-fade-in-up"
            >
                <ArrowLeft className="mr-2 h-4 w-4"/>
                {t('back')}
            </Button>
            <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-4">
              <BookOpen className="h-8 w-8"/>
              {t('rules_title')}
            </h1>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            <Card>
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="p-6">
                  <CardTitle className="text-left flex items-center gap-4">
                    <Trophy className="text-primary h-6 w-6" />
                    Le But du Jeu
                  </CardTitle>
                </AccordionTrigger>
                <AccordionContent className="px-6">
                  <p className="text-lg text-muted-foreground">
                    À chaque niveau, vous devez trouver le mot secret à partir des lettres mélangées. Le mot doit également respecter la contrainte du défi (par exemple, contenir "CH").
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Card>

            <Card>
              <AccordionItem value="item-2" className="border-b-0">
                <AccordionTrigger className="p-6">
                  <CardTitle className="text-left flex items-center gap-4">
                     <Swords className="text-primary h-6 w-6" />
                    Modes de Jeu
                  </CardTitle>
                </AccordionTrigger>
                <AccordionContent className="px-6 space-y-6">
                   <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">Mode Défi</h3>
                    <p className="text-muted-foreground">Le mode principal. Enchaînez les niveaux, gagnez des points et grimpez dans le classement de la saison. Chaque seconde compte !</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">Mode Entraînement</h3>
                    <p className="text-muted-foreground">Parfait pour s'échauffer. Jouez sans la pression du chrono ni du score. Vos résultats ici n'affectent pas le classement.</p>
                  </div>
                   <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">Mode Duel (2 Joueurs)</h3>
                    <p className="text-muted-foreground">Créez une partie, partagez le code et affrontez un ami en temps réel. Le premier qui trouve le mot secret remporte le point. Le joueur avec le plus de points à la fin du temps imparti gagne !</p>
                  </div>
                   <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">Mode Tournois</h3>
                    <p className="text-muted-foreground">Testez vos connaissances sur des thèmes spécifiques (Football, etc.). Le but est de compléter tous les défis d'une catégorie. Le chrono et le score sont actifs, mais séparés du classement principal.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>

            <Card>
              <AccordionItem value="item-3" className="border-b-0">
                <AccordionTrigger className="p-6">
                  <CardTitle className="text-left flex items-center gap-4">
                     <Award className="text-primary h-6 w-6" />
                    Système de Points
                  </CardTitle>
                </AccordionTrigger>
                <AccordionContent className="px-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="text-accent h-6 w-6 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">{t('rules_scoring_correct')}</h3>
                      <p className="text-sm text-muted-foreground">{t('rules_scoring_correct_desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <TrendingUp className="text-blue-500 h-6 w-6 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">{t('rules_scoring_time')}</h3>
                      <p className="text-sm text-muted-foreground">{t('rules_scoring_time_desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <XCircle className="text-destructive h-6 w-6 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">{t('rules_scoring_error')}</h3>
                      <p className="text-sm text-muted-foreground">{t('rules_scoring_error_desc')}</p>
                    </div>
                  </div>
                   <div className="flex items-center gap-4">
                    <Star className="text-primary h-6 w-6 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">{t('rules_scoring_bonus')}</h3>
                      <p className="text-sm text-muted-foreground">{t('rules_scoring_bonus_desc')}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>

             <Card>
              <AccordionItem value="item-4" className="border-b-0">
                <AccordionTrigger className="p-6">
                  <CardTitle className="text-left flex items-center gap-4">
                     <Gem className="text-primary h-6 w-6" />
                    Saisons et Palmarès
                  </CardTitle>
                </AccordionTrigger>
                <AccordionContent className="px-6 space-y-4">
                  <p className="text-muted-foreground">
                    Le jeu fonctionne par saisons. À la fin de chaque saison (indiquée par le compte à rebours sur la page du classement), le classement est réinitialisé.
                  </p>
                   <p className="text-muted-foreground">
                    Si vous terminez sur le podium (1er, 2ème ou 3ème), vous pourrez vous rendre sur la page du classement pour réclamer votre récompense. Celle-ci sera ajoutée à votre "Palmarès", visible sur votre page de paramètres, immortalisant vos exploits !
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Card>

          </Accordion>
        </div>
      </main>
    </div>
  );
}
