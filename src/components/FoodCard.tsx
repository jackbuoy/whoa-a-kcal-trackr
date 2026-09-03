import type { LogEntryWithFood } from "../types/food";
import { macroSingleTotals } from "../utils/logMacroUtils";
import { formatServingDisplay } from "../utils/stringUtils";
import { MACRO_COLORS } from "../constants/macroColors";

interface FoodCardProps {
    foodEntry: LogEntryWithFood;
    onSelectCard?: () => void;
}

interface MacroPillProps {
    letter: string;
    value: string;
    textClass?: string;
    dotClass?: string;
    bgClass?: string;
}

const MacroPill = ({ letter, value, textClass, dotClass, bgClass }: MacroPillProps) => (
    <div className={`flex items-center rounded-full overflow-hidden bg-app-bg border border-app-border pr-0.5 shrink-0 ${bgClass ?? ""}`}>
        <span className={`w-3.5 h-3.5 flex items-center justify-center rounded-full text-[8px] font-extrabold text-app-bg shrink-0 ${dotClass ?? "bg-app-muted/50"}`}>
            {letter}
        </span>
        <span className={`text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 ${textClass ?? "text-app-text"}`}>
            {value}
        </span>
    </div>
);

export function FoodCard({ foodEntry, onSelectCard }: FoodCardProps) {
    const { food, entry } = foodEntry;
    const totals = macroSingleTotals(foodEntry);

    return (
        <div
            className="flex flex-row items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-app-surface border border-app-border rounded-xl sm:rounded-2xl shadow-sm hover:border-brand/40 active:scale-[0.99] transition-all cursor-pointer min-w-0"
            onClick={() => onSelectCard?.()}
        >
            <span className="text-xl flex-shrink-0 w-8.5 h-8.5 sm:w-9 sm:h-9 flex items-center justify-center bg-app-bg border border-app-border rounded-lg sm:rounded-xl">
                {food.icon}
            </span>

            {/* details container */}
            <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-app-text text-xs sm:text-sm truncate">{food.name}</span>

                {/* macros row, calories plain, P/F/C as grouped pills */}
                <div className="flex flex-row items-center flex-wrap gap-1.5 sm:gap-2 mt-1">
                    <span className={`text-[11px] sm:text-xs font-bold shrink-0 ${MACRO_COLORS.calories.textClass}`}>
                        {totals.calories} kcal
                    </span>
                    <MacroPill
                        letter="P"
                        value={`${totals.protein}g`}
                        textClass={MACRO_COLORS.protein.textClass}
                        dotClass={MACRO_COLORS.protein.dotClass}
                        bgClass={MACRO_COLORS.protein.bgClass}
                    />
                    <MacroPill
                        letter="F"
                        value={`${totals.fat}g`}
                        textClass={MACRO_COLORS.fat.textClass}
                        dotClass={MACRO_COLORS.fat.dotClass}
                        bgClass={MACRO_COLORS.fat.bgClass}
                    />
                    <MacroPill
                        letter="C"
                        value={`${totals.carbs}g`}
                        textClass={MACRO_COLORS.carbs.textClass}
                        dotClass={MACRO_COLORS.carbs.dotClass}
                        bgClass={MACRO_COLORS.carbs.bgClass}
                    />
                </div>

                <div className="text-[10px] text-app-muted mt-0.5 font-medium tracking-wide truncate">
                    {formatServingDisplay(entry.quantity, entry.selectedServing)}
                </div>
            </div>
        </div>
    );
}