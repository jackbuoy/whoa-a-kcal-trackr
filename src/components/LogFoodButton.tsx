interface Props {
    onLog: () => void;
}

export const LogFoodButton = ({onLog}: Props) => {
    return (
        <button
            className="bg-brand hover:bg-brand-hover shadow-md shadow-brand/10 px-6 py-3 rounded-full text-white font-extrabold text-xs uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
            onClick={onLog}
        >
            Log Foods
        </button>
    );
}