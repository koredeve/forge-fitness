import "./globals.css";
import Navbar from "@/components/Navbar";
import WorkoutPlayer from "@/components/WorkoutPlayer";
import GlobalModals from "@/components/GlobalModals";
import { AuthProvider } from "@/context/AuthContext";
import { FitnessProvider } from "@/context/FitnessContext";
import { Inter, Archivo } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["800", "900"],
  display: "swap",
});

export const viewport = {
  themeColor: "#0b0d10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata = {
  metadataBase: new URL("https://forgecali.vercel.app"),
  title: "FORGE — Calisthenics-First Fitness",
  description: "Own your bodyweight. Calisthenics first, hybrid always. Progressive mastery ladders, photorealistic movement guides, and voice-coached training.",
  applicationName: "FORGE",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FORGE",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "FORGE Fitness",
    title: "FORGE — Calisthenics-First Fitness",
    description: "Own your bodyweight. Calisthenics first, hybrid always. Master progressive bodyweight skills.",
    images: [
      {
        url: "/banners/hero.jpg",
        width: 1200,
        height: 630,
        alt: "FORGE Fitness",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE — Calisthenics-First Fitness",
    description: "Own your bodyweight. Calisthenics first, hybrid always.",
    images: ["/banners/hero.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className}`}>
        <AuthProvider>
          <FitnessProvider>
            <Navbar />
            <main>{children}</main>
            <WorkoutPlayer />
            <GlobalModals />
          </FitnessProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
