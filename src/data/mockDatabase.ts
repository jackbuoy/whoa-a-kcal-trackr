import type { Food } from "../types/food";
import { UNIVERSAL_UNITS } from "../constants/units";

export const MOCK_DATABASE: Food[] = [
    // PROTEINS (Base: 1g)
    { 
        id: 'd1', name: 'Chicken Breast', brand: 'Generic', icon: '🍗', baseUnit: 'g',
        baseMacros: { calories: 1.65, protein: 0.31, carbs: 0, fat: 0.036 },
        servingOptions: [UNIVERSAL_UNITS.GRAM, UNIVERSAL_UNITS.OZ, { label: 'Standard Breast', multiplier: 174 }],
    },
    { 
        id: 'd4', name: 'Egg (Large)', brand: 'Generic', icon: '🥚', baseUnit: 'g',
        baseMacros: { calories: 1.43, protein: 0.13, carbs: 0.01, fat: 0.1 },
        servingOptions: [UNIVERSAL_UNITS.GRAM, { label: 'Whole Egg', multiplier: 50 }],
    },
    { 
        id: 'd6', name: 'Whey Protein', brand: 'Optimum Nutrition', icon: '🥤', baseUnit: 'g',
        baseMacros: { calories: 3.87, protein: 0.77, carbs: 0.1, fat: 0.03 },
        servingOptions: [UNIVERSAL_UNITS.GRAM, { label: 'Scoop', multiplier: 31 }],
    },

    // DAIRY (Base: 1g or 1ml)
    { 
        id: 'd8', name: 'Greek Yogurt', brand: 'Chobani', icon: '🥣', baseUnit: 'g',
        baseMacros: { calories: 0.53, protein: 0.1, carbs: 0.04, fat: 0 },
        servingOptions: [UNIVERSAL_UNITS.GRAM, { label: 'Container', multiplier: 150 }],
    },
    { 
        id: 'd9', name: 'Whole Milk', brand: 'Generic', icon: '🥛', baseUnit: 'ml',
        baseMacros: { calories: 0.62, protein: 0.03, carbs: 0.05, fat: 0.03 },
        servingOptions: [UNIVERSAL_UNITS.ML, UNIVERSAL_UNITS.CUP, UNIVERSAL_UNITS.FLOZ],
    },

    // CARBS (Base: 1g)
    { 
        id: 'd17', name: 'Banana', brand: 'Generic', icon: '🍌', baseUnit: 'g',
        baseMacros: { calories: 0.89, protein: 0.011, carbs: 0.23, fat: 0.003 },
        servingOptions: [UNIVERSAL_UNITS.GRAM, { label: 'Medium (peeled)', multiplier: 118 }],
    },
    { 
        id: 'd20', name: 'Whole Wheat Bread', brand: "Dave's Killer", icon: '🍞', baseUnit: 'g',
        baseMacros: { calories: 2.5, protein: 0.11, carbs: 0.48, fat: 0.03 },
        servingOptions: [UNIVERSAL_UNITS.GRAM, { label: 'Slice', multiplier: 45 }],
    },

    // FATS (Base: 1g)
    { 
        id: 'd28', name: 'Almonds', brand: 'Blue Diamond', icon: '🫘', baseUnit: 'g',
        baseMacros: { calories: 6.07, protein: 0.21, carbs: 0.21, fat: 0.53 },
        servingOptions: [UNIVERSAL_UNITS.GRAM, UNIVERSAL_UNITS.OZ, { label: 'Handful', multiplier: 28 }],
    },
    { 
        id: 'd42', name: 'Honey', brand: 'Generic', icon: '🍯', baseUnit: 'g',
        baseMacros: { calories: 3.04, protein: 0, carbs: 0.82, fat: 0 },
        servingOptions: [UNIVERSAL_UNITS.GRAM, UNIVERSAL_UNITS.TBSP, UNIVERSAL_UNITS.TSP],
    }
];