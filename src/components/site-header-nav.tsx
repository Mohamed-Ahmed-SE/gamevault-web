"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, Compass, Gamepad2, Heart, House, LibraryBig, Settings } from "@/components/icons";
import type { GameVaultIcon } from "@/components/icons";
import { PLATFORMS } from "@/lib/games/platforms";

type NavigationItem = { href: string; label: string; section: string; icon: GameVaultIcon };

const navigationItems: NavigationItem[] = [
  { href: "/", label: "Home", section: "/", icon: House },
  { href: "/discover", label: "Discover", section: "/discover", icon: Compass },
  { href: "/library", label: "Library", section: "/library", icon: LibraryBig },
  { href: "/upcoming", label: "Upcoming", section: "/upcoming", icon: CalendarDays },
  { href: "/favorites", label: "Favorites", section: "/favorites", icon: Heart },
];

const platformLabels: Record<string, string> = {
  ps5: "PS5",
  ps4: "PS4",
  ps3: "PS3",
  ps2: "PS2",
  "xbox-series": "Xbox Series X|S",
  "xbox-one": "Xbox One",
  "nintendo-switch": "Nintendo Switch",
  pc: "PC",
};
const platforms = Object.entries(PLATFORMS).map(([slug, platform]) => ({ slug, ...platform }));

function isCurrentSection(pathname: string, section: string) {
  return section === "/"
    ? pathname === "/"
    : pathname === section || pathname.startsWith(`${section}/`);
}

function PrimaryNavigation({ pathname }: { pathname: string }) {
  return (
    <nav id="main-navigation" className="site-nav" aria-label="Main navigation">
      {navigationItems.map(({ href, label, section, icon: Icon }) => {
        const isCurrentPage = isCurrentSection(pathname, section);
        return (
          <Link
            key={label}
            href={href}
            className={`nav-link${isCurrentPage ? " nav-link-active" : ""}`}
            aria-label={label}
            title={label}
            aria-current={isCurrentPage ? "page" : undefined}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function PlatformNavigation({ pathname }: { pathname: string }) {
  return (
    <div className="platform-navigation">
      <h2 className="platform-navigation-heading">Platforms</h2>
      <nav className="platform-nav" aria-label="Browse by platform">
        {platforms.map(({ slug, name }) => {
          const isCurrentPage = pathname === `/discover/${slug}`;
          return (
            <Link
              key={slug}
              href={`/discover/${slug}`}
              className={`platform-nav-link${isCurrentPage ? " platform-nav-link-active" : ""}`}
              aria-current={isCurrentPage ? "page" : undefined}
              aria-label={`Browse ${name}`}
              title={name}
            >
              <span className="platform-nav-icon" aria-hidden="true"><Gamepad2 size={15} /></span>
              <span>{platformLabels[slug] ?? name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function SettingsNavigation({ pathname }: { pathname: string }) {
  const isCurrentPage = pathname.startsWith("/settings");
  return (
    <div className="sidebar-bottom-nav">
      <Link
        href="/settings"
        className={`nav-link${isCurrentPage ? " nav-link-active" : ""}`}
        aria-label="Settings"
        title="Settings"
        aria-current={isCurrentPage ? "page" : undefined}
      >
        <Settings size={18} aria-hidden="true" />
        <span>Settings</span>
      </Link>
    </div>
  );
}

function getPageContext(pathname: string) {
  if (pathname.startsWith("/discover/")) {
    const platformSlug = pathname.split("/")[2];
    const platform = platforms.find(({ slug }) => slug === platformSlug);
    return platform ? `${platform.name} catalog` : "Discover";
  }

  const activeSection = navigationItems.find(({ section }) =>
    isCurrentSection(pathname, section)
  );
  if (activeSection) return activeSection.label;

  if (pathname.startsWith("/search")) return "Search";
  if (pathname.startsWith("/profile/")) {
    return pathname.endsWith("/stats") ? "Player stats" : "Profile";
  }
  if (pathname.startsWith("/game/")) return "Game details";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/auth/register")) return "Create account";
  if (pathname.startsWith("/auth/")) return "Sign in";
  return "GAMEHUB";
}

export function SiteHeaderContext() {
  const pathname = usePathname();
  return <span className="topbar-title">{getPageContext(pathname)}</span>;
}

export function SiteHeaderNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const lastPathname = useRef(pathname);

  useEffect(() => {
    if (lastPathname.current !== pathname) {
      lastPathname.current = pathname;
      setCollapsed(true);
    }
  }, [pathname]);

  const toggleLabel = collapsed ? "Expand navigation" : "Collapse navigation";
  const ToggleIcon = collapsed ? ChevronRight : ChevronLeft;

  return (
    <div className="sidebar-nav-container" data-collapsed={collapsed}>
      <button
        className="sidebar-toggle"
        type="button"
        aria-label={toggleLabel}
        aria-expanded={!collapsed}
        aria-controls="main-navigation"
        title={toggleLabel}
        onClick={() => setCollapsed((value) => !value)}
      >
        <ToggleIcon size={18} aria-hidden="true" />
        <span>{toggleLabel}</span>
      </button>
      <PrimaryNavigation pathname={pathname} />
      <PlatformNavigation pathname={pathname} />
      <SettingsNavigation pathname={pathname} />
    </div>
  );
}
