import type { Metadata } from "next"
import ProfileHeader from "@/components/profile/profile-header"
import ProfileTabs from "@/components/profile/profile-tabs"

interface ProfilePageProps {
  params: {
    username: string
  }
}

export const metadata: Metadata = {
  title: "Hồ sơ | EchoLink",
  description: "User profile",
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = params;

  return (
    <div className="container py-6">
      <ProfileHeader username={username} />
      <ProfileTabs username={username} />
    </div>
  )
}
