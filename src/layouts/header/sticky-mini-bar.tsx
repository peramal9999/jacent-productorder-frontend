'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import cn from 'classnames';
import Container from '@/components/shared/container';
import Logo from '@/components/shared/logo';
import Search from '@/components/top-search/search';
import { siteNavigation } from '@/data/navigation-settings';

const AuthDropdown = dynamic(() => import('@/layouts/header/auth-dropdown'), {
    ssr: false,
});
const CartButton = dynamic(() => import('@/layouts/header/cart-button'), {
    ssr: false,
});

/**
 * Sticky bar that drops in below the always-visible upper bar once the page
 * has scrolled past the main header. Mirrors the main header layout (logo,
 * nav on the left, search in the middle, auth/cart on the right) so that
 * scrolling doesn't change the visual hierarchy — only the position.
 */
const StickyMiniBar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 120);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div
            aria-hidden={!scrolled}
            className={cn(
                'fixed top-10 left-0 right-0 z-50 bg-fill-one shadow-md border-b border-brand-light/10',
                'transition-transform duration-200 ease-out',
                scrolled ? 'translate-y-0' : '-translate-y-[150%] pointer-events-none',
            )}
        >
            <Container>
                <div className="flex items-center gap-4 lg:gap-6 py-3">
                    {/* Logo at its normal size — no shrink on scroll. */}
                    <Logo variant="dark" className="flex-shrink-0" />

                    {/* Nav links on the left, right after the logo. */}
                    <nav className="hidden lg:flex items-center gap-5 flex-shrink-0">
                        {siteNavigation.menu.map((item: any) => (
                            <Link
                                key={item.id}
                                href={item.path}
                                className="text-brand-light text-sm font-medium uppercase tracking-wide hover:text-amber-400 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Search bar fills the middle. */}
                    <Search
                        searchId="sticky-search"
                        variant={"dark"}
                        className="hidden lg:flex flex-1 max-w-[600px] xl:max-w-[800px] mx-2"
                    />

                    {/* Right-side actions. */}
                    <div className="flex items-center gap-2 text-brand-light flex-shrink-0 ms-auto">
                        <AuthDropdown hideLabel={true} variant="Border" />
                        <CartButton hideLabel={true} variant="Border" />
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default StickyMiniBar;
