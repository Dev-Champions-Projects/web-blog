'use client'

import { tags } from "@/lib/tags";
import Tag from "../common/Tag";

import "./Tags.css"
import { usePathname, useSearchParams } from "next/navigation";

const Tags = () => {
    const params = useSearchParams()
    const tag = params.get('tag')

    const pathname = usePathname()

    const isFeedsPage = pathname.includes('/blog/feed')

    if (!isFeedsPage) return null

    return (<div className="border-t">
        <div className="max-w-[1920px] w-full mx-auto px-4 pt-4 pb-0 xl:px-20">
            <div className="flex flex-row items-center justify-start gap-6 sm:gap-12 overflow-x-auto pb-2 tags-container">
                {tags.map((item => <Tag key={item}
                    selected={tag === item || (tag === null && item === 'All')}
                >{item}</Tag>))}
            </div>
        </div>
    </div>);
}

export default Tags;