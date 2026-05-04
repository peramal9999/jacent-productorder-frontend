'use client';

import cn from 'classnames';
import type { CategoryBanner as CategoryBannerType } from '@/data/category-banners';

interface Props {
    banner: CategoryBannerType;
    className?: string;
}

const CategoryBanner: React.FC<Props> = ({ banner, className }) => {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-lg mb-6 bg-gradient-to-r',
                banner.gradient,
                className,
            )}
        >
            {/* Decorative dot pattern overlay */}
            <div
                className="absolute inset-0 opacity-15"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)',
                    backgroundSize: '14px 14px',
                }}
            />

            <div className="relative flex items-center justify-between gap-4 px-6 md:px-10 py-6 md:py-8">
                <div className="flex flex-col min-w-0 flex-1">
                    <span
                        className={cn(
                            'inline-flex w-fit items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white mb-2 shadow',
                            banner.accent,
                        )}
                    >
                        {banner.label}
                    </span>
                    <h2 className="text-white text-lg md:text-2xl font-semibold leading-snug max-w-xl">
                        {banner.headline}
                    </h2>
                    <p className="text-white/80 text-sm md:text-[15px] mt-1 max-w-xl">
                        {banner.blurb}
                    </p>
                </div>

                <div
                    aria-hidden
                    className="hidden md:flex items-center justify-center shrink-0 w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-5xl"
                >
                    {banner.glyph}
                </div>
            </div>
        </div>
    );
};

export default CategoryBanner;
