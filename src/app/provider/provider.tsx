'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import ReduxProvider from '@/store/ReduxProvider';

function Providers({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    const queryClientRef = React.useRef<QueryClient | null>(null);

    if (!queryClientRef.current) {
        queryClientRef.current = new QueryClient();
    }

    return (
        <ReduxProvider>
            <QueryClientProvider client={queryClientRef.current}>
                <NextThemesProvider {...props}>{children}</NextThemesProvider>
                {/*<ReactQueryDevtools initialIsOpen={false} />*/}
            </QueryClientProvider>
        </ReduxProvider>
    );
}

export default Providers;
