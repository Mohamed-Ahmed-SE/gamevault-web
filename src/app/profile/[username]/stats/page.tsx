import { ProfileStats } from "@/components/profile-stats";

export default async function StatsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <ProfileStats username={username}/>;
}
