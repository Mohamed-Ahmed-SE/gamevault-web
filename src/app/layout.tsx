import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";
export const metadata: Metadata = { title: { default: "GameVault — Your games, remembered", template: "%s | GameVault" }, description: "Discover games, keep your personal library, and remember every playthrough." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><SiteHeader/><main>{children}</main><footer className="site-footer"><span>GAMEVAULT / YOUR PERSONAL GAME ARCHIVE</span><span>Built for the games worth remembering.</span></footer></body></html>; }
