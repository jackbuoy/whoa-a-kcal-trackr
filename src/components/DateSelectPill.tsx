import { timeFormatter } from "../utils/dateUtils";

interface Props {
    date: Date;
    onSelectPill: () => void;
}

export const DateSelectPill = ({date, onSelectPill}: Props) => {
    
    const isToday = date.toDateString() === new Date().toDateString();

    return (
        <div 
            className="flex flex-col items-center px-5 py-1.5 bg-app-surface border border-app-border rounded-full shadow-sm hover:border-app-muted/30 active:scale-95 transition-all cursor-pointer"
            onClick={onSelectPill}
        >
            <span className="text-sm font-bold text-app-text leading-tight">
                {timeFormatter(date)}
            </span>
            <span className="text-[10px] text-app-muted font-semibold leading-tight uppercase tracking-wider mt-0.5">
                {isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            
        </div>
    );
}