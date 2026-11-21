interface Props {
    onLog: () => void;
}

export const LogFoodButton = ({onLog}: Props) => {
    return (
        <button
            className="bg-brand shadow-lg shadow-brand/20 px-6 py-3.5 rounded-full text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            onClick={onLog}
        >
            Log Foods
        </button>
    );
}
