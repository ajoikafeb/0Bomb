import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { BalanceProvider } from "@/components/balance/BalanceProvider";
import TopBar from "@/components/game/TopBar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "0GBomber — AI-Native Autonomous Bomber Game",
  description: "Hatch heroes, fight aliens, build bloodlines. An AI-native autonomous bomber game on 0G Galileo Testnet.",
  metadataBase: new URL("https://0gbomber.vercel.app"),
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "0GBomber",
    description: "AI-Native Autonomous Bomber Game on 0G",
    images: [{ url: "/logo.png", width: 512, height: 512 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-dark scanline">
        <WalletProvider>
          <BalanceProvider>
            <TopBar />
            <main className="flex-1 pt-12">{children}</main>
            <Footer />
          </BalanceProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
