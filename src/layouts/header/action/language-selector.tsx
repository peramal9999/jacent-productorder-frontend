'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import cn from 'classnames';
import { useIsMounted } from '@/utils/use-is-mounted';
import {
    LANGUAGES,
    useLanguageStore,
    type LanguageCode,
} from '@/stores/useLanguageStore';

interface Props {
    className?: string;
    /**
     * Color overrides for the trigger label/icon. Defaults to the brand-muted
     * gray used by the header top bar.
     */
    triggerClassName?: string;
}

const LanguageSelector: React.FC<Props> = ({ className, triggerClassName }) => {
    const mounted = useIsMounted();
    const language = useLanguageStore((s) => s.language);
    const setLanguage = useLanguageStore((s) => s.setLanguage);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click.
    useEffect(() => {
        if (!open) return;
        const onDocClick = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [open]);

    // Close on Escape.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

    const handleSelect = (code: LanguageCode) => {
        setLanguage(code);
        setOpen(false);
    };

    return (
        <div
            ref={ref}
            className={cn('menuItem relative cursor-pointer mx-2 md:mx-3', className)}
        >
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label="Change language"
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    'flex items-center gap-1.5 h-6 transition-colors font-base',
                    triggerClassName ?? 'text-gray-300 hover:text-white',
                )}
            >
                <Globe size={15} />
                <span className="text-[13px] uppercase tracking-wide">
                    {mounted ? current.code : 'en'}
                </span>
                <ChevronDown
                    size={12}
                    className={cn('transition-transform', open && 'rotate-180')}
                />
            </button>

            {open && (
                <ul
                    role="listbox"
                    aria-label="Languages"
                    className="absolute right-0 top-full mt-2 z-50 min-w-[160px] py-1 bg-white text-brand-dark rounded-md shadow-lg border border-gray-100"
                >
                    {LANGUAGES.map((l) => {
                        const isActive = l.code === language;
                        return (
                            <li key={l.code} role="option" aria-selected={isActive}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(l.code)}
                                    className={cn(
                                        'flex items-center justify-between gap-3 w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors',
                                        isActive && 'font-semibold text-brand-dark',
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        <span aria-hidden className="text-base leading-none">
                                            {l.flag}
                                        </span>
                                        {l.label}
                                    </span>
                                    {isActive && (
                                        <Check size={14} className="text-emerald-600" />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default LanguageSelector;
