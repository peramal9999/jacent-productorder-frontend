import { create } from 'zustand';

interface FilterState {
    selectedCategories: Record<string, boolean>;
    toggleCategory: (id: string, checked: boolean) => void;
    clearCategories: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
    // "All" is selected by default — no category filter applied.
    selectedCategories: { all: true },
    toggleCategory: (id, checked) =>
        set((state) => {
            // Treat "all" specially — checking it clears everything else;
            // unchecking falls back to "all" so we never end up with nothing selected.
            if (id === 'all') {
                return { selectedCategories: checked ? { all: true } : { all: true } };
            }
            const next = { ...state.selectedCategories, [id]: checked };
            // Unchecking a specific category means "all" is no longer forced.
            delete next.all;
            // Remove falsey entries to keep state clean.
            Object.keys(next).forEach((k) => {
                if (!next[k]) delete next[k];
            });
            // Nothing selected → snap back to "All".
            if (Object.keys(next).length === 0) {
                return { selectedCategories: { all: true } };
            }
            return { selectedCategories: next };
        }),
    clearCategories: () => set({ selectedCategories: { all: true } }),
}));

export const getSelectedCategoryIds = (
    selected: Record<string, boolean>,
): string[] => Object.keys(selected).filter((k) => selected[k]);
