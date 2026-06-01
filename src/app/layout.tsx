import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUserServer } from "@/lib/server-api";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Learn With — Find Open Projects to Contribute",
    template: "%s | Learn With",
  },
  description:
    "Discover incomplete open-source projects, clone them, and contribute by solving bugs or implementing improvements. Build real-world experience.",
  metadataBase: new URL("https://learnwith.parthpipaliya.com"),
  openGraph: {
    title: "Learn With — Find Open Projects to Contribute",
    description:
      "Discover incomplete open-source projects and contribute to build real-world experience.",
    type: "website",
    siteName: "Learn With",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentUserServer();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider initialProfile={profile}>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
