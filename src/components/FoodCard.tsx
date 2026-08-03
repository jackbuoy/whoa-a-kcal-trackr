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

// A subtle pill grouping a muted identifier dot with its gram value.
// Intentionally low-contrast — informative without competing with the food name.
const MacroPill = ({ letter, value, textClass, dotClass, bgClass }: MacroPillProps) => (
    <div className={`flex items-center rounded-full overflow-hidden bg-app-bg border border-app-border pr-0.5 ${bgClass ?? ""}`}>
        {/* Muted gray dot as the macro identifier */}
        <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-extrabold text-app-bg shrink-0 ${dotClass ?? "bg-app-muted/50"}`}>
            {letter}
        </span>
        {/* Value text in the pill body */}
        <span className={`text-[10px] font-bold px-1.5 ${textClass ?? "text-app-text"}`}>
            {value}
        </span>
    </div>
);

export function FoodCard({ foodEntry, onSelectCard }: FoodCardProps) {
    const { food, entry } = foodEntry;
    const totals = macroSingleTotals(foodEntry);

    return (
        <div
            className="flex flex-row items-center gap-4 p-4 bg-app-surface border border-app-border rounded-2xl shadow-sm transition-all cursor-pointer"
            onClick={() => onSelectCard?.()}
        >
            <span className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center bg-app-bg border border-app-border rounded-xl">
                {food.icon}
            </span>

            {/* details container */}
            <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-app-text text-sm truncate">{food.name}</span>

                {/* macros row — calories plain, P/F/C as grouped pills */}
                <div className="flex flex-row items-center gap-2 mt-1.5">
                    <span className={`text-xs font-bold ${MACRO_COLORS.calories.textClass}`}>
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

                <div className="text-[10px] text-app-muted mt-1 font-medium tracking-wide">
                    {formatServingDisplay(entry.quantity, entry.selectedServing)}
                </div>
            </div>
        </div>
    );
}