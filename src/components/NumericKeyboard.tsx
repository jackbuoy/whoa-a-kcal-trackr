import type { ReactNode } from "react";

export interface KeyboardAction {
    label: string;
    action: string;
    variant?: "primary" | "secondary";
}

type KeyCell = string | KeyboardAction;

interface Props {
    layout: KeyCell[][];
    onKeyPress: (key: string) => void;
    onAction?: (action: string) => void;
}

export const NumericKeyboard = ({ layout, onKeyPress, onAction }: Props) => {

    const renderCell = (cell: KeyCell, rowIndex: number, colIndex: number): ReactNode => {
        // empty string = invisible spacer
        if (cell === "") {
            return <div key={`${rowIndex}-${colIndex}`} className="flex-1" />;
        }

        if (typeof cell === "string") {
            const isBackspace = cell === "⌫";
            const isSpace    = cell === " ";
            const displayLabel = isSpace ? "⌴" : cell; // show visible placeholder for space key

            return (
                <button
                    key={`${rowIndex}-${colIndex}`}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onKeyPress(cell)}
                    className={`flex-1 py-3 rounded-2xl text-base font-bold flex items-center justify-center transition-all active:scale-90 cursor-pointer select-none ${
                        isBackspace || isSpace
                            ? "bg-app-bg border border-app-border text-app-muted hover:bg-app-border"
                            : "bg-app-bg border border-app-border text-app-text hover:bg-app-border"
                    }`}
                >
                    {displayLabel}
                </button>
            );
        }

        // action button
        const isPrimary = cell.variant === "primary";
        return (
            <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                onClick={() => onAction?.(cell.action)}
                className={`flex-1 py-3 px-2 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest transition-all active:scale-95 cursor-pointer select-none ${
                    isPrimary
                        ? "bg-brand text-white hover:bg-brand-hover shadow-sm shadow-brand/10"
                        : "bg-app-bg border border-app-border text-app-text hover:bg-app-border"
                }`}
            >
                {cell.label}
            </button>
        );
    };

    return (
        <div className="w-full flex flex-col gap-2 select-none">
            {layout.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-2">
                    {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
                </div>
            ))}
        </div>
    );
};
