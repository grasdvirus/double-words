
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useGame } from "@/hooks/use-game";
import { ArrowLeft, Eraser } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function SettingsPage() {
  const { settings, updateSettings, resetProgress } = useGame();
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8 max-w-2xl mx-auto animate-fade-in">
          
          <div className="relative mb-8 text-center">
            <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="absolute left-0 top-1/2 -translate-y-1/2 animate-fade-in-up"
            >
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Retour
            </Button>
            <h1 className="text-4xl font-bold text-primary">Paramètres</h1>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Thème</CardTitle>
                <CardDescription>Choisissez votre apparence préférée.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ThemeSwitcher />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jeu</CardTitle>
                <CardDescription>Gérez les options de langue et de son.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="language-select">Langue</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value: 'FR' | 'EN') => updateSettings({ language: value })}
                  >
                    <SelectTrigger id="language-select" className="w-[180px]">
                      <SelectValue placeholder="Langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FR">Français</SelectItem>
                      <SelectItem value="EN">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-switch">Effets sonores</Label>
                  <Switch
                    id="sound-switch"
                    checked={settings.enableSound}
                    onCheckedChange={(checked) => updateSettings({ enableSound: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progression</CardTitle>
                <CardDescription>Attention, cette action est irréversible. Elle réinitialisera votre niveau et votre score localement.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={resetProgress}>
                  <Eraser className="mr-2 h-4 w-4" />
                  Réinitialiser la progression
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
