interface Props {
    onClick: () => void;
};

export const AddFoodButton = ({onClick}: Props) => {
    return (
        <button 
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-brand hover:bg-brand-hover text-white text-3xl font-light shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
            onClick={onClick}
            aria-label="Add food"
        >
            +
        </button>
    );
}