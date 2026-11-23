import { useState, useMemo, useRef } from "react";
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

    const { food, entry } = foodEntry;

    const [quantityStr, setQuantityStr] = useState(entry.quantity.toString());
    const [selectedUnit, setSelectedUnit] = useState(entry.selectedServing);
    const [keyboardOpen, setKeyboardOpen] = useState(true);
    // clear default value on first keystroke
    const [isInitialInput, setIsInitialInput] = useState(true);

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

        if (isInitialInput && key !== "⌫" && key !== "." && key !== "/" && key !== " ") {
            setIsInitialInput(false);
            setQuantityStr(key);
            return;
        }

        setIsInitialInput(false);

        const start = input.selectionStart ?? quantityStr.length;
        const end = input.selectionEnd ?? quantityStr.length;

        let newValue = quantityStr;
        let newCursorPos = start;

        if (start !== end) {
            if (key === "⌫") {
                newValue = quantityStr.slice(0, start) + quantityStr.slice(end);
                newCursorPos = start;
            } else {
                const remainingText = quantityStr.slice(0, start) + quantityStr.slice(end);
                if (key === "." && remainingText.includes(".")) return;
                if (key === "/" && remainingText.includes("/")) return;
                if (key === " " && (start === 0 || remainingText[start - 1] === " ")) return;

                newValue = quantityStr.slice(0, start) + key + quantityStr.slice(end);
                newCursorPos = start + key.length;
            }
        } else {
            if (key === "⌫") {
                if (start > 0) {
                    newValue = quantityStr.slice(0, start - 1) + quantityStr.slice(start);
                    newCursorPos = start - 1;
                }
            } else if (key === " ") {
                if (quantityStr && !quantityStr.endsWith(" ")) {
                    newValue = quantityStr + " ";
                    newCursorPos = newValue.length;
                }
            } else {
                if (key === "." && quantityStr.includes(".")) return;
                if (key === "/" && quantityStr.includes("/")) return;

                newValue = quantityStr + key;
                newCursorPos = newValue.length;
            }
        }

        setQuantityStr(newValue);

        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const handleAction = (action: string) => {
        if (action === "confirm") onConfirm(handleModifiedEntry(), false);
        else if (action === "log") onConfirm(handleModifiedEntry(), true);
    };

    const isUpdating = entry.instanceId !== undefined || entry.id !== undefined;

    return (
        <div className="flex flex-col h-full w-full bg-app-bg">

            <div
                className="flex-1 overflow-y-auto px-4 pt-[calc(env(safe-area-inset-top,54px)+0.75rem)] pb-4"
                onClick={() => setKeyboardOpen(false)}
            >
                <div className="flex items-center justify-between mb-3 mt-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onBack(); }}
                        className="w-9 h-9 flex items-center justify-center bg-app-surface-raised active:bg-white/15 border border-app-separator rounded-full text-app-text active:scale-95 transition-all cursor-pointer"
                        aria-label="Go back"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>

                    {isUpdating && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const idToRemove = entry.id ?? entry.instanceId;
                                if (idToRemove !== undefined) {
                                    onRemove(idToRemove);
                                }
                            }}
                            className="w-9 h-9 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-full active:scale-95 transition-all cursor-pointer"
                            aria-label="Remove item"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="flex flex-col items-center text-center mb-4">
                    <span className="text-xl font-bold text-app-text leading-tight">
                        {food.name}
                    </span>
                    {food.brand && (
                        <span className="text-xs text-app-muted font-medium mt-1">
                            {food.brand}
                        </span>
                    )}
                </div>

                {/* macro summary */}
                <div className="flex flex-row items-center justify-around gap-2 py-4 px-4 bg-app-surface rounded-2xl w-full border border-app-separator">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-brand leading-none tabular-nums">
                            {totalCalories.calories}
                        </span>
                        <span className="text-[11px] text-app-muted font-medium mt-1">kcal</span>
                    </div>
                    <div className="w-[1px] h-8 bg-app-separator" />
                    <DetailMacroColumn percent={proteinPercent} macro={Number(totalCalories.protein)} label="protein" macroKey="protein" />
                    <DetailMacroColumn percent={fatPercent} macro={Number(totalCalories.fat)} label="fat" macroKey="fat" />
                    <DetailMacroColumn percent={carbsPercent} macro={Number(totalCalories.carbs)} label="carbs" macroKey="carbs" />
                </div>
            </div>

            {/* quantity & keypad */}
            <div
                className="flex-none bg-app-surface rounded-t-3xl pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-app-separator"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative flex items-center w-full px-4 pt-3.5 pb-2">
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="none"
                        value={quantityStr}
                        onClick={() => {
                            setKeyboardOpen(true);
                            setIsInitialInput(false);
                        }}
                        onChange={(e) => setQuantityStr(e.target.value)}
                        onSelect={(e) => {
                            const len = e.currentTarget.value.length;
                            e.currentTarget.setSelectionRange(len, len);
                        }}
                        className="w-full bg-app-bg border border-app-separator rounded-2xl pl-4 pr-24 py-3 text-2xl font-bold text-app-text tracking-tight focus:outline-none focus:border-brand/50 transition-all tabular-nums select-none caret-transparent"
                    />
                    <span className="absolute right-7 top-1/2 -translate-y-1/2 text-xs font-semibold text-app-muted uppercase tracking-wider pointer-events-none">
                        {selectedUnit.label}
                    </span>
                </div>

                {/* serving units */}
                <div className="flex items-center gap-2 px-4 pb-2.5">
                    <div className="flex-1 flex gap-1.5 overflow-x-auto">
                        {food.servingOptions.map((option) => (
                            <button
                                key={option.label}
                                type="button"
                                onClick={() => setSelectedUnit(option)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${option.label === selectedUnit.label
                                        ? "bg-brand text-white shadow-xs"
                                        : "bg-app-surface-raised text-app-muted active:text-app-text border border-app-separator/50"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* keypad */}
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
                            <div className="px-4 pb-2">
                                <NumericKeyboard
                                    layout={[
                                        ["1", "2", "3", "/"],
                                        ["4", "5", "6", " "],
                                        ["7", "8", "9", "⌫"],
                                        [
                                            ".", "0",
                                            { label: "Log", action: "log", variant: "secondary" },
                                            { label: isUpdating ? "Update" : "Add", action: "confirm", variant: "primary" },
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
