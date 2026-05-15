'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import cn from 'classnames';

interface QuantityInputProps {
    value: number;
    onChange: (next: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    className?: string;
    size?: 'sm' | 'md';
}

const QuantityInput: React.FC<QuantityInputProps> = ({
    value,
    onChange,
    min = 1,
    max = 9999,
    disabled = false,
    className,
    size = 'md',
}) => {
    // Local text state so the user can freely edit (including temporarily
    // blanking the input).
    const [text, setText] = useState<string>(String(value ?? min));
    // Track whether the input is currently focused. Only sync from `value`
    // when the user isn't in the middle of typing.
    const focusedRef = useRef(false);

    useEffect(() => {
        if (!focusedRef.current) {
            setText(String(value ?? min));
        }
    }, [value, min]);

    const clamp = (n: number) => Math.max(min, Math.min(max, n));

    const emit = (next: number) => {
        if (next !== value) onChange(next);
    };

    // Read the quantity from whatever the user currently sees in the input.
    const readCurrent = (): number => {
        const n = parseInt(text, 10);
        return Number.isNaN(n) ? value : clamp(n);
    };

    const step = (delta: number) => {
        const next = clamp(readCurrent() + delta);
        setText(String(next));
        emit(next);
    };

    const handleTyping = (raw: string) => {
        // Only digits. Do NOT emit yet — each keystroke would otherwise fire a
        // PUT /v1/cart/:id. Commit on Enter or blur instead.
        setText(raw.replace(/[^0-9]/g, ''));
    };

    const handleBlur = () => {
        focusedRef.current = false;
        // Normalize empty/invalid input back to the last known good value.
        const n = parseInt(text, 10);
        if (Number.isNaN(n) || n < min) {
            setText(String(value));
            return;
        }
        const clamped = clamp(n);
        if (String(clamped) !== text) setText(String(clamped));
        emit(clamped);
    };

    const btnBase =
        'flex items-center justify-center border border-border-base bg-white text-brand-dark transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50';
    const btnDims =
        size === 'sm'
            ? 'w-7 h-7 text-xs shrink-0'
            : 'w-9 h-9 text-sm shrink-0';
    const inputDims =
        size === 'sm'
            ? 'w-14 h-7 text-xs'
            : 'w-16 h-9 text-sm';

    return (
        <div className={cn('inline-flex items-center', className)}>
            <button
                type="button"
                aria-label="Decrease quantity"
                className={cn(btnBase, btnDims, 'rounded-l-md')}
                disabled={disabled || readCurrent() <= min}
                // Keep focus on the input so blur doesn't fight clicks.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => step(-1)}
            >
                <Minus className="w-3.5 h-3.5" />
            </button>
            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={text}
                disabled={disabled}
                onFocus={() => {
                    focusedRef.current = true;
                }}
                onChange={(e) => handleTyping(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        (e.target as HTMLInputElement).blur();
                    }
                }}
                className={cn(
                    'border-y border-border-base text-center bg-white text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark',
                    inputDims,
                )}
                aria-label="Quantity"
            />
            <button
                type="button"
                aria-label="Increase quantity"
                className={cn(btnBase, btnDims, 'rounded-r-md')}
                disabled={disabled || readCurrent() >= max}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => step(1)}
            >
                <Plus className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

export default QuantityInput;
