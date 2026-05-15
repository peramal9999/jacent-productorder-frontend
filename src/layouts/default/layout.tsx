'use client';

import Header from "@/layouts/header";
import Footer from '@/layouts/footer';
import BackToTopButton from "@/components/shared/back-to-top";
import BottomNavigation from "@/layouts/header/mobile-navigation";


export default function ModernLayout({children}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main
                className="relative flex-grow "
                style={{
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {children}
            </main>

            <Footer showWidgetSubscription={true} />

            <BottomNavigation />
            <BackToTopButton />
        </div>
    );
}
