"use client"

import React, {useCallback, useRef, useState} from "react"
import {Popover, PopoverButton, PopoverPanel} from "@headlessui/react"
import { User, ShoppingBag, Heart,  HelpCircle, LogOut } from "lucide-react"
import AccountIcon from "@/components/icons/account-icon";
import {useRouter} from "next/navigation";
import {ROUTES} from "@/utils/routes";
import {usePanel} from "@/hooks/use-panel";
import {colorMap} from "@/data/color-settings";
import {useModal} from "@/hooks/use-modal";
import { useUI } from '@/hooks/use-UI';
import {useLogoutMutation} from "@/services/auth/use-logout";
import Cookies from "js-cookie";
import cn from "classnames";
import {useAppSelector} from "@/store/hooks";
import {useMeQuery} from "@/store/authApi";
type Variant = 'Border' | 'Border-white' | 'Normal';
interface UserDropdownProps {
    hideLabel?: boolean
    userName?: string
    userLocation?: string
    userImage?: string
    variant?: Variant;
}

export default function AuthDropdown({
                                         variant='Normal',
                                         hideLabel,
                                         userImage = "/assets/images/support/3.png",
                                     }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { selectedColor,selectedDirection } = usePanel();
    const dir = selectedDirection;
    const router = useRouter();
    const { openModal } = useModal();
    const { isAuthorized } = useUI();
    const reduxAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
    const { mutate: logout } = useLogoutMutation();
    // Source of truth, in order: Redux (set by RTK login) → cookie → legacy zustand flag.
    const isLoggedIn =
        reduxAuthenticated || !!Cookies.get('auth_token') || !!isAuthorized;

    // Fetch the live user profile once logged in. RTK Query caches it,
    // so other components (AccountInfo) reuse the same data.
    const { data: me } = useMeQuery(undefined, { skip: !isLoggedIn });
    const u = (me ?? {}) as Record<string, unknown>;
    const userName =
        (u.name as string) ||
        [u.firstName, u.lastName].filter(Boolean).join(' ') ||
        (u.userName as string) ||
        (u.email as string) ||
        '';
    const userLocation =
        (u.locationName as string) ||
        (u.location as string) ||
        (u.city as string) ||
        '';
    
    const handleNavigation = (route: string) => {
        // Close the popover
        setIsOpen(false)
        buttonRef.current?.click()
        // Navigate to the route
        router.push(route);
    }
    
    const handleLogout = useCallback(() => {
            setIsOpen(false);
            buttonRef.current?.click();
            logout(undefined, {
                onSuccess: () => {},
                onError: (error) => {
                    console.error('Logout failed:', error.message);
                },
            });
        }, [logout]);

    const handleLogin = useCallback(() => {
        openModal('LOGIN_VIEW');
    }, [openModal]);

    const sizeIcon = variant ==='Border'  ? `w-5 h-5 ${colorMap[selectedColor].text}`:
        variant ==='Border-white'  ? `w-5 h-5 text-brand-light`
            : '';
    
    
    if (!isLoggedIn) {
        return (
            <button
                className={cn(
                    'hidden lg:flex items-center focus:outline-none group',
                    hideLabel ? '' : 'text-sm font-normal'
                )}
                onClick={handleLogin}
            >
                <div
                        className={cn(
                            'cart-button',
                            {
                                [`${colorMap[selectedColor].groupHoverBorder} w-11 h-11 flex justify-center items-center rounded-full border-2`]:
                                variant === 'Border',
                                [`${colorMap[selectedColor].groupHoverBorder} w-11 h-11 flex justify-center items-center rounded-full border-2 xs:border-brand-light`]:
                                variant === 'Border-white',
                            },
                            'border-brand-light/20'
                        )}
                    >
                        <AccountIcon className={sizeIcon} />
                    </div>
                {!hideLabel && <span className="text-sm font-normal ms-2">Sign in</span>}
            </button>
        );
    }
    

    return (
        <Popover className="relative">
            <PopoverButton
                ref={buttonRef}
                className={`hidden lg:flex items-center  focus:outline-none group `}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={cn("cart-button",{
                        [`${colorMap[selectedColor].groupHoverBorder} w-11 h-11 flex justify-center items-center rounded-full border-2 `] : variant ==='Border',
                        [`${colorMap[selectedColor].groupHoverBorder} w-11 h-11 flex justify-center items-center rounded-full border-2 xs:border-brand-light`] : variant ==='Border-white',
                    },
                        isOpen
                        ? ` ${colorMap[selectedColor].border}`
                        : "border-brand-light/20",
                    )}>
                    <AccountIcon className={sizeIcon}/>
                </div>
                {!hideLabel && (<span className="text-sm font-normal ms-2"> My Account</span>)}
            </PopoverButton>
            
            <PopoverPanel
                transition
                className="absolute end-0 z-10 mt-4 w-70 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition duration-200 ease-in-out"
                onFocus={() => setIsOpen(true)}
                onBlur={() => setIsOpen(false)}
            >
                <div className="pt-4">
                    {/* User Profile */}
                    <div className="flex items-center gap-3 px-4 pb-4 border-b border-gray-100 ">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <User className="w-6 h-6"/>
                        </div>
                        <div>
                            <h3 className="font-medium text-brand-dark">{userName}</h3>
                            <p className="text-sm text-gray-500">{userLocation}</p>
                        </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                        <MenuItem icon={<User className="w-5 h-5"/>} label="My Account"
                                  onClick={() => handleNavigation(ROUTES.ACCOUNT)}/>
                        <MenuItem icon={<ShoppingBag className="w-5 h-5"/>} label="My Order"
                                  onClick={() => handleNavigation(ROUTES.ORDERS)}/>
                        {/* <MenuItem icon={<Heart className="w-5 h-5"/>} label="Wishlist"
                                  onClick={() => handleNavigation(ROUTES.SAVELISTS)}/> */}
                    </div>
                    
                    <div className="border-t border-gray-100 py-2">
                        {/* <MenuItem icon={<HelpCircle className="w-5 h-5"/>} label="Help"/> */}
                        <MenuItem icon={<LogOut className="w-5 h-5"/>} label="Log out" onClick={handleLogout}/>
                    </div>
                </div>
            </PopoverPanel>
        </Popover>
    )
}

function MenuItem({
                      icon,
                      label,
                      onClick,
                  }: {
    icon: React.ReactNode
    label: string
    onClick?: () => void
}) {
    const { selectedColor } = usePanel();
    return (
        <button className={`flex items-center w-full px-4 py-3 text-sm text-body hover:bg-gray-50 ${colorMap[selectedColor].hoverLink}`} onClick={onClick}>
            <span className="me-3 ">{icon}</span>
            <span>{label}</span>
        </button>
    )
}

