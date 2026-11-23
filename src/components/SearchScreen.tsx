import { useState, useRef, useLayoutEffect, useEffect, type FocusEvent, type MouseEvent } from "react";
import { AnimatePresence } from "motion/react";
import type { Food, LogEntryWithFood } from "../types/food";
import { useFoodSearch } from "../hooks/useFoodSearch";
import { BarcodeScannerModal } from "./BarcodeScannerModal";

interface Props {
    onHeaderHeightReady: (height: number) => void;
    onAdd: (log: LogEntryWithFood) => void;
    onSelectFood: (log: LogEntryWithFood) => void;
    onEnteredSearchInput: () => void;
    plateCount?: number;
    onLogPlate?: () => void;
}

export const SearchScreen = ({
    onHeaderHeightReady,
    onAdd,
    onSelectFood,
    onEnteredSearchInput,
    plateCount = 0,
    onLogPlate,
}: Props) => {

    const headerRef = useRef<HTMLDivElement>(null);
    const justFocusedRef = useRef(false);

    const [query, setQuery] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const { combinedResults, isSearching } = useFoodSearch(query);

    // lock scroll position when virtual keyboard opens
    useEffect(() => {
        const clampScroll = () => {
            if (window.scrollY !== 0 || window.scrollX !== 0) {
                window.scrollTo(0, 0);
            }
        };
        window.addEventListener('scroll', clampScroll, { passive: true });
        return () => window.removeEventListener('scroll', clampScroll);
    }, []);

    useLayoutEffect(() => {
        if (headerRef.current) {
            onHeaderHeightReady(headerRef.current.offsetHeight);
        }
    }, [onHeaderHeightReady]);

    const buildLogEntry = (food: Food): LogEntryWithFood => ({
        food,
        entry: {
            foodId: food.id,
            timestamp: 0,
            quantity: 1,
            selectedServing: food.servingOptions[0],
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
        <div className="h-full w-full flex flex-col overflow-hidden bg-app-bg">
            {/* search bar */}
            <div ref={headerRef} className="flex-none shrink-0 p-4 pb-2.5 flex gap-2 bg-app-bg items-center">
                <input
                    id="search-food-input"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a food..."
                    className="flex-1 h-11 px-3.5 bg-app-surface border border-app-separator rounded-2xl text-app-text placeholder-app-muted focus:outline-none focus:border-brand/50 transition-all text-[15px] min-w-0"
                    onFocus={(e) => {
                        handleSearchFocus(e);
                        window.scrollTo(0, 0);
                    }}
                    onMouseUp={handleSearchMouseUp}
                    onBlur={() => { justFocusedRef.current = false; }}
                />
                <button
                    onClick={() => {
                        onEnteredSearchInput();
                        setIsScannerOpen(true);
                    }}
                    title="Scan Barcode"
                    className="flex-none w-11 h-11 bg-app-surface active:bg-app-surface-raised border border-app-separator rounded-2xl text-app-muted active:text-brand active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m-4-16v16m8-16v16M4 4v16m16-16v16" />
                    </svg>
                </button>
                {/* log plate shortcut */}
                {plateCount > 0 && onLogPlate && (
                    <button
                        onClick={onLogPlate}
                        title="Log Plate"
                        className="flex-none h-11 px-4 bg-brand hover:bg-brand-hover text-white font-semibold rounded-2xl active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-[14px] shadow-sm shadow-brand/20 shrink-0 border border-transparent"
                    >
                        <span>Log</span>
                        <span className="text-white/85 font-normal text-xs tabular-nums">({plateCount})</span>
                    </button>
                )}
            </div>

            {/* results list */}
            {combinedResults.length === 0 ? (
                <div 
                    className="flex-1 min-h-0 overflow-hidden flex flex-col items-center justify-start pt-8 px-4 touch-none select-none"
                    onTouchMove={(e) => e.preventDefault()}
                >
                    <span className="block p-4 text-app-muted text-sm text-center">
                        {isSearching ? 'Searching database...' : 'No results found'}
                    </span>
                </div>
            ) : (
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 py-2 pb-6">
                    <div className="flex flex-col gap-2">
                        {combinedResults.map((food) => (
                            <div
                                key={food.id}
                                className="flex items-center justify-between p-3 bg-app-surface rounded-2xl active:bg-app-surface-raised transition-colors cursor-pointer"
                                onClick={() => onSelectFood(buildLogEntry(food))}
                            >
                                <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                                    <span className="text-2xl w-10 h-10 flex items-center justify-center bg-app-bg rounded-xl shrink-0">{food.icon}</span>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold text-app-text text-sm truncate">{food.name}</span>
                                        <span className="text-xs text-app-muted">{food.brand}</span>
                                    </div>
                                </div>
                                <button
                                    className="w-8 h-8 flex items-center justify-center bg-brand-muted text-brand rounded-full hover:bg-brand hover:text-white transition-all active:scale-90 cursor-pointer shrink-0"
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
                    {isSearching && (
                        <span className="block p-3 text-app-muted text-xs font-medium text-center">Searching online for more...</span>
                    )}
                </div>
            )}

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
};
