
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { GameProvider } from '@/contexts/game-context';

export const metadata: Metadata = {
  title: 'Double Words',
  description: 'Le jeu où les lettres se répètent, mais jamais les idées.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <FirebaseClientProvider>
          <GameProvider>
            {children}
          </GameProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

    