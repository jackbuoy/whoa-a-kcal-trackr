import type { LogEntryWithFood } from "../types/food";

interface Props {
    plate: LogEntryWithFood[];
    isOpen: boolean;
}

export const PlatePill = ({plate, isOpen}: Props) => {
    // empty plate edge case
    const isEmpty = plate.length === 0;

    // shown as icon
    const latestFood = !isEmpty ? plate[plate.length - 1] : null; 
    // count used to show additional plate items added
    const additionalCount = plate.length > 1 ? plate.length - 1 : 0;
    
    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-app-surface-raised rounded-full active:scale-95 transition-all cursor-pointer text-app-text">
            
            <span className="text-lg">{latestFood ? latestFood.food.icon : "🍽️"}</span>
            
            {additionalCount > 0 && (
                <span className="text-xs font-semibold text-app-muted">
                    +{additionalCount}
                </span>
            )}
            

            <div className={`transition-transform duration-200 text-app-muted text-[10px] ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                ▼
            </div>
        </div>
    );
}
