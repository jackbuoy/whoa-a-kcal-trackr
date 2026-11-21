import { macroMultipleTotals } from "../utils/logMacroUtils";
import type { LogEntryWithFood } from "../types/food";
import { MACRO_COLORS } from "../constants/macroColors";

interface Props {
  hour: string;
  foodEntries: LogEntryWithFood[];
  isCurrent?: boolean;
  onAdd: () => void;
}

export const HourTotalsHeader = ({ hour, foodEntries, isCurrent = false, onAdd }: Props) => {
  const totals = macroMultipleTotals(foodEntries);
  const hasFoods = foodEntries.length > 0;

  return (
    <div className="flex items-center gap-1.5 min-h-7 w-full min-w-0">
      <div
        className={`w-14 h-7 flex items-center justify-center rounded-full text-[11px] font-semibold tracking-tight shrink-0 relative z-10 transition-colors ${
          isCurrent
            ? 'bg-brand text-white'
            : 'bg-app-surface text-app-muted'
        }`}
      >
        {hour}
      </div>

      {isCurrent && (
        <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider text-brand bg-brand-muted px-1.5 py-0.5 rounded-full">
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
        <div className="flex items-center gap-1.5 text-[11px] font-medium ml-auto min-w-0 shrink-0 tabular-nums">
          <span className={`font-semibold whitespace-nowrap ${MACRO_COLORS.calories.textClass}`}>
            {totals.calories} <span className="text-[10px] font-normal text-app-muted">kcal</span>
          </span>
          <span className="text-app-muted/30">·</span>
          <span className="text-app-muted">P {totals.protein}g</span>
          <span className="text-app-muted">F {totals.fat}g</span>
          <span className="text-app-muted">C {totals.carbs}g</span>
        </div>
      )}
    </div>
  );
};
