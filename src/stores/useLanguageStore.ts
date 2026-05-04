import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { encryptedLocalStorage } from '@/utils/secure-storage';

export type LanguageCode = 'en' | 'fr' | 'es';

export const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
];

interface LanguageState {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'en',
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'razor-language',
            storage: createJSONStorage(() => encryptedLocalStorage),
        },
    ),
);
