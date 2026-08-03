import { macroMultipleTotals } from "../utils/logMacroUtils";
import type { LogEntryWithFood } from "../types/food";
import { MACRO_COLORS } from "../constants/macroColors";

interface Props {
  hour: string;
  foodEntries: LogEntryWithFood[];
}

// Compact letter badge with tinted bubble for use in tight spaces
const MacroLetterBadge = ({ letter, colorClass, bgClass }: { letter: string; colorClass: string; bgClass: string }) => (
    <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-extrabold ${colorClass} ${bgClass}`}>
        {letter}
    </span>
);

export const HourTotalsHeader = ({ hour, foodEntries }: Props) => {
  const totals = macroMultipleTotals(foodEntries);

  return (
    <div className="flex justify-between items-center mb-2 px-1">
      {/* hour label */}
      <h2 className="text-app-muted text-xs font-bold uppercase tracking-widest">
        {hour}
      </h2>

      {/* macro totals — calories plain, P/F/C with letter bubbles */}
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className={`font-bold ${MACRO_COLORS.calories.textClass}`}>{totals.calories} kcal</span>
        <span className="text-app-border">•</span>
        <div className="flex items-center gap-1">
            <MacroLetterBadge letter="P" colorClass={MACRO_COLORS.protein.textClass} bgClass={MACRO_COLORS.protein.bgClass} />
            <span className="text-app-muted">{totals.protein}g</span>
        </div>
        <div className="flex items-center gap-1">
            <MacroLetterBadge letter="F" colorClass={MACRO_COLORS.fat.textClass} bgClass={MACRO_COLORS.fat.bgClass} />
            <span className="text-app-muted">{totals.fat}g</span>
        </div>
        <div className="flex items-center gap-1">
            <MacroLetterBadge letter="C" colorClass={MACRO_COLORS.carbs.textClass} bgClass={MACRO_COLORS.carbs.bgClass} />
            <span className="text-app-muted">{totals.carbs}g</span>
        </div>
      </div>
    </div>
  );
};