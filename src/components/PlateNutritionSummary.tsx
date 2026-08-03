import { useState } from "react";
import type { LogEntryWithFood } from "../types/food";
import { macroMultipleTotals } from "../utils/logMacroUtils";
import { MACRO_COLORS } from "../constants/macroColors";

interface Props {
    plate: LogEntryWithFood[];
    loggedEntries: LogEntryWithFood[];
}

// Placeholder daily macro targets. In a fully-featured app,
// these would be loaded from a user profile/settings context.
const DAILY_GOALS = {
    calories: 2000,
    protein: 140,
    fat: 70,
    carbs: 200,
};

interface MacroConfig {
    key: "calories" | "protein" | "fat" | "carbs";
    label: string;
    unit: string;
    goal: number;
}

// Colors sourced from the shared constants file to stay in sync across the app
const MACRO_CONFIGS: MacroConfig[] = [
    { key: "calories", label: "Calories", unit: "kcal", goal: DAILY_GOALS.calories },
    { key: "protein",  label: "Protein",  unit: "g",    goal: DAILY_GOALS.protein },
    { key: "fat",      label: "Fat",      unit: "g",    goal: DAILY_GOALS.fat },
    { key: "carbs",    label: "Carbs",    unit: "g",    goal: DAILY_GOALS.carbs },
];

export const PlateNutritionSummary = ({ plate = [], loggedEntries = [] }: Props) => {
    const [viewMode, setViewMode] = useState<"plate-only" | "day-projected">("plate-only");
    
    // Aggregate values using the multi-total utility
    const plateTotals = macroMultipleTotals(plate);
    const loggedTotals = macroMultipleTotals(loggedEntries);

    return (
        <div className="mb-6 p-4 bg-app-surface border border-app-border rounded-2xl shadow-sm flex flex-col gap-4">
            
            {/* Header: Segmented view-mode controller */}
            <div className="flex flex-row justify-between items-center border-b border-app-border pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-app-muted">
                    Nutrition Overview
                </span>
                
                <div className="flex bg-app-bg p-0.5 rounded-lg border border-app-border">
                    <button
                        type="button"
                        onClick={() => setViewMode("plate-only")}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                            viewMode === "plate-only"
                                ? "bg-app-surface text-app-text shadow-xs border border-app-border"
                                : "text-app-muted hover:text-app-text"
                        }`}
                    >
                        Plate Only
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("day-projected")}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                            viewMode === "day-projected"
                                ? "bg-app-surface text-app-text shadow-xs border border-app-border"
                                : "text-app-muted hover:text-app-text"
                        }`}
                    >
                        Day + Plate
                    </button>
                </div>
            </div>

            {/* Grid of the 4 macro cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MACRO_CONFIGS.map(({ key, label, unit, goal }) => {
                    const { textClass: textColorClass, dotClass: colorClass } = MACRO_COLORS[key];
                    const plateVal = plateTotals[key];
                    const loggedVal = loggedTotals[key];
                    const totalVal = loggedVal + plateVal;

                    // Decide what values and calculations to use based on view mode
                    const currentDisplayVal = viewMode === "plate-only" ? plateVal : totalVal;

                    // Compute percentages (cap at 100 to avoid layout overflow in progress track)
                    let loggedPercent = 0;
                    let platePercent = 0;

                    if (viewMode === "plate-only") {
                        platePercent = Math.min(100, (plateVal / goal) * 100);
                    } else {
                        loggedPercent = Math.min(100, (loggedVal / goal) * 100);
                        platePercent = Math.min(100 - loggedPercent, (plateVal / goal) * 100);
                    }

                    return (
                        <div key={key} className="flex flex-col p-3 bg-app-bg border border-app-border rounded-xl">
                            {/* Card Header */}
                            <span className="text-[10px] font-bold text-app-muted uppercase tracking-wider">
                                {label}
                            </span>
                            
                            {/* Card Content: Numbers */}
                            <div className="flex items-baseline gap-1 my-1.5">
                                <span className={`text-xl font-extrabold ${textColorClass} leading-none`}>
                                    {currentDisplayVal}
                                </span>
                                <span className="text-xs font-bold text-app-muted">
                                    / {goal} {unit}
                                </span>
                            </div>

                            {/* Card Footer: Visual Progress Bar */}
                            <div className="w-full h-2.5 bg-app-surface border border-app-border rounded-full overflow-hidden flex relative">
                                {/* Logged (Already Eaten) progress segment - Solid */}
                                {loggedPercent > 0 && (
                                    <div
                                        className={`h-full transition-all duration-300 ${colorClass}`}
                                        style={{ width: `${loggedPercent}%` }}
                                    />
                                )}
                                
                                {/* Plate (Pending Draft) progress segment - Semi-transparent diagonal stripes */}
                                {platePercent > 0 && (
                                    <div
                                        className={`h-full transition-all duration-300 opacity-70 ${colorClass}`}
                                        style={{
                                            width: `${platePercent}%`,
                                            backgroundImage:
                                                "repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 8px, transparent 8px, transparent 16px)",
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
