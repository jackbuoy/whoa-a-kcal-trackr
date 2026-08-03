import { MACRO_COLORS } from "../constants/macroColors";

interface Props {
    percent: number;
    macro: number;
    label: string;
    macroKey?: keyof typeof MACRO_COLORS;
}

export const DetailMacroColumn = ({ percent, macro, label, macroKey }: Props) => {
    // Only apply macro color to the percentage bubble.
    // If no key is provided, the bubble falls back to a neutral muted style.
    const textClass = macroKey ? MACRO_COLORS[macroKey].textClass : "text-app-muted";
    const bgClass   = macroKey ? MACRO_COLORS[macroKey].bgClass   : "bg-app-border/40";

    return (
        <div className="flex flex-col items-center gap-0.5">
            {/* Percentage — colored bubble */}
            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${textClass} ${bgClass}`}>
                {percent}%
            </span>
            {/* Gram value — neutral text, same as before */}
            <span className="text-lg font-extrabold text-app-text leading-none mt-0.5">
                {macro}g
            </span>
            {/* Label muted underneath */}
            <span className="text-[10px] text-app-muted uppercase font-bold tracking-widest mt-0.5">
                {label}
            </span>
        </div>
    );
};