import type { Food, ServingOption } from "../types/food";
import { guessFoodIcon } from "./iconUtils";
import { stripBrandFromName, titleCase } from "./stringUtils";

const CALORIES_NID = 1008;
const PROTEIN_NID = 1003;
const FAT_NID = 1004;
const CARBS_NID = 1005;

interface FoodNutrient {
    nutrientId: number;
    nutrientName: string;
    unitName: string;
    value: number;
}

interface USDAFood {
    fdcId: number;
    description: string;
    brandName?: string;
    brandOwner?: string;
    foodCategory: string;
    servingSize?: number;
    servingSizeUnit?: string;
    householdServingFullText?: string;
    foodNutrients: FoodNutrient[];
}

const extractNutrientValue = ( nutrients: FoodNutrient[], nutrientId: number): number | null => {
    return nutrients.find( n => n.nutrientId === nutrientId)?.value ?? null;
}

const transformProduct = ( food: USDAFood ): Food | null => {

    // macro extract
        const nutrientsArr = food.foodNutrients;
        const calories = extractNutrientValue(nutrientsArr, CALORIES_NID);
        const protein = extractNutrientValue(nutrientsArr, PROTEIN_NID);
        const fat = extractNutrientValue(nutrientsArr, FAT_NID);
        const carbs = extractNutrientValue(nutrientsArr, CARBS_NID);

        // if a food has incomplete macros, we skip it
        if (calories === null || protein === null || fat === null || carbs === null) {
            return null;
        }

    // food type parameter extract
        const id = String(food.fdcId);
        const brand = titleCase(food.brandName) ?? titleCase(food.brandOwner) ?? '';
        const name = titleCase(stripBrandFromName(food.description, brand)) ?? '';
        const baseUnit = food.servingSizeUnit === 'MLT' ? 'ml' : 'g';
        const icon = guessFoodIcon(name, baseUnit, food.foodCategory);
        const servingOptions: ServingOption[] = [
            { label: baseUnit.toLowerCase(), multiplier: 1 },
        ];
        // only provide response serving option if non-null
        if (food.householdServingFullText && food.servingSize) {
            servingOptions.unshift({ label: food.householdServingFullText.toLowerCase(), multiplier: food.servingSize });
        }
        
    return { 
        id: id,
        name: name,
        brand: brand,
        icon: icon,
        baseUnit: baseUnit,
        baseMacros: {
            calories: calories / 100,
            protein: protein / 100,
            fat: fat / 100,
            carbs: carbs / 100,
        },
        servingOptions: servingOptions,
    }
}

export const searchUSDA = async (query: string): Promise<Food[]> => {
    const params = new URLSearchParams({
        api_key: import.meta.env.VITE_USDA_API_KEY,
        query: query,
        pageSize: '15',
    });

    const url = 'https://api.nal.usda.gov/fdc/v1/foods/search?' + params.toString();

    const response = await fetch(url);

    const responseJson = await response.json();

    const foods = responseJson.foods
        .map(transformProduct)
        .filter((food: Food | null): 
            food is Food => food !== null)
    ;
    
    return foods;
}
