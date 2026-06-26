import { getBookmarks } from "@/actions/blogs/get-bookmarks"
import ListBlogs from "@/components/blog/ListBlogs"
import Alert from "@/components/common/Alert"
import Heading from "@/components/common/Heading"

interface BookamarksProps {
    params: Promise<{ page: string }>
}

const Bookmarks = async ({ params }: BookamarksProps) => {
    const { page } = await params

    const currentPage = parseInt(page, 10) || 1

    const { success, error } = await getBookmarks({ page: currentPage, limit: 5 })

    if (error) return <Alert error message="Error fetching blogs" />

    if (!success) return <Alert message="No blogs!" />

    const { blogs, hasMore } = success

    return (<div>
        <div className="max-w-[800px] m-auto mt-4 px-4">
            <Heading title="Bookmarks" lg />
        </div>
        <ListBlogs blogs={blogs} hasMore={hasMore} currentPage={currentPage} />
    </div>);
}

export default Bookmarks;