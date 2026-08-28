import "./globals.css";
import Navbar from "@/components/Navbar";
import WorkoutPlayer from "@/components/WorkoutPlayer";
import GlobalModals from "@/components/GlobalModals";
import { AuthProvider } from "@/context/AuthContext";
import { FitnessProvider } from "@/context/FitnessContext";

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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
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
