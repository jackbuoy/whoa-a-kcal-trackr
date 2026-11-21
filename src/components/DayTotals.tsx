import type { LogEntryWithFood } from "../types/food";
import { macroMultipleTotals } from "../utils/logMacroUtils";

interface Props {
    foodEntries: LogEntryWithFood[];
}

export const DayTotals = ({ foodEntries }: Props) => {
    const totals = macroMultipleTotals(foodEntries);

    return (
        <div className="px-3.5 py-2.5 bg-app-surface rounded-2xl flex items-center justify-between border border-app-separator shadow-xs">
            {/* Calories — compact headline number */}
            <div className="flex items-baseline gap-1.5 pl-0.5">
                <span className="text-xl font-bold text-brand leading-none tabular-nums">
                    {totals.calories}
                </span>
                <span className="text-xs font-medium text-app-muted">kcal</span>
            </div>

            {/* Macros — compact inline pills */}
            <div className="flex items-center gap-2 tabular-nums text-xs">
                <div className="flex items-center gap-1 px-2.5 py-1 bg-app-bg rounded-lg">
                    <span className="text-[11px] font-bold text-rose-400">P</span>
                    <span className="font-semibold text-app-text text-[12px]">{totals.protein}g</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-app-bg rounded-lg">
                    <span className="text-[11px] font-bold text-amber-400">F</span>
                    <span className="font-semibold text-app-text text-[12px]">{totals.fat}g</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-app-bg rounded-lg">
                    <span className="text-[11px] font-bold text-emerald-400">C</span>
                    <span className="font-semibold text-app-text text-[12px]">{totals.carbs}g</span>
                </div>
            </div>
        </div>
    );
};
