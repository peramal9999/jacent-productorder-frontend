import { useEffect, useRef, useState, type ReactNode } from "react";
import { Minus, Plus, Search, X } from "lucide-react";

interface FilterSectionProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: ReactNode;
    /**
     * If provided, a search icon button is shown in the section header.
     * Toggling it reveals an input whose value is forwarded here.
     */
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
}

export function FilterSection({
    title,
    isOpen,
    onToggle,
    children,
    searchValue,
    onSearchChange,
    searchPlaceholder,
}: FilterSectionProps) {
    const searchable = typeof onSearchChange === "function";
    const [searchOpen, setSearchOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Auto-focus the input when the user reveals it.
    useEffect(() => {
        if (searchOpen) inputRef.current?.focus();
    }, [searchOpen]);

    return (
        <div className="relative flex flex-col pb-8 lg:pb-10 space-y-5">
            <div className="block-title flex items-center justify-between">
                <h3
                    className="font-medium text-base lg:text-[17px] text-brand-dark cursor-pointer flex-1"
                    onClick={onToggle}
                >
                    {title}
                </h3>
                <div className="flex items-center gap-1">
                    {searchable && isOpen && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (searchOpen && searchValue) {
                                    onSearchChange?.("");
                                }
                                setSearchOpen((s) => !s);
                            }}
                            aria-label={
                                searchOpen
                                    ? `Close ${title.toLowerCase()} search`
                                    : `Search ${title.toLowerCase()}`
                            }
                            className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
                        >
                            {searchOpen ? (
                                <X className="h-3.5 w-3.5 text-brand-dark" />
                            ) : (
                                <Search className="h-3.5 w-3.5 text-brand-dark" />
                            )}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onToggle}
                        className="h-4 w-4 flex items-center justify-center"
                        aria-label={
                            isOpen
                                ? `Collapse ${title.toLowerCase()}`
                                : `Expand ${title.toLowerCase()}`
                        }
                    >
                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {isOpen && searchable && searchOpen && (
                <input
                    ref={inputRef}
                    type="text"
                    value={searchValue ?? ""}
                    placeholder={searchPlaceholder ?? `Search ${title.toLowerCase()}…`}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-dark"
                />
            )}

            {isOpen && <div className="space-y-4">{children}</div>}
        </div>
    );
}
