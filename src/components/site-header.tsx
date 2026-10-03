import Link from "next/link";
import { Gamepad2, Search, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
export async function SiteHeader() {
  const supabase = await createClient(); const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  return <header className="site-header"><Link className="brand" href="/"><span className="brand-mark"><Gamepad2 size={20}/></span><span>GAMEVAULT</span></Link><nav aria-label="Main navigation"><Link href="/discover">Discover</Link><Link href="/library">Library</Link><Link href="/upcoming">Upcoming</Link></nav><div className="header-actions"><Link className="icon-action" href="/search" aria-label="Search"><Search size={18}/></Link>{data.user ? <Link className="profile-action" href={`/profile/${encodeURIComponent(data.user.user_metadata?.username ?? data.user.email?.split("@")[0] ?? "player")}`}><UserRound size={17}/> Profile</Link> : <Link className="sign-in" href="/auth/login">Sign in <span>↗</span></Link>}</div></header>;
}
