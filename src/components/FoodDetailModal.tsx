import { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { LogEntryWithFood } from "../types/food";
import { macroSingleTotalsLive } from "../utils/logMacroUtils";
import { DetailMacroColumn } from "./DetailMacroColumn";
import { NumericKeyboard } from "./NumericKeyboard";
import { parseQuantityString } from "../utils/stringUtils";

interface Props {
    foodEntry: LogEntryWithFood;
    onConfirm: (modifiedEntry: LogEntryWithFood, shouldCommit?: boolean) => void;
    onBack: () => void;
    onRemove: (idToRemove: string | number) => void;
}

export function FoodDetailModal({ foodEntry, onConfirm, onBack, onRemove }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);    
    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const { food, entry } = foodEntry;

    const [quantityStr, setQuantityStr] = useState(entry.quantity.toString());
    const [selectedUnit, setSelectedUnit] = useState(entry.selectedServing);
    const [keyboardOpen, setKeyboardOpen] = useState(true);

    const quantity = useMemo(() => parseQuantityString(quantityStr), [quantityStr]);
    const totalCalories = macroSingleTotalsLive(food, quantity, selectedUnit);

    const macroCalories =
        (Number(totalCalories.protein) * 4) +
        (Number(totalCalories.carbs) * 4) +
        (Number(totalCalories.fat) * 9);

    const proteinPercent = macroCalories > 0
        ? Math.round(((Number(totalCalories.protein) * 4) / macroCalories) * 100) : 0;
    const fatPercent = macroCalories > 0
        ? Math.round(((Number(totalCalories.fat) * 9) / macroCalories) * 100) : 0;
    const carbsPercent = macroCalories > 0
        ? Math.round(((Number(totalCalories.carbs) * 4) / macroCalories) * 100) : 0;

    const handleModifiedEntry = (): LogEntryWithFood => ({
        food,
        entry: { ...entry, selectedServing: selectedUnit, quantity }
    });

    const handleKeyPress = (key: string) => {
        const input = inputRef.current;
        if (!input) return;

        // get the selection positions from the HTML input
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;

        let newValue = quantityStr;
        let newCursorPos = start;

        if (start !== end) {
            // case a: text is currently highlighted
            if (key === "⌫") {
                // delete the highlighted section
                newValue = quantityStr.slice(0, start) + quantityStr.slice(end);
                newCursorPos = start;
            } else {
                // get the text outside the selection to check for existing '.' or '/'
                const remainingText = quantityStr.slice(0, start) + quantityStr.slice(end);
                if (key === "." && remainingText.includes(".")) return;
                if (key === "/" && remainingText.includes("/")) return;

                // space key rules: don't start with space, and don't allow duplicate spaces
                if (key === " " && (start === 0 || remainingText[start - 1] === " ")) {
                    return;
                }

                // replace the highlighted selection with the new key
                newValue = quantityStr.slice(0, start) + key + quantityStr.slice(end);
                newCursorPos = start + key.length;
            }
        } else {
            // case b: standard typing (no highlight)
            if (key === "⌫") {
                // delete the single character behind the cursor
                if (start > 0) {
                    newValue = quantityStr.slice(0, start - 1) + quantityStr.slice(start);
                    newCursorPos = start - 1;
                }
            } else if (key === " ") {
                // space key rules: don't duplicate trailing spaces
                if (quantityStr && !quantityStr.endsWith(" ")) {
                    newValue = quantityStr + " ";
                    newCursorPos = newValue.length;
                }
            } else {
                // dot and slash constraints: only one allowed per entry
                if (key === "." && quantityStr.includes(".")) return;
                if (key === "/" && quantityStr.includes("/")) return;
                
                // append character normally
                newValue = quantityStr + key;
                newCursorPos = newValue.length;
            }
        }

        setQuantityStr(newValue);

        setTimeout(() => {
            input.focus();
            input.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };


    const handleAction = (action: string) => {
        if (action === "confirm") onConfirm(handleModifiedEntry(), false);
        else if (action === "log") onConfirm(handleModifiedEntry(), true);
    };

    const isUpdating = entry.instanceId !== undefined || entry.id !== undefined;

    return (
        <div className="flex flex-col h-full w-full bg-app-bg">

            {/* scrollable content, tapping here dismisses the keyboard*/}
            <div
                className="flex-1 overflow-y-auto px-4 pt-6 pb-4"
                onClick={() => setKeyboardOpen(false)}
            >
                {/* back button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onBack(); }}
                    className="mb-5 w-9 h-9 flex items-center justify-center bg-app-surface border border-app-border rounded-lg text-base font-bold hover:bg-app-border active:scale-95 transition-all cursor-pointer text-app-text"
                >
                    ←
                </button>

                {/* food name and brand */}
                <div className="flex flex-col items-center text-center mb-5">
                    <span className="text-xl font-extrabold text-app-text leading-tight">
                        {food.name}
                    </span>
                    {food.brand && (
                        <span className="text-xs text-app-muted font-bold uppercase tracking-wider mt-1">
                            {food.brand}
                        </span>
                    )}
                </div>

                {/* macros summary card */}
                <div className="flex flex-row items-center justify-around gap-2 py-5 px-4 bg-app-surface border border-app-border rounded-xl w-full shadow-sm">
                    <div className="flex flex-col items-center">
                        <span className="text-4xl font-extrabold text-app-text leading-none">
                            {totalCalories.calories}
                        </span>
                        <span className="text-[10px] text-app-muted font-bold uppercase tracking-widest mt-1.5">kcal</span>
                    </div>
                    <div className="w-[1px] h-10 bg-app-border" />
                    <DetailMacroColumn percent={proteinPercent} macro={Number(totalCalories.protein)} label="protein" macroKey="protein" />
                    <DetailMacroColumn percent={fatPercent}    macro={Number(totalCalories.fat)}     label="fat"     macroKey="fat" />
                    <DetailMacroColumn percent={carbsPercent}  macro={Number(totalCalories.carbs)}   label="carbs"   macroKey="carbs" />
                </div>

                {isUpdating && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const idToRemove = entry.id ?? entry.instanceId;
                            if (idToRemove !== undefined) {
                                onRemove(idToRemove);
                            }
                        }}
                        className="block mx-auto mt-4 text-xs text-red-500 hover:text-red-600 font-bold hover:underline cursor-pointer"
                    >
                        Remove from Plate
                    </button>
                )}
            </div>
            <div
                className="flex-none border-t border-app-border bg-app-surface/95 backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* input display bar, tapping toggles keyboard */}
                <div className="relative flex items-center w-full px-3 pt-3 pb-2">
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="none"
                        value={quantityStr}
                        onClick={() => setKeyboardOpen(true)}
                        onChange={(e) => setQuantityStr(e.target.value)}
                        onFocus={() => inputRef.current?.select()} // auto highlights on tap/focus
                        className="w-full bg-app-bg border border-app-border rounded-lg pl-3 pr-16 py-2.5 text-xl font-extrabold text-app-text tracking-wide focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                    />
                    <span className="absolute right-6 top-[55%] -translate-y-1/2 text-xs font-bold text-app-muted uppercase tracking-widest pointer-events-none">
                        {selectedUnit.label}
                    </span>
                </div>


                {/* serving options strip */}
                <div className="flex items-center gap-2 px-3 pb-2">
                    <span className="text-app-muted text-sm font-bold shrink-0">⇅</span>
                    <div className="flex-1 flex gap-1.5 overflow-x-auto">
                        {food.servingOptions.map((option) => (
                            <button
                                key={option.label}
                                type="button"
                                onClick={() => setSelectedUnit(option)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                                    option.label === selectedUnit.label
                                        ? "bg-brand border-brand text-white shadow-sm"
                                        : "bg-app-bg border-app-border text-app-muted hover:border-app-muted/30"
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* keyboard */}
                <AnimatePresence>
                    {keyboardOpen && (
                        <motion.div
                            key="keyboard"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ type: "spring", damping: 32, stiffness: 350 }}
                            className="overflow-hidden"
                        >
                            <div className="px-3 pb-3 pt-1">
                                <NumericKeyboard
                                    layout={[
                                        ["1", "2", "3", "/"],
                                        ["4", "5", "6", " "],
                                        ["7", "8", "9", "⌫"],
                                        [
                                            ".", "0",
                                            { label: "Log Foods", action: "log",     variant: "secondary" },
                                            { label: isUpdating ? "Update" : "Add",  action: "confirm", variant: "primary" },
                                        ],
                                    ]}
                                    onKeyPress={handleKeyPress}
                                    onAction={handleAction}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}