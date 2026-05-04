// Banner copy + visuals shown above the product grid.
// Uses gradient backgrounds + emoji glyphs instead of stock photos so the
// imagery always reflects the category (no risk of photos drifting off-topic).

export type CategoryBanner = {
    id: string;
    label: string;
    headline: string;
    blurb: string;
    /** Tailwind class string for the banner gradient. */
    gradient: string;
    /** Tailwind class for the small label pill. */
    accent: string;
    /** Single-glyph illustration shown on the right side. */
    glyph: string;
};

export const ALL_CATEGORIES_BANNER: CategoryBanner = {
    id: 'all',
    label: 'All categories',
    headline: 'Wholesale-ready essentials, restocked weekly',
    blurb: 'Browse the full catalog — kitchen, cleaning, hardware, baby, and more.',
    gradient: 'from-slate-800 via-slate-700 to-amber-700',
    accent: 'bg-amber-500',
    glyph: '🛒',
};

export const CATEGORY_BANNERS: Record<string, CategoryBanner> = {
    baby: {
        id: 'baby',
        label: 'Baby',
        headline: 'Baby essentials your shelves will love',
        blurb: 'Bibs, washcloths, diaper helpers — everyday best-sellers.',
        gradient: 'from-rose-700 via-pink-600 to-rose-500',
        accent: 'bg-rose-400',
        glyph: '🍼',
    },
    barware: {
        id: 'barware',
        label: 'Barware',
        headline: 'Barware that turns over fast',
        blurb: 'Stoppers, ice trays, openers — every detail your customers want.',
        gradient: 'from-emerald-800 via-emerald-700 to-teal-600',
        accent: 'bg-emerald-500',
        glyph: '🍸',
    },
    cleaning: {
        id: 'cleaning',
        label: 'Cleaning',
        headline: 'Cleaning supplies stocked & ready',
        blurb: 'Microfiber, brushes, the works — at wholesale prices.',
        gradient: 'from-sky-800 via-sky-700 to-cyan-600',
        accent: 'bg-sky-500',
        glyph: '🧽',
    },
    'food-storage': {
        id: 'food-storage',
        label: 'Food Storage',
        headline: 'Food storage that flies off the shelf',
        blurb: 'Containers, wraps, condiment cups — the everyday must-haves.',
        gradient: 'from-orange-800 via-orange-700 to-amber-600',
        accent: 'bg-orange-500',
        glyph: '🥡',
    },
    hardware: {
        id: 'hardware',
        label: 'Hardware',
        headline: 'Tools and hardware for every aisle',
        blurb: 'Tape, ties, brushes — practical picks at wholesale.',
        gradient: 'from-slate-800 via-slate-700 to-zinc-600',
        accent: 'bg-slate-500',
        glyph: '🛠️',
    },
    loco: {
        id: 'loco',
        label: 'Loco',
        headline: 'Loblaws Conventional staples',
        blurb: 'Bag clips and everyday CA store-floor heroes.',
        gradient: 'from-violet-800 via-violet-700 to-purple-600',
        accent: 'bg-violet-500',
        glyph: '📎',
    },
};

export const getBannerForSelection = (
    selectedCategoryIds: string[],
): CategoryBanner => {
    const hasSelection =
        selectedCategoryIds.length > 0 && !selectedCategoryIds.includes('all');
    if (!hasSelection) return ALL_CATEGORIES_BANNER;
    if (selectedCategoryIds.length === 1) {
        return CATEGORY_BANNERS[selectedCategoryIds[0]] ?? ALL_CATEGORIES_BANNER;
    }
    return ALL_CATEGORIES_BANNER;
};
