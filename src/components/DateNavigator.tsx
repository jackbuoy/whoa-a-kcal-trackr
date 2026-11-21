
interface Props {
    date: Date;
    onPrev: () => void;
    onNext: () => void;
}

export const DateNavigator = ({date, onPrev, onNext}: Props) => {
    return (
        <div className="flex items-center justify-between px-1">
            <button 
                onClick={onPrev}
                className="w-10 h-10 flex items-center justify-center rounded-full text-app-muted active:bg-app-surface-raised transition-colors cursor-pointer"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <span className="text-[15px] font-semibold text-app-text tracking-wide">
                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button 
                onClick={onNext}
                className="w-10 h-10 flex items-center justify-center rounded-full text-app-muted active:bg-app-surface-raised transition-colors cursor-pointer"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </div>
    );
}
