"use client"
import cn from "classnames";
import {StoreType} from "@/services/types";
import {useMemo, useState} from "react";
import { MapPin, Search, X } from "lucide-react"
import Scrollbar from "../shared/scrollbar";
import getLocation from "@/utils/get-location";

interface storesProps {
    dataStores?: any;
}

const StoresLocation: React.FC<storesProps> = ({ dataStores }) => {
    const stores: StoreType[] = Array.isArray(dataStores) ? dataStores : [];
    const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>(
        stores[0]?.id,
    );
    const [query, setQuery] = useState('');

    const filteredStores = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return stores;
        return stores.filter((s: any) => {
            const haystack = [
                s.name,
                s.address,
                s.phoneNumber,
                s.email,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [stores, query]);

    // Derive selected from filtered list so the map follows search results.
    const selectedLocation =
        filteredStores.find((store: any) => store.id === selectedLocationId) ??
        filteredStores[0] ??
        stores[0];

    return (
        <div className="flex flex-col lg:flex-row lg:flex-row-reverse gap-5 lg:gap-10">
            <div className="lg:basis-2/3 overflow-hidden relative">
                {selectedLocation ? (
                    <>
                        <div className="absolute top-3 left-3 z-10 bg-white px-3 py-2 rounded-lg shadow-lg">
                            <p className=" text-brand-dark">Store: {selectedLocation.name}</p>
                        </div>
                        <iframe
                            src={getLocation(selectedLocation.location)}
                            width="100%"
                            height="100%"
                            style={{border: 0}}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full min-h-[400px]"
                            title={`Map of ${selectedLocation.name}`}
                        />
                    </>
                ) : (
                    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
                        No stores match your search.
                    </div>
                )}
            </div>

            <div className="lg:basis-1/3">
                {/* Address search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by city, address, or store name"
                        className="w-full pl-10 pr-10 py-2.5 text-sm border border-border-base rounded-lg bg-white focus:outline-none focus:border-brand-dark"
                        aria-label="Search stores"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-brand-dark"
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <p className="text-xs text-gray-500 mb-3">
                    Showing {filteredStores.length} of {stores.length} store{stores.length === 1 ? '' : 's'}
                </p>

                <Scrollbar>
                    <div className="w-full max-h-[450px] lg:max-h-[780px] space-y-4 pr-1">
                        {filteredStores.length === 0 ? (
                            <div className="p-6 rounded-lg bg-white border border-dashed border-gray-200 text-center text-sm text-gray-500">
                                No stores found for &ldquo;{query}&rdquo;.
                            </div>
                        ) : (
                            filteredStores.map((store: any) => {
                                const isSelected = store.id === selectedLocation?.id;

                                return (
                                    <div
                                        key={store.id}
                                        className={cn(
                                            'p-6 rounded-lg cursor-pointer',
                                            isSelected
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white border border-gray-200 text-brand-dark',
                                        )}
                                        onClick={() => setSelectedLocationId(store.id)}
                                        aria-selected={isSelected}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                setSelectedLocationId(store.id);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin
                                                className={cn(
                                                    'h-5 w-5 hidden',
                                                    isSelected && 'sm:block text-white',
                                                )}
                                            />
                                            <h2 className={`text-lg font-medium`}>{store.name}</h2>
                                        </div>

                                        <div className="space-y-2 text-15px leading-6">
                                            <div>
                                                <p className={`font-medium mb-0`}>Address</p>
                                                <p>{store.address}</p>
                                            </div>
                                            <div>
                                                <p className={`font-medium mb-0`}>Phone</p>
                                                <p>{store.phoneNumber || '(+1) 123-456-7890'}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Scrollbar>
            </div>
        </div>
    );
};

export default StoresLocation;
