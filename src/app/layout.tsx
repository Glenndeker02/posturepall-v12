import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "SpineMate - Your Personal Posture Coach",
  description: "AI-powered real-time posture monitoring for your workspace. Get instant feedback, guided stretches, and build lasting healthy habits.",
  keywords: ["SpineMate", "posture", "health", "AI", "monitoring", "wellness"],
  authors: [{ name: "SpineMate Team" }],
  openGraph: {
    title: "SpineMate - Your Personal Posture Coach",
    description: "AI-powered real-time posture monitoring for your workspace",
    url: "https://spinemate.app",
    siteName: "SpineMate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpineMate - Your Personal Posture Coach",
    description: "AI-powered real-time posture monitoring for your workspace",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased bg-background text-foreground font-sans"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navigation />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
