
interface Props {
    date: Date;
    onPrev: () => void;
    onNext: () => void;
}

export const DateNavigator = ({date, onPrev, onNext}: Props) => {
    return (
        <div className="flex justify-between items-center bg-app-surface border border-app-border rounded-2xl p-3 shadow-sm">
            <button 
                onClick={onPrev}
                className="w-10 h-10 flex items-center justify-center bg-app-bg border border-app-border rounded-xl text-app-text hover:bg-app-border active:scale-95 transition-all cursor-pointer font-bold"
            >
                ←
            </button>
            <span className="font-semibold text-app-text tracking-wide">
                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button 
                onClick={onNext}
                className="w-10 h-10 flex items-center justify-center bg-app-bg border border-app-border rounded-xl text-app-text hover:bg-app-border active:scale-95 transition-all cursor-pointer font-bold"
            >
                →
            </button>
        </div>
    );
}