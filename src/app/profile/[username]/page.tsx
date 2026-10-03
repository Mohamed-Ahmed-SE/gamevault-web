import { ProfileView } from "@/components/profile-view";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <div className="page-shell"><ProfileView username={username}/></div>;
}
