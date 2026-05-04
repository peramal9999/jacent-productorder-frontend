'use client';

import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
} from '@headlessui/react';
import { Check, ChevronDown, MapPin, Search, X } from 'lucide-react';
import cn from 'classnames';
import { useState } from 'react';

export interface SearchableSelectOption {
    value: string;
    label: string;
    sub?: string;
}

interface Props {
    label?: string;
    placeholder?: string;
    options: SearchableSelectOption[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
    searchPlaceholder?: string;
    noResultsText?: string;
}

/**
 * Searchable dropdown built on Headless UI v2's Combobox.
 *
 * The panel is positioned with `position: absolute` inside a `relative`
 * wrapper, NOT via Headless UI's `anchor` prop, so it always opens
 * directly below the trigger with the trigger's full width. No portal —
 * easier to reason about, and never drifts away from the field.
 */
const SearchableSelect: React.FC<Props> = ({
    label,
    placeholder = 'Select an option',
    options,
    value,
    onChange,
    error,
    disabled,
    className,
    id,
    searchPlaceholder = 'Search…',
    noResultsText = 'No matches found',
}) => {
    const [query, setQuery] = useState('');

    const selectedOption = options.find((o) => o.value === value) ?? null;

    const filtered =
        query.trim() === ''
            ? options
            : options.filter((o) => {
                  const q = query.toLowerCase();
                  return (
                      o.label.toLowerCase().includes(q) ||
                      o.value.toLowerCase().includes(q) ||
                      (o.sub?.toLowerCase().includes(q) ?? false)
                  );
              });

    return (
        <div className={cn('flex flex-col w-full', className)}>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-brand-dark text-13px font-semibold leading-none mb-3 cursor-pointer"
                >
                    {label}
                </label>
            )}

            <Combobox
                value={selectedOption}
                onChange={(opt: SearchableSelectOption | null) => {
                    if (opt) onChange(opt.value);
                    setQuery('');
                }}
                onClose={() => setQuery('')}
                disabled={disabled}
            >
                <div className="relative">
                    {/* Trigger */}
                    <ComboboxButton
                        id={id}
                        className={cn(
                            'group flex w-full items-center gap-2 h-12 px-3 rounded border bg-white text-left text-sm transition-colors',
                            error
                                ? 'border-red-500'
                                : 'border-border-base hover:border-gray-400 data-[open]:border-brand-dark',
                            disabled && 'opacity-60 cursor-not-allowed',
                        )}
                    >
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />
                        <span
                            className={cn(
                                'flex-1 truncate',
                                selectedOption ? 'text-brand-dark' : 'text-gray-400',
                            )}
                        >
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                        {selectedOption && (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange('');
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.stopPropagation();
                                        onChange('');
                                    }
                                }}
                                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                                aria-label="Clear selection"
                            >
                                <X className="w-3.5 h-3.5" />
                            </span>
                        )}
                        <ChevronDown
                            className="w-4 h-4 text-gray-500 shrink-0 transition-transform group-data-[open]:rotate-180"
                            aria-hidden
                        />
                    </ComboboxButton>

                    {/* Panel — absolute under the trigger, full trigger width */}
                    <ComboboxOptions
                        modal={false}
                        className={cn(
                            'absolute left-0 right-0 top-full mt-1.5 z-50',
                            'rounded-md bg-white shadow-lg border border-gray-200',
                            'origin-top transition duration-100 ease-out',
                            'data-[closed]:scale-95 data-[closed]:opacity-0',
                            'focus:outline-none',
                        )}
                    >
                        {/* Sticky search header */}
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-2 rounded-t-md">
                            <div className="flex items-center gap-2 px-2.5 h-9 rounded-md bg-gray-50 border border-gray-200 focus-within:border-brand-dark">
                                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                                <ComboboxInput
                                    autoFocus
                                    placeholder={searchPlaceholder}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-0 outline-none text-sm text-brand-dark placeholder:text-gray-400"
                                    displayValue={() => query}
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={() => setQuery('')}
                                        className="text-gray-400 hover:text-gray-700"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Scrollable option list */}
                        <div
                            className="max-h-64 overflow-y-auto py-1 overscroll-contain"
                            onWheel={(e) => e.stopPropagation()}
                        >
                            {filtered.length === 0 ? (
                                <div className="px-4 py-6 text-center text-sm text-gray-500">
                                    {noResultsText}
                                </div>
                            ) : (
                                filtered.map((opt) => (
                                    <ComboboxOption
                                        key={opt.value}
                                        value={opt}
                                        className={({ focus, selected }) =>
                                            cn(
                                                'flex items-start justify-between gap-3 px-3 py-2 cursor-pointer text-sm transition-colors',
                                                focus && 'bg-gray-50',
                                                selected && 'bg-emerald-50',
                                            )
                                        }
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className="flex flex-col min-w-0">
                                                    <span
                                                        className={cn(
                                                            'truncate',
                                                            selected
                                                                ? 'font-semibold text-emerald-700'
                                                                : 'text-brand-dark',
                                                        )}
                                                    >
                                                        {opt.label}
                                                    </span>
                                                    {opt.sub && (
                                                        <span className="truncate text-[11px] text-gray-500 mt-0.5">
                                                            {opt.sub}
                                                        </span>
                                                    )}
                                                </span>
                                                {selected && (
                                                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                                                )}
                                            </>
                                        )}
                                    </ComboboxOption>
                                ))
                            )}
                        </div>

                        {filtered.length > 0 && (
                            <div className="px-3 py-1.5 text-[11px] text-gray-400 border-t border-gray-100 bg-gray-50/50 rounded-b-md">
                                {filtered.length} of {options.length}
                            </div>
                        )}
                    </ComboboxOptions>
                </div>
            </Combobox>

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default SearchableSelect;
