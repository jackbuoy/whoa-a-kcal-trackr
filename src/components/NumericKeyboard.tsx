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
            const isSpecial = cell === "/" || cell === " " || cell === "⌫" || cell === ".";
            const displayLabel = cell === " " ? "␣" : cell;

            return (
                <button
                    key={`${rowIndex}-${colIndex}`}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onKeyPress(cell)}
                    className={`flex-1 h-13 rounded-2xl flex items-center justify-center transition-all active:scale-[0.93] active:brightness-125 cursor-pointer select-none border border-white/[0.08] shadow-[0_1.5px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] ${
                        isSpecial
                            ? "bg-app-surface text-app-muted text-[17px] font-medium"
                            : "bg-app-surface-raised text-app-text text-[22px] font-medium tabular-nums"
                    }`}
                >
                    {isBackspace ? (
                        <svg className="w-5 h-5 text-app-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
                        </svg>
                    ) : (
                        displayLabel
                    )}
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
                className={`flex-1 h-13 px-2 rounded-2xl text-[14px] transition-all active:scale-[0.94] cursor-pointer select-none font-semibold ${
                    isPrimary
                        ? "bg-gradient-to-b from-[#FF9F0A] to-[#E8900A] text-white shadow-[0_2px_10px_rgba(255,159,10,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] border border-transparent font-bold"
                        : "bg-app-surface-raised text-brand border border-brand/25 shadow-[0_1.5px_2px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] active:bg-brand/10"
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
