import type { LogEntryWithFood } from "../types/food";
import { FoodCard } from "./FoodCard";
import { PlateNutritionSummary } from "./PlateNutritionSummary";
import { macroMultipleTotals } from "../utils/logMacroUtils";

interface Props {
    plate: LogEntryWithFood[];
    onSelectFood: (item: LogEntryWithFood) => void;
    loggedEntries: LogEntryWithFood[];
    onLogPlate?: () => void;
}

export const PlateDetailScreen = ({ plate = [], onSelectFood, loggedEntries = [], onLogPlate }: Props) => {
    const isEmpty = plate.length === 0;
    const totals = macroMultipleTotals(plate);

    return (
        <div className="h-full overflow-y-auto py-3 pb-[calc(72px+max(0.5rem,calc(env(safe-area-inset-bottom)-16px)))] pr-0.5">
            {/* plate is empty placeholder */}
            {isEmpty && (
                <div className="flex items-center gap-3.5 p-4 bg-app-surface rounded-2xl text-app-text">
                    <span className="text-2xl">🍽️</span>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">Your plate is empty</span>
                        <span className="text-xs text-app-muted">Search and tap foods to add them here.</span>
                    </div>
                </div>
            )}

            {/* normal plate detail */}
            {!isEmpty && (
                <div>
                    <h2 className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-2.5 px-0.5">Your Plate</h2>

                    <div className="flex flex-col gap-2 pb-3">
                        {plate.map((item) => (
                            <div 
                                key={item.entry.instanceId}
                                onClick={() => onSelectFood(item)}
                                className="cursor-pointer"
                            >
                                <FoodCard foodEntry={item} />
                            </div>
                        ))}
                    </div>

                    {/* plate nutrition summary */}
                    <PlateNutritionSummary plate={plate} loggedEntries={loggedEntries} />

                    {/* log plate action */}
                    {onLogPlate && (
                        <div className="pt-1 pb-4">
                            <button
                                onClick={onLogPlate}
                                className="w-full py-4 bg-brand text-white font-bold rounded-2xl active:scale-[0.98] transition-all text-[15px] shadow-lg shadow-brand/20 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Log Plate</span>
                                <span className="text-white/80 font-normal text-sm tabular-nums">
                                    ({totals.calories} kcal)
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
