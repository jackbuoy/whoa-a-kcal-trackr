import { useState } from "react";
import type { LogEntryWithFood } from "../types/food";
import { macroMultipleTotals } from "../utils/logMacroUtils";
import { MACRO_COLORS } from "../constants/macroColors";

interface Props {
    plate: LogEntryWithFood[];
    loggedEntries: LogEntryWithFood[];
}

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

const MACRO_CONFIGS: MacroConfig[] = [
    { key: "calories", label: "Calories", unit: "kcal", goal: DAILY_GOALS.calories },
    { key: "protein",  label: "Protein",  unit: "g",    goal: DAILY_GOALS.protein },
    { key: "fat",      label: "Fat",      unit: "g",    goal: DAILY_GOALS.fat },
    { key: "carbs",    label: "Carbs",    unit: "g",    goal: DAILY_GOALS.carbs },
];

export const PlateNutritionSummary = ({ plate = [], loggedEntries = [] }: Props) => {
    const [viewMode, setViewMode] = useState<"plate-only" | "day-projected">("plate-only");
    
    const plateTotals = macroMultipleTotals(plate);
    const loggedTotals = macroMultipleTotals(loggedEntries);

    return (
        <div className="mb-4 p-4 bg-app-surface rounded-2xl flex flex-col gap-3.5">
            {/* view mode toggle */}
            <div className="flex justify-between items-center pb-1">
                <span className="text-[13px] font-semibold text-app-muted">
                    Nutrition Overview
                </span>
                
                <div className="flex bg-app-bg p-0.5 rounded-full">
                    <button
                        type="button"
                        onClick={() => setViewMode("plate-only")}
                        className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
                            viewMode === "plate-only"
                                ? "bg-app-surface text-app-text shadow-xs"
                                : "text-app-muted hover:text-app-text"
                        }`}
                    >
                        Plate Only
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("day-projected")}
                        className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
                            viewMode === "day-projected"
                                ? "bg-app-surface text-app-text shadow-xs"
                                : "text-app-muted hover:text-app-text"
                        }`}
                    >
                        Day + Plate
                    </button>
                </div>
            </div>

            {/* macro cards */}
            <div className="grid grid-cols-2 gap-2.5">
                {MACRO_CONFIGS.map(({ key, label, unit, goal }) => {
                    const { textClass: textColorClass, dotClass: colorClass } = MACRO_COLORS[key];
                    const plateVal = plateTotals[key];
                    const loggedVal = loggedTotals[key];
                    const totalVal = loggedVal + plateVal;

                    const currentDisplayVal = viewMode === "plate-only" ? plateVal : totalVal;

                    let loggedPercent = 0;
                    let platePercent = 0;

                    if (viewMode === "plate-only") {
                        platePercent = Math.min(100, (plateVal / goal) * 100);
                    } else {
                        loggedPercent = Math.min(100, (loggedVal / goal) * 100);
                        platePercent = Math.min(100 - loggedPercent, (plateVal / goal) * 100);
                    }

                    return (
                        <div key={key} className="flex flex-col p-3 bg-app-bg rounded-xl">
                            <span className="text-[11px] font-medium text-app-muted">
                                {label}
                            </span>
                            
                            <div className="flex items-baseline gap-1 my-1">
                                <span className={`text-xl font-bold ${textColorClass} leading-none tabular-nums`}>
                                    {currentDisplayVal}
                                </span>
                                <span className="text-[11px] text-app-muted">
                                    / {goal} {unit}
                                </span>
                            </div>

                            <div className="w-full h-1.5 bg-app-surface-raised rounded-full overflow-hidden flex relative mt-0.5">
                                {loggedPercent > 0 && (
                                    <div
                                        className={`h-full transition-all duration-300 ${colorClass}`}
                                        style={{ width: `${loggedPercent}%` }}
                                    />
                                )}
                                
                                {platePercent > 0 && (
                                    <div
                                        className={`h-full transition-all duration-300 opacity-70 ${colorClass}`}
                                        style={{ width: `${platePercent}%` }}
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
