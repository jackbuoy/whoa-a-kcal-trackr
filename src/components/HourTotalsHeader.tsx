import { macroMultipleTotals } from "../utils/logMacroUtils";
import type { LogEntryWithFood } from "../types/food";
import { MACRO_COLORS } from "../constants/macroColors";

interface Props {
  hour: string;
  foodEntries: LogEntryWithFood[];
  isCurrent?: boolean;
  onAdd: () => void;
}

const MacroLetterBadge = ({ letter, colorClass, bgClass }: { letter: string; colorClass: string; bgClass: string }) => (
    <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-extrabold ${colorClass} ${bgClass}`}>
        {letter}
    </span>
);

export const HourTotalsHeader = ({ hour, foodEntries, isCurrent = false, onAdd }: Props) => {
  const totals = macroMultipleTotals(foodEntries);
  const hasFoods = foodEntries.length > 0;

  return (
    <div className="flex items-center gap-2 min-h-8">
      <div
        className={`w-[4.75rem] h-8 flex items-center justify-center rounded-full text-[11px] font-bold tracking-wide shrink-0 relative z-10 ${
          isCurrent
            ? 'bg-brand text-white shadow-sm shadow-brand/20'
            : 'bg-app-surface text-app-muted border border-app-border'
        }`}
      >
        {hour}
      </div>

      {isCurrent && (
        <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-wider text-brand bg-brand-muted px-1.5 py-0.5 rounded-full">
          Now
        </span>
      )}

      <button
        type="button"
        onClick={onAdd}
        aria-label={`Add food at ${hour}`}
        title={`Add food at ${hour}`}
        className="w-6 h-6 flex items-center justify-center bg-brand-muted text-brand rounded-full hover:bg-brand hover:text-white active:scale-90 transition-all cursor-pointer shrink-0"
      >
        <span className="text-sm font-bold leading-none -translate-y-[1px]">+</span>
      </button>

      {hasFoods && (
        <div className="flex items-center gap-2 text-xs font-medium shrink-0 ml-auto">
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
      )}
    </div>
  );
};
