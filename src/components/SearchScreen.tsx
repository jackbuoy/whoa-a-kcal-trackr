import { useState, useRef, useLayoutEffect, type FocusEvent, type MouseEvent } from "react";
import { AnimatePresence } from "motion/react";
import type { Food, LogEntryWithFood } from "../types/food";
import { useFoodSearch } from "../hooks/useFoodSearch";
import { BarcodeScannerModal } from "./BarcodeScannerModal";

interface Props {
    onHeaderHeightReady: (height: number) => void;
    onAdd: (log: LogEntryWithFood) => void;
    onSelectFood: (log: LogEntryWithFood) => void;
    onEnteredSearchInput: () => void;
}

export const SearchScreen = ({
    onHeaderHeightReady,
    onAdd,
    onSelectFood,
    onEnteredSearchInput,
}: Props) => {

    const headerRef = useRef<HTMLDivElement>(null);
    const justFocusedRef = useRef(false);

    const [query, setQuery] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const { combinedResults, isSearching } = useFoodSearch(query);

    useLayoutEffect(() => {
        if (headerRef.current) {
            // read the rendered pixel height of the search header/search navbar
            onHeaderHeightReady(headerRef.current.offsetHeight);
        }
    }, [onHeaderHeightReady])

    const buildLogEntry = (food: Food): LogEntryWithFood => ({
        food,
        entry: {
            foodId: food.id,
            timestamp: 0,                       // set at commit time
            quantity: 1,                         // default quantity
            selectedServing: food.servingOptions[0], // default to first option
        }
    });

    const handleScannedFood = (scannedFood: Food) => {
        onSelectFood(buildLogEntry(scannedFood));
    };

    const handleSearchFocus = (e: FocusEvent<HTMLInputElement>) => {
        onEnteredSearchInput();

        const input = e.currentTarget;
        if (input.value.length === 0) return;

        input.select();
        justFocusedRef.current = true;
    };

    const handleSearchMouseUp = (e: MouseEvent<HTMLInputElement>) => {
        if (!justFocusedRef.current) return;
        e.preventDefault();
        justFocusedRef.current = false;
    };

    return (
        <div className="h-full flex flex-col overflow-x-hidden">
            <div ref={headerRef} className="p-4 flex gap-2.5 bg-app-bg border-b border-app-border items-center">
                <input
                    id="search-food-input"
                    autoFocus
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a food..."
                    className="flex-1 p-3.5 bg-app-surface rounded-2xl border border-app-border text-app-text placeholder-app-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-sm transition-all text-base min-w-0"
                    onFocus={handleSearchFocus}
                    onMouseUp={handleSearchMouseUp}
                    onBlur={() => { justFocusedRef.current = false; }}
                />
                <button
                    onClick={() => {
                        onEnteredSearchInput();
                        setIsScannerOpen(true);
                    }}
                    title="Scan Barcode"
                    className="flex-none p-3.5 bg-app-surface border border-app-border rounded-2xl text-app-text hover:border-brand hover:text-brand active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m-4-16v16m8-16v16M4 4v16m16-16v16" />
                    </svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3">
                {combinedResults.length === 0 ? (
                    <span className="block p-4 bg-app-surface rounded-2xl text-app-muted border border-app-border text-sm text-center shadow-sm">
                        {isSearching ? 'Searching database...' : 'No results found'}
                    </span>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {combinedResults.map((food) => (
                            <div
                                key={food.id}
                                className="flex items-center justify-between p-3 bg-app-surface rounded-2xl hover:bg-app-surface/60 hover:border-app-muted/30 transition-all cursor-pointer border border-app-border shadow-sm"
                                onClick={() => onSelectFood(buildLogEntry(food))}
                            >
                                <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                                    <span className="text-2xl w-10 h-10 flex items-center justify-center bg-app-bg border border-app-border rounded-xl">{food.icon}</span>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-app-text text-sm truncate">{food.name}</span>
                                        <span className="text-xs text-app-muted">{food.brand}</span>
                                    </div>
                                </div>
                                <button
                                    className="w-8 h-8 flex items-center justify-center bg-brand-muted text-brand rounded-full hover:bg-brand hover:text-white transition-all active:scale-90 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAdd(buildLogEntry(food));
                                    }}
                                >
                                    <span className="text-xl font-bold -translate-y-[2px]">+</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {isSearching && combinedResults.length > 0 && (
                    <span className="block p-3 text-app-muted text-xs font-semibold text-center">Searching online for more...</span>
                )}
            </div>

            <AnimatePresence>
                {isScannerOpen && (
                    <BarcodeScannerModal
                        onClose={() => setIsScannerOpen(false)}
                        onFoodFound={handleScannedFood}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}