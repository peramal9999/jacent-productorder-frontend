/**
 * Symmetric AES encryption helpers + drop-in wrappers for cookies,
 * localStorage and sessionStorage. Used to obscure values stored in the
 * browser so they aren't readable from DevTools at a glance.
 *
 * NOTE — this is obfuscation, not true secrecy. The decryption key has to
 * live in the JS bundle, so a determined attacker can always extract it.
 * This protects against casual snooping (e.g. a user opening DevTools and
 * reading their token, or a stray browser extension scraping plaintext
 * keys), not against a compromised host environment.
 */

import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';

/**
 * Override per-environment with NEXT_PUBLIC_STORAGE_SECRET. The fallback is
 * only used in dev to keep things working out-of-the-box.
 */
const SECRET =
    process.env.NEXT_PUBLIC_STORAGE_SECRET ??
    'razor-default-storage-secret-2026-change-me';

const PREFIX = 'enc:';

export const encrypt = (plaintext: string): string => {
    if (!plaintext) return plaintext;
    const cipher = CryptoJS.AES.encrypt(plaintext, SECRET).toString();
    return `${PREFIX}${cipher}`;
};

export const decrypt = (cipher: string): string | null => {
    if (!cipher) return null;
    if (!cipher.startsWith(PREFIX)) {
        // Legacy / unmigrated value — return as-is so we don't crash on
        // first reload after rolling encryption out.
        return cipher;
    }
    try {
        const bytes = CryptoJS.AES.decrypt(cipher.slice(PREFIX.length), SECRET);
        const text = bytes.toString(CryptoJS.enc.Utf8);
        return text || null;
    } catch {
        return null;
    }
};

// ---------------------------------------------------------------------------
// localStorage / sessionStorage adapters compatible with zustand's persist().
// ---------------------------------------------------------------------------

const makeWebStorage = (web: 'localStorage' | 'sessionStorage') => ({
    getItem: (name: string): string | null => {
        if (typeof window === 'undefined') return null;
        const raw = window[web].getItem(name);
        if (raw == null) return null;
        return decrypt(raw);
    },
    setItem: (name: string, value: string): void => {
        if (typeof window === 'undefined') return;
        window[web].setItem(name, encrypt(value));
    },
    removeItem: (name: string): void => {
        if (typeof window === 'undefined') return;
        window[web].removeItem(name);
    },
});

/** Encrypted localStorage adapter. Pass to zustand `persist({ storage: createJSONStorage(() => encryptedLocalStorage) })`. */
export const encryptedLocalStorage = makeWebStorage('localStorage');

/** Encrypted sessionStorage adapter. */
export const encryptedSessionStorage = makeWebStorage('sessionStorage');

// ---------------------------------------------------------------------------
// Cookie helpers — same surface as js-cookie's set/get/remove but with
// AES round-tripping under the hood.
// ---------------------------------------------------------------------------

export const setSecureCookie = (
    name: string,
    value: string,
    options?: Cookies.CookieAttributes,
): void => {
    Cookies.set(name, encrypt(value), options);
};

export const getSecureCookie = (name: string): string | null => {
    const raw = Cookies.get(name);
    if (raw == null) return null;
    return decrypt(raw);
};

export const removeSecureCookie = (
    name: string,
    options?: Cookies.CookieAttributes,
): void => {
    Cookies.remove(name, options);
};
