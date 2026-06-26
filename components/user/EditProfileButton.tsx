'use client'

import { useRouter } from "next/navigation";
import Button from "../common/Button";
import { User } from "@prisma/client";

const EditProfileButton = ({ user }: { user: User }) => {

    const router = useRouter()

    return (<Button label="Edit" onClick={() => router.push(`/user/edit/${user.id}`)} />);
}

export default EditProfileButton;