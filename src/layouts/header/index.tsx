'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import {siteNavigation} from '@/data/navigation-settings';
import { useUI } from '@/hooks/use-UI';

import Container from '@/components/shared/container';
import Logo from '@/components/shared/logo';
import Text from '@/components/shared/text';
import MenuIcon from '@/components/icons/menu-icon';
import Search from '@/components/top-search/search';
import cn from 'classnames';

import MainMenu from '@/layouts/header/main-menu';
import HeaderMenutop from '@/layouts/header/header-menutop';

import { MainMenuType } from '@/services/types';
const AuthDropdown = dynamic(() => import('@/layouts/header/auth-dropdown'), {
    ssr: false,
});
const CartButton = dynamic(() => import('@/layouts/header/cart-button'), {
    ssr: false,
});


interface HeaderProps {
    className?: string;
    variant?: string;
}
const Header: React.FC<HeaderProps> = ({className, variant}) => {
    const {openSidebar, displaySearch, displayMobileSearch} = useUI();

    function handleMobileMenu() {
        return openSidebar();
    }

    return (
        <>
            {/* The whole header (upper bar + logo row + nav row) is sticky as a
                single unit so its size never changes on scroll. */}
            <header
                id="siteHeader"
                className={cn(
                    'header-one sticky top-0 z-50 w-full bg-fill-one',
                    displayMobileSearch && 'active-mobile-search',
                    className,
                )}
            >
                {/* Upper bar — always visible at the very top of the header. */}
                <div className="top-bar bg-fill-one text-13px text-gray-300 dark:text-gray-700 border-b border-brand-light/8">
                    <Container>
                        <div className="h-8 flex justify-center md:justify-between items-center">
                            <Text className="m-0 text-13px text-center truncate" variant={"small"}>
                               🛒 A minimum order of $250 is required to checkout
                            </Text>
                            <div className="hidden md:flex flex-shrink-0">
                                <HeaderMenutop
                                    data={siteNavigation.topmenu}
                                    className="flex transition-all duration-200 ease-in-out"
                                    classNameLink={'text-gray-300  dark:text-gray-700 hover:text-[#16bcdc]'}
                                />
                            </div>
                        </div>
                    </Container>
                </div>
                <div className={cn(
                    "z-20 w-full body-font",
                    {'bg-fill-one text-brand-light': variant === 'home5' ,}
                )}>
                    <Search
                        searchId="mobile-search"
                        className="topbar-search hidden lg:max-w-[600px] absolute z-30 px-4 md:px-6 top-12 xl:top-1"
                    />
                    <div className="border-b border-brand-light/8">
                        <Container>
                            <div className="flex items-center justify-between gap-4 py-1">
                                <div className="relative flex-shrink-0 lg:hidden">
                                    <button
                                        aria-label="Menu"
                                        className="bg-fill-one text-brand-light rounded focus:outline-none flex-shrink-0 text-sm text-skin-inverted px-2.5 md:px-3 lg:px-[18px] py-2 flex items-center transition-all"
                                        onClick={handleMobileMenu}
                                    >
                                        <MenuIcon/>
                                    </button>
                                </div>
                                <Logo
                                    variant={'dark'}
                                    className="logo ps-3 md:ps-0 lg:mx-0 flex-shrink-0"
                                />

                                <div className="hidden lg:flex flex-col flex-1 max-w-[450px] xl:max-w-[650px] 2xl:max-w-[900px] mx-6 xl:mx-10">
                                    <Search
                                        searchId="top-search"
                                        variant={"dark"}
                                        className="w-full"
                                    />
                                    <div className="navbar mt-1 relative">
                                        <div className="flex justify-start items-center pl-2">
                                            <MainMenu
                                                navigations={siteNavigation.menu as MainMenuType[]}
                                                className="flex"
                                            />
                                            {displaySearch && (
                                                <div className="sticky-search w-full absolute top-0 left-0 px-4 flex items-center justify-center h-full">
                                                    <Search className="max-w-[780px] xl:max-w-[830px]" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-brand-light flex text-sm space-x-5 xl:space-x-10 lg:max-w-[33%] xl:min-w-[240px] flex-shrink-0">
                                    <AuthDropdown variant={"Border"} />

                                    <CartButton className="hidden lg:flex" variant={"Border"}/>
                                </div>
                            </div>
                        </Container>
                    </div>
                </div>
            </header>
        </>
    );
}

export default Header;
