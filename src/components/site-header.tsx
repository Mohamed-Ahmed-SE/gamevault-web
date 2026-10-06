import Link from "next/link";
import { Gamepad2, Search, ChevronDown } from "@/components/icons";
import { NotificationMenu } from "@/components/notification-menu";
import { SiteHeaderContext, SiteHeaderNav } from "@/components/site-header-nav";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  const username = data?.user?.user_metadata?.username ?? data?.user?.email?.split("@")[0] ?? "Mohamed";

  return (
    <>
      <aside className="site-header" aria-label="GAMEHUB navigation">
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="GAMEHUB Home">
            <span className="brand-mark">
              <Gamepad2 size={20} aria-hidden="true" />
            </span>
            <span className="brand-name">
              GAME<span className="brand-highlight">HUB</span>
            </span>
          </Link>
          <SiteHeaderNav />
        </div>
      </aside>

      <header className="site-topbar" aria-label="Page toolbar">
        <SiteHeaderContext />
        <div className="header-actions">
          <Link className="icon-action-btn" href="/search" aria-label="Search catalog">
            <Search size={18} aria-hidden="true" />
          </Link>
          <NotificationMenu />

          <Link
            className="user-profile-btn"
            href={`/profile/${encodeURIComponent(username.toLowerCase())}`}
            aria-label="Open your profile"
          >
            <div className="user-avatar-circle">
              {/* Profile avatar circle */}
              <span>{username.slice(0, 1).toUpperCase()}</span>
            </div>
            <span className="user-name-text">{username}</span>
            <ChevronDown size={14} className="user-chevron" aria-hidden="true" />
          </Link>
        </div>
      </header>
    </>
  );
}
