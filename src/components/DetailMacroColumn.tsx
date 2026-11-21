import { MACRO_COLORS } from "../constants/macroColors";

interface Props {
    percent: number;
    macro: number;
    label: string;
    macroKey?: keyof typeof MACRO_COLORS;
}

export const DetailMacroColumn = ({ percent, macro, label, macroKey }: Props) => {
    const textClass = macroKey ? MACRO_COLORS[macroKey].textClass : "text-app-muted";
    const bgClass   = macroKey ? MACRO_COLORS[macroKey].bgClass   : "bg-app-border";

    return (
        <div className="flex flex-col items-center gap-0.5">
            {/* Percentage — colored bubble */}
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${textClass} ${bgClass}`}>
                {percent}%
            </span>
            {/* Gram value */}
            <span className="text-lg font-bold text-app-text leading-none mt-0.5 tabular-nums">
                {macro}g
            </span>
            {/* Label */}
            <span className="text-[10px] text-app-muted font-medium mt-0.5 capitalize">
                {label}
            </span>
        </div>
    );
};
