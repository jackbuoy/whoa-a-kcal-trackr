import type { ServingOption } from "../types/food";

export function titleCase(str: string | undefined) {
    if (!str) return
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export const stripBrandFromName = (description: string, brand: string): string => {
    if (!brand) return description;

    const lowerDesc = description.toLowerCase();
    const lowerBrand = brand.toLowerCase();

    if (lowerDesc.startsWith(lowerBrand)) {
        return description
            .slice(brand.length)       // remove the brand-length prefix
            .replace(/^[\s,]+/, '');    // strip leading comma/space left behind
    }

    return description;
};

export const formatServingDisplay = (quantity: number, serving: ServingOption): string => {
    if (serving.multiplier === 1) {
        // base unit case: "85 g"
        return `${quantity} ${serving.label}`;
    }
    // named serving case: "2 servings (4oz)" or "1 serving (4oz)"
    const servingWord = quantity === 1 ? 'serving' : 'servings';
    return `${quantity} ${servingWord} (${serving.label})`;
};

export const parseQuantityString = (str: string): number => {
    const normalized = str.trim();
    if (!normalized) return 0;

    // mixed fractions: e.g., "1 1/2"
    const parts = normalized.split(/\s+/);
    if (parts.length === 2) {
        const whole = parseFloat(parts[0]);
        const fracPart = parts[1];
        if (fracPart.includes('/')) {
            const [num, den] = fracPart.split('/').map(Number);
            if (den) return whole + (num / den);
        }
        return isNaN(whole) ? 0 : whole;
    }

    // pure fractions: e.g., "1/2"
    if (normalized.includes('/')) {
        const [num, den] = normalized.split('/').map(Number);
        if (den) return num / den;
    }

    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
};
