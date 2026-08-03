import type { LogEntryWithFood } from "../types/food";
import { macroMultipleTotals } from "../utils/logMacroUtils";
import { MACRO_COLORS } from "../constants/macroColors";

interface Props {
    foodEntries: LogEntryWithFood[];
}

// A small pill badge used to label each macro consistently
const MacroBadge = ({ label, colorClass, bgClass }: { label: string; colorClass: string; bgClass: string }) => (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${colorClass} ${bgClass}`}>
        {label}
    </span>
);

export const DayTotals = ({ foodEntries }: Props) => {
    const totals = macroMultipleTotals(foodEntries);

    return (
        <div className="mb-6 p-5 bg-app-surface rounded-2xl border border-app-border shadow-sm flex flex-row items-center justify-between gap-4">
            {/* Calories — big headline number */}
            <div className="flex flex-col">
                <span className="text-[10px] text-app-muted font-bold uppercase tracking-wider mb-0.5">Total Energy</span>
                <span className={`text-3xl font-extrabold leading-none ${MACRO_COLORS.calories.textClass}`}>
                    {totals.calories} <span className="text-sm font-semibold text-app-muted">kcal</span>
                </span>
            </div>

            {/* Macros — value + labelled bubble */}
            <div className="flex gap-4 md:gap-6">
                <div className="flex flex-col items-center gap-1">
                    <MacroBadge label="Protein" colorClass={MACRO_COLORS.protein.textClass} bgClass={MACRO_COLORS.protein.bgClass} />
                    <span className={`text-sm font-bold text-app-text`}>{totals.protein}g</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <MacroBadge label="Fat" colorClass={MACRO_COLORS.fat.textClass} bgClass={MACRO_COLORS.fat.bgClass} />
                    <span className={`text-sm font-bold text-app-text`}>{totals.fat}g</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <MacroBadge label="Carbs" colorClass={MACRO_COLORS.carbs.textClass} bgClass={MACRO_COLORS.carbs.bgClass} />
                    <span className={`text-sm font-bold text-app-text`}>{totals.carbs}g</span>
                </div>
            </div>
        </div>
    );
};
