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
};

export const metadata = {
  title: "FORGE — Calisthenics-First Fitness",
  description: "Own your bodyweight. Calisthenics first, hybrid always.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
