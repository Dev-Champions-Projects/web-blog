import { auth } from "@/auth";
import Alert from "@/components/common/Alert";
import UserProfile from "@/components/user/UserProfile";
import { db } from "@/lib/db";

const Profile = async ({ params }: { params: Promise<{ id: string, page: string }> }) => {

    const { id, page } = await params
    const session = await auth()
    const currentUid = session?.user.userId

    const user = await db.user.findUnique({
        where: { id },
        include: {
            followers: {
                include: {
                    follower: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            followers: {
                                where: { followerId: currentUid },
                                select: { id: true }
                            }
                        }
                    }
                }
            },
            followings: {
                include: {
                    following: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            followers: {
                                where: { followerId: currentUid },
                                select: { id: true }
                            }
                        }
                    }
                }
            },
            _count: {
                select: {
                    followers: true,
                    followings: true
                }
            }
        },
    })

    if (!user) return <Alert error message="User not found" />

    const follow = await db.follow.findFirst({
        where: {
            followerId: currentUid,
            followingId: user.id
        }
    })

    return <UserProfile user={user} page={page} isFollowing={Boolean(follow)} />;
}

export default Profile;