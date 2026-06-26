import { getBlogById } from "@/actions/blogs/getblogbyid";
import { auth } from "@/auth";
import BlockNoteEditor from "@/components/blog/editor/BlockNoteEditor";
import Reactions from "@/components/blog/Reactions";
import UserSummary from "@/components/blog/UserSummary";
import Alert from "@/components/common/Alert";
import Tag from "@/components/common/Tag";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

import './editor.css'
import Comments from "@/components/comments/Comments";

interface BlogContentProps {
    params: Promise<{ id: string }>
}

const BlogContent = async ({ params }: BlogContentProps) => {
    const session = await auth()

    const { id } = await params

    const res = await getBlogById({ blogId: id })

    if (!res.success) return <Alert error message="Error fetching blog content" />

    const blog = res.success.blog

    if (!blog) return <Alert error message="No blog found!" />

    return (<div className="flex flex-col max-w-[900px] m-auto gap-6">
        {blog.coverImage && <div className="relative w-full h-[35vh] mt-2">
            <Image src={blog.coverImage} fill alt="Cover Image" className="object-cover rounded" />
        </div>}
        <div className="flex justify-between items-center pt-4">
            {blog.user && <UserSummary user={blog.user} createdDate={blog.createdAt} />}
            {session?.user.userId === blog.userId && <Link className="text-orange-400" href={`/blog/edit/${blog.id}`}>Edit</Link>}
        </div>
        <div className="flex flex-col gap-2">
            <Separator />
            <Reactions blog={blog} />
            <Separator />
        </div>
        <h2 className="text-4xl font-bold">{blog.title}</h2>
        {!!blog.tags.length && <div className="flex items-center gap-4 flex-wrap">
            {blog.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
        </div>}
        <div>
            <BlockNoteEditor editable={false} initialContent={blog.content} />
        </div>
        <Separator />
        <Comments blog={blog} />
    </div>);
}

export default BlogContent;