'use client';

import Heading from '@/components/shared/heading';
import Link from '@/components/shared/link';
import cn from 'classnames';
import { usePanel } from '@/hooks/use-panel';
import { colorMap } from '@/data/color-settings';
import { useGetFilterOptionsQuery } from '@/store/productsApi';

interface Props {
    className?: string;
    variant?: string;
    title?: string;
    /** Max categories to render before the "More" link kicks in. */
    limit?: number;
}

const WidgetCategoriesLink: React.FC<Props> = ({
    className,
    variant,
    title = 'Categories',
    limit = 5,
}) => {
    const { selectedColor } = usePanel();
    const { data: filterOptions } = useGetFilterOptionsQuery();

    const commodities = filterOptions?.commodities ?? [];
    const sorted = [...commodities].sort((a, b) =>
        a.commodity.localeCompare(b.commodity),
    );
    const visible = sorted.slice(0, limit);
    const hasMore = sorted.length > limit;

    return (
        <div
            className={cn(
                {
                    'text-fill-footer':
                        variant === 'default' ||
                        variant === 'basic' ||
                        variant === 'home6' ||
                        variant === 'home7' ||
                        variant === 'home8',
                },
                className,
            )}
        >
            <Heading
                variant="mediumHeading"
                className={cn(' mb-4 lg:mb-5', {
                    'text-brand-light':
                        variant === 'default' ||
                        variant === 'basic' ||
                        variant === 'home6' ||
                        variant === 'home7' ||
                        variant === 'home8' ||
                        variant === 'home9',
                })}
            >
                {title}
            </Heading>
            <ul className="text-sm lg:text-14px flex flex-col space-y-1">
                {visible.map((c) => (
                    <li key={`footer-commodity--${c.commodityId}`}>
                        <Link
                            href="/"
                            className={cn(
                                'leading-7 transition-colors duration-200 block',
                                colorMap[selectedColor].hoverLink,
                            )}
                        >
                            {c.commodity}
                        </Link>
                    </li>
                ))}
                {hasMore && (
                    <li>
                        <Link
                            href="/"
                            className={cn(
                                'leading-7 transition-colors duration-200 block font-medium',
                                colorMap[selectedColor].hoverLink,
                            )}
                        >
                            More
                        </Link>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default WidgetCategoriesLink;
