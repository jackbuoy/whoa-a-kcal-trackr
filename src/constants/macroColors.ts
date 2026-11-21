// Unified macro color tokens used across the app.
export const MACRO_COLORS = {
    calories: {
        textClass: "text-brand",
        bgClass:   "bg-brand/10",
        dotClass:  "bg-brand",
    },
    protein: {
        textClass: "text-rose-400",
        bgClass:   "bg-rose-400/10",
        dotClass:  "bg-rose-400",
    },
    fat: {
        textClass: "text-amber-400",
        bgClass:   "bg-amber-400/10",
        dotClass:  "bg-amber-400",
    },
    carbs: {
        textClass: "text-emerald-400",
        bgClass:   "bg-emerald-400/10",
        dotClass:  "bg-emerald-400",
    },
} as const;
