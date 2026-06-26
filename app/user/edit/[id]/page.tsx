import { auth } from "@/auth";
import Alert from "@/components/common/Alert";
import EditUserForm from "@/components/user/EditUserForm";
import { db } from "@/lib/db";
import { getUserById } from "@/lib/user";

const EditUser = async ({ params }: { params: Promise<{ id: string }> }) => {

    const { id } = await params

    const user = await getUserById(id)

    if (!user) return <Alert error message="User not found!" />

    const session = await auth()

    if (session?.user.userId !== user.id) return <Alert error message="Not authorized!" />

    const account = await db.account.findFirst({
        where: { userId: user.id }
    })

    const isOAuth = account?.provider === 'google' || account?.provider === 'github'

    const isCredentials = !isOAuth

    return (<EditUserForm user={user} isCredentials={isCredentials} />);
}

export default EditUser;