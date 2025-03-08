"use client"

interface Props {
    children: React.ReactNode
}

import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { useState } from "react"

export default function QueryProvider({children} : Props) {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}