import { auth } from "@/auth";
import { db } from "@/lib/db";
import { backendClient } from "@/lib/edgestore-server";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        const isAdmin = session?.user.role === "ADMIN";

        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const userId = body?.userId as string | undefined;

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const blogs = await db.blog.findMany({ where: { userId: user.id } });
        await Promise.all(
            blogs.map(async (blog) => {
                if (blog.coverImage) {
                    try {
                        await backendClient.publicFiles.deleteFile({ url: blog.coverImage });
                    } catch (deleteError) {
                        console.error("Failed to delete cover image", blog.coverImage, deleteError);
                    }
                }
            })
        );

        await db.user.delete({ where: { id: userId } });

        return NextResponse.json({ success: "User deleted successfully." });
    } catch (error) {
        console.error("Admin delete user error", error);
        return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
    }
}
