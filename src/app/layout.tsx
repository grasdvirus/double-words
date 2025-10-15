
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { Notification } from "@/components/notification";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Double Words",
  description: "Le jeu où les lettres se répètent, mais jamais les idées.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <Providers>
          {children}
          <Toaster />
          <Notification />
        </Providers>
      </body>
    </html>
  );
}
