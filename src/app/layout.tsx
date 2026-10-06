import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";
import "./home-experience.css";
import "./gamehub-theme.css";

export const metadata: Metadata = {
  title: {
    default: "GAMEHUB — Next-Gen Game Catalog & Tracker",
    template: "%s | GAMEHUB",
  },
  description:
    "Discover games, track your personal library, and explore upcoming releases powered by the RAWG API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main className="app-main">{children}</main>
        <footer className="site-footer app-footer">
          <span>GAMEHUB / YOUR PERSONAL GAMING ARCHIVE</span>
          <span>Powered by RAWG API.</span>
        </footer>
      </body>
    </html>
  );
}
