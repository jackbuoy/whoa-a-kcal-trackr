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
        <div className="flex items-center gap-2 px-3 py-1 bg-app-surface border border-app-border rounded-full shadow-sm transition-all hover:border-app-muted/30 active:scale-95 cursor-pointer text-app-text">
            
            <span className="text-xl">{latestFood ? latestFood.food.icon : "🍽️"}</span>
            
            {additionalCount > 0 && (
                <span className="text-sm font-bold text-app-muted">
                    +{additionalCount}
                </span>
            )}
            

            <div className={`ml-1 transition-transform duration-300 text-app-muted text-xs ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                ▼
            </div>
                
                {/* {plate.map((food) => (
                    <span
                        key={food.id}
                        className="flex p-1 gap-5 bg-zinc-800 rounded-2xl"
                    >
                        {food.icon}
                    </span>
                ))} */}
        </div>
    );
}