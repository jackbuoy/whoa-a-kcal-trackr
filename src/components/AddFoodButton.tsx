interface Props {
    onClick: () => void;
}

export const AddFoodButton = ({ onClick }: Props) => {
    return (
        <button
            onClick={onClick}
            className="w-full h-11 px-4 bg-app-surface active:bg-app-surface-raised border border-app-separator rounded-2xl flex items-center justify-between text-app-muted hover:text-app-text transition-all active:scale-[0.99] cursor-pointer shadow-xs"
        >
            <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <span className="text-[14px] font-medium text-app-muted">Search food to log...</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm shadow-xs">
                +
            </div>
        </button>
    );
};
