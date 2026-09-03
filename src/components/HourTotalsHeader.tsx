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
    <span className={`w-3.5 h-3.5 flex items-center justify-center rounded-full text-[8px] font-extrabold shrink-0 ${colorClass} ${bgClass}`}>
        {letter}
    </span>
);

export const HourTotalsHeader = ({ hour, foodEntries, isCurrent = false, onAdd }: Props) => {
  const totals = macroMultipleTotals(foodEntries);
  const hasFoods = foodEntries.length > 0;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 min-h-7 w-full min-w-0">
      <div
        className={`w-14 h-7 flex items-center justify-center rounded-full text-[11px] font-bold tracking-tight shrink-0 relative z-10 transition-colors ${
          isCurrent
            ? 'bg-brand text-white shadow-sm shadow-brand/20'
            : 'bg-app-surface text-app-muted border border-app-border'
        }`}
      >
        {hour}
      </div>

      {isCurrent && (
        <span className="shrink-0 text-[8px] font-extrabold uppercase tracking-wider text-brand bg-brand-muted px-1.5 py-0.5 rounded-full">
          Now
        </span>
      )}

      <button
        type="button"
        onClick={onAdd}
        aria-label={`Add food at ${hour}`}
        title={`Add food at ${hour}`}
        className="w-5.5 h-5.5 flex items-center justify-center bg-brand-muted text-brand rounded-full hover:bg-brand hover:text-white active:scale-90 transition-all cursor-pointer shrink-0"
      >
        <span className="text-xs font-bold leading-none -translate-y-[0.5px]">+</span>
      </button>

      {hasFoods && (
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium ml-auto min-w-0 shrink-0">
          <span className={`font-bold whitespace-nowrap ${MACRO_COLORS.calories.textClass}`}>
            {totals.calories} <span className="text-[10px] font-normal text-app-muted">kcal</span>
          </span>
          <span className="text-app-border/80">•</span>
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <MacroLetterBadge letter="P" colorClass={MACRO_COLORS.protein.textClass} bgClass={MACRO_COLORS.protein.bgClass} />
              <span className="text-app-muted text-[10px] sm:text-[11px]">{totals.protein}g</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <MacroLetterBadge letter="F" colorClass={MACRO_COLORS.fat.textClass} bgClass={MACRO_COLORS.fat.bgClass} />
              <span className="text-app-muted text-[10px] sm:text-[11px]">{totals.fat}g</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <MacroLetterBadge letter="C" colorClass={MACRO_COLORS.carbs.textClass} bgClass={MACRO_COLORS.carbs.bgClass} />
              <span className="text-app-muted text-[10px] sm:text-[11px]">{totals.carbs}g</span>
          </div>
        </div>
      )}
    </div>
  );
};
