import type { Food, ServingOption, LogEntryWithFood } from "../types/food";

// macroSingleTotals is used to aggregate the 
// macronutrients for a single food and is used within 
// the macroMultipleTotals and the FoodCard component
export const macroSingleTotals = ({ food, entry }: LogEntryWithFood) => {
    const factor = entry.selectedServing.multiplier * entry.quantity;

    return {
        calories: Math.round(food.baseMacros.calories * factor),
        protein: Math.round(food.baseMacros.protein * factor),
        fat: Math.round(food.baseMacros.fat * factor),
        carbs: Math.round(food.baseMacros.carbs * factor),
    }
}

// macroMultipleTotals is used to aggregate the 
// macronutrients for multiple foods and is used within 
// the PlateDetailScreen, DayTotals, and HourTotalsHeader components
export const macroMultipleTotals = (logs: LogEntryWithFood[]) => {
    return logs.reduce((acc, { food, entry }) => {
        const totals = macroSingleTotals({ food, entry });
        acc.calories += totals.calories;
        acc.protein += totals.protein;
        acc.fat += totals.fat;
        acc.carbs += totals.carbs;
        return acc;
    }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
};



// used in FoodDetailModal for live preview, uses toFixed for display precision rather than Math.round
export const macroSingleTotalsLive = (food: Food, quantity: number, unit: ServingOption) => {
    const factor = unit.multiplier * quantity;

    return {
        calories: Number((food.baseMacros.calories * factor).toFixed(0)),
        protein: Number((food.baseMacros.protein * factor).toFixed(1)),
        fat: Number((food.baseMacros.fat * factor).toFixed(1)),
        carbs: Number((food.baseMacros.carbs * factor).toFixed(1)),
    }
}