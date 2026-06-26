import { getPublishedBlogs } from "@/actions/blogs/get-published-blogs";
import ListBlogs from "@/components/blog/ListBlogs";
import Alert from "@/components/common/Alert";

interface BlogFeedProps {
    params: Promise<{ page: string }>
    searchParams: Promise<{
        tag: string,
        title: string
    }>
}

const BlogFeed = async ({ params, searchParams }: BlogFeedProps) => {
    const { page } = await params

    const searchObj = await searchParams

    const currentPage = parseInt(page, 10) || 1

    const { success, error } = await getPublishedBlogs({ page: currentPage, limit: 5, searchObj })

    if (error) return <Alert error message="Error fetching blogs" />

    if (!success) return <Alert message="No blogs!" />

    const { blogs, hasMore } = success

    return (<div>
        <ListBlogs blogs={blogs} hasMore={hasMore} currentPage={currentPage} />
    </div>);
}

export default BlogFeed;