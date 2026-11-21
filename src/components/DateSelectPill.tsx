import { timeFormatter } from "../utils/dateUtils";

interface Props {
    date: Date;
    onSelectPill: () => void;
}

export const DateSelectPill = ({date, onSelectPill}: Props) => {
    
    const isToday = date.toDateString() === new Date().toDateString();

    return (
        <div 
            className="flex flex-col items-center px-4 py-1.5 bg-app-surface-raised rounded-full active:scale-95 transition-all cursor-pointer"
            onClick={onSelectPill}
        >
            <span className="text-[13px] font-semibold text-app-text leading-tight">
                {timeFormatter(date)}
            </span>
            <span className="text-[10px] text-app-muted font-medium leading-tight mt-0.5">
                {isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            
        </div>
    );
}
