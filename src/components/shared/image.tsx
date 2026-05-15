'use client';

import Image, { StaticImageData } from 'next/image';
import cn from 'classnames';
import React, { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

interface Props {
    variant?: string;
    rootClassName?: string;
    className?: string;
    width: string | number;
    height: string | number;
    src: string | StaticImageData;
    alt: string;
    loading?: 'eager' | 'lazy';
    priority?: boolean;
}

const isUsableSrc = (src: string | StaticImageData | undefined): boolean => {
    if (!src) return false;
    if (typeof src === 'string') return src.trim().length > 0;
    return true;
};

const NoImageFallback: React.FC<{ className?: string }> = ({ className }) => (
    <div
        className={cn(
            'absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gray-50 text-gray-400 select-none',
            className,
        )}
        aria-label="No image found"
        role="img"
    >
        <ImageOff className="w-1/3 h-1/3 max-w-[40px] max-h-[40px]" strokeWidth={1.25} />
        <span className="text-[10px] font-medium uppercase tracking-wide">
            No image found
        </span>
    </div>
);

const ImageFill: React.FC<Props> = ({
    className,
    rootClassName,
    variant,
    width,
    height,
    src,
    alt,
    loading = 'eager',
    priority = true,
}) => {
    const effectivePriority = loading === 'eager' ? true : priority;
    const [errored, setErrored] = useState(!isUsableSrc(src));

    useEffect(() => {
        setErrored(!isUsableSrc(src));
    }, [src]);

    return (
        <div className={cn('relative md:inline-block ', rootClassName)}>
            <div className={cn('block w-full box-sizing')}>
                <svg
                    className="block max-w-full h-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    width={width}
                    height={height}
                    version="1.1"
                />
            </div>
            {errored ? (
                <NoImageFallback className={className} />
            ) : (
                <Image
                    src={src}
                    alt={alt}
                    width={0}
                    height={0}
                    sizes="100vw"
                    loading={loading}
                    priority={effectivePriority}
                    onError={() => setErrored(true)}
                    className={cn(
                        'absolute top-0 left-0 right-0 bottom-0 max-w-full max-h-full min-w-full w-auto h-auto object-cover',
                        {
                            ' min-h-full': variant === 'cover',
                        },
                        className,
                    )}
                />
            )}
        </div>
    );
};

export default ImageFill;
export const NO_IMAGE_FALLBACK_LABEL = 'No image found';
