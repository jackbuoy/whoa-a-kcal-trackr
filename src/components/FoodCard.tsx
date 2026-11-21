import type { LogEntryWithFood } from "../types/food";
import { macroSingleTotals } from "../utils/logMacroUtils";
import { formatServingDisplay } from "../utils/stringUtils";
import { MACRO_COLORS } from "../constants/macroColors";

interface FoodCardProps {
    foodEntry: LogEntryWithFood;
    onSelectCard?: () => void;
}

export function FoodCard({ foodEntry, onSelectCard }: FoodCardProps) {
    const { food, entry } = foodEntry;
    const totals = macroSingleTotals(foodEntry);

    return (
        <div
            className="flex items-center gap-3 p-3.5 bg-app-surface rounded-2xl active:bg-app-surface-raised transition-colors cursor-pointer min-w-0 shadow-xs border border-app-separator/40"
            onClick={() => onSelectCard?.()}
        >
            <span className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center bg-app-bg rounded-xl">
                {food.icon}
            </span>

            <div className="flex flex-col flex-1 min-w-0">
                <span className="font-semibold text-app-text text-[14px] truncate leading-tight">{food.name}</span>

                <div className="flex items-center gap-1.5 mt-1 text-[11px] tabular-nums">
                    <span className={`font-semibold ${MACRO_COLORS.calories.textClass}`}>
                        {totals.calories} kcal
                    </span>
                    <span className="text-app-muted/30">·</span>
                    <span className="text-app-muted">
                        P <span className={`font-semibold ${MACRO_COLORS.protein.textClass}`}>{totals.protein}g</span>
                    </span>
                    <span className="text-app-muted/30">·</span>
                    <span className="text-app-muted">
                        F <span className={`font-semibold ${MACRO_COLORS.fat.textClass}`}>{totals.fat}g</span>
                    </span>
                    <span className="text-app-muted/30">·</span>
                    <span className="text-app-muted">
                        C <span className={`font-semibold ${MACRO_COLORS.carbs.textClass}`}>{totals.carbs}g</span>
                    </span>
                </div>

                <span className="text-[11px] text-app-muted mt-0.5 truncate">
                    {formatServingDisplay(entry.quantity, entry.selectedServing)}
                </span>
            </div>
        </div>
    );
}
