'use client'

import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { ChangeEventHandler, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString, { StringifiableRecord } from 'query-string'
import { useDebounceValue } from "@/hooks/useDebounceValue";

const SearchInput = () => {
    const params = useSearchParams()
    const title = params.get('title')
    const [value, setValue] = useState(title || '')
    const router = useRouter()

    const debounceValue = useDebounceValue<string>(value)

    useEffect(() => {
        let currentQuery = {}

        if (params) {
            currentQuery = queryString.parse(params.toString())
        }

        const updatedQuery: StringifiableRecord = {
            ...currentQuery,
            title: debounceValue
        }

        const url = queryString.stringifyUrl(
            {
                url: window.location.href,
                query: updatedQuery
            },
            {
                skipNull: true,
                skipEmptyString: true
            }
        )

        router.push(url)
    }, [debounceValue])

    const handleOnchange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setValue(e.target.value)
    }

    return (<div className="relative hidden sm:block">
        <Search className="absolute top-3 left-4 h-4 w-4 text-muted-foreground" />
        <Input value={value} onChange={handleOnchange} placeholder="Search" className="pl-10 bg-primary/10" />
    </div>);
}

export default SearchInput;