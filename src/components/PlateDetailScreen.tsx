import type { LogEntryWithFood } from "../types/food";
import { FoodCard } from "./FoodCard";
import { PlateNutritionSummary } from "./PlateNutritionSummary";

interface Props {
    plate: LogEntryWithFood[];
    onSelectFood: (item: LogEntryWithFood) => void;
    loggedEntries: LogEntryWithFood[];
}

export const PlateDetailScreen = ({ plate = [], onSelectFood, loggedEntries = [] }: Props) => {
    const isEmpty = plate.length === 0;

    return (
        <div className="h-full overflow-y-auto py-4 pb-24 pr-1">
            {/* plate is empty placeholder */}
            {isEmpty && (
                <div className="flex flex-row items-center gap-4 p-4 bg-app-surface rounded-2xl text-app-text border border-app-border shadow-sm">
                    <span className="text-2xl text-brand">🍽️</span>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm">Your plate is empty</span>
                        <span className="text-xs text-app-muted">Search and tap foods to add them here.</span>
                    </div>
                </div>
            )}

            {/* normal plate detail impl */}
            {!isEmpty && (
                <div>
                    <h2 className="text-xs font-bold text-app-muted uppercase tracking-widest mb-3">Your Plate</h2>

                    <div className="flex flex-col gap-3 pb-4">
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

                    {/* plate macro totals & daily progression visualizer */}
                    <PlateNutritionSummary plate={plate} loggedEntries={loggedEntries} />
                </div>
            )}
        </div>
    );
        // WIP for later
        // Nutrition of plate
}