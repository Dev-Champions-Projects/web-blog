import { redirect } from "next/navigation";

const User = async ({ params }: { params: Promise<{ id: string }> }) => {

    const { id } = await params

    redirect(`/user/${id}/1`)
}

export default User;