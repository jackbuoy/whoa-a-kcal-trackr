// Unified macro color tokens used across the app.
// Each macro maps to:
//   - textClass: the Tailwind text color class for the number/value
//   - bgClass: a muted tinted background for label bubbles
//   - dotClass: bg color for solid dot indicators

export const MACRO_COLORS = {
    calories: {
        textClass: "text-brand",
        bgClass:   "bg-brand/10",
        dotClass:  "bg-brand",
    },
    protein: {
        textClass: "text-red-400",
        bgClass:   "bg-red-400/10",
        dotClass:  "bg-red-400",
    },
    fat: {
        textClass: "text-yellow-400",
        bgClass:   "bg-yellow-400/10",
        dotClass:  "bg-yellow-400",
    },
    carbs: {
        textClass: "text-emerald-400",
        bgClass:   "bg-emerald-400/10",
        dotClass:  "bg-emerald-400",
    },
} as const;
