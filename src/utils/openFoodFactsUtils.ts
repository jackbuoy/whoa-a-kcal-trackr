import type { Food, ServingOption } from "../types/food";
import { guessFoodIcon } from "./iconUtils";
import { titleCase } from "./stringUtils";

interface OFFNutriments {
    [key: string]: number | string | undefined;
}

interface OFFProduct {
    code?: string;
    product_name?: string;
    product_name_en?: string;
    brands?: string;
    categories?: string;
    serving_size?: string;
    serving_quantity?: number | string;
    nutriments?: OFFNutriments;
}

interface OFFResponse {
    status: number;
    status_verbose?: string;
    product?: OFFProduct;
}

export async function fetchFoodByBarcode(barcode: string): Promise<Food | null> {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return null;

    try {
        const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleanBarcode)}.json`;
        const response = await fetch(url, {
            headers: {
                "User-Agent": "WhoaAKcalTrackr/v0.72 (https://github.com/whoa-a-kcal-trackr)",
            },
        });

        if (!response.ok) return null;

        const data: OFFResponse = await response.json();
        if (data.status !== 1 || !data.product) {
            return null;
        }

        const product = data.product;
        const nutriments = product.nutriments || {};

        // xxtract calories (per 100g / 100ml)
        let calories =
            typeof nutriments["energy-kcal_100g"] === "number"
                ? nutriments["energy-kcal_100g"]
                : typeof nutriments["energy-kcal_value"] === "number"
                ? nutriments["energy-kcal_value"]
                : typeof nutriments["energy-kcal"] === "number"
                ? nutriments["energy-kcal"]
                : typeof nutriments["energy_100g"] === "number"
                ? nutriments["energy_100g"] / 4.184
                : typeof nutriments["energy_value"] === "number"
                ? nutriments["energy_value"] / 4.184
                : null;

        const protein =
            typeof nutriments["proteins_100g"] === "number"
                ? nutriments["proteins_100g"]
                : typeof nutriments["proteins_value"] === "number"
                ? nutriments["proteins_value"]
                : typeof nutriments["proteins"] === "number"
                ? nutriments["proteins"]
                : 0;

        const fat =
            typeof nutriments["fat_100g"] === "number"
                ? nutriments["fat_100g"]
                : typeof nutriments["fat_value"] === "number"
                ? nutriments["fat_value"]
                : typeof nutriments["fat"] === "number"
                ? nutriments["fat"]
                : 0;

        const carbs =
            typeof nutriments["carbohydrates_100g"] === "number"
                ? nutriments["carbohydrates_100g"]
                : typeof nutriments["carbohydrates_value"] === "number"
                ? nutriments["carbohydrates_value"]
                : typeof nutriments["carbohydrates"] === "number"
                ? nutriments["carbohydrates"]
                : 0;

        // if calories is missing but macros exist, calculate from macros
        if (calories === null) {
            calories = protein * 4 + carbs * 4 + fat * 9;
        }

        const rawName = product.product_name || product.product_name_en || `Scanned Item (${cleanBarcode})`;
        const name = titleCase(rawName) || rawName;
        const brand = product.brands ? titleCase(product.brands.split(",")[0].trim()) || "" : "";

        const isLiquid =
            (product.categories && product.categories.toLowerCase().includes("beverage")) ||
            (product.serving_size && product.serving_size.toLowerCase().includes("ml"));

        const baseUnit: 'g' | 'ml' = isLiquid ? 'ml' : 'g';
        const icon = guessFoodIcon(name, baseUnit, product.categories || "");

        const servingOptions: ServingOption[] = [
            { label: baseUnit, multiplier: 1 },
        ];

        // parse custom serving size option if provided by OpenFoodFacts
        if (product.serving_size) {
            const rawServingSize = product.serving_size.trim();
            let multiplier = typeof product.serving_quantity === "number" ? product.serving_quantity : parseFloat(String(product.serving_quantity || ""));
            
            if (isNaN(multiplier) || multiplier <= 0) {
                const match = rawServingSize.match(/([\d.]+)\s*(g|ml|oz)/i);
                if (match) {
                    multiplier = parseFloat(match[1]);
                }
            }

            if (!isNaN(multiplier) && multiplier > 0 && multiplier !== 1) {
                servingOptions.unshift({
                    label: rawServingSize.toLowerCase(),
                    multiplier: multiplier,
                });
            }
        }

        return {
            id: `off_${cleanBarcode}`,
            name,
            brand,
            icon,
            baseUnit,
            baseMacros: {
                calories: Number((calories / 100).toFixed(4)),
                protein: Number((protein / 100).toFixed(4)),
                fat: Number((fat / 100).toFixed(4)),
                carbs: Number((carbs / 100).toFixed(4)),
            },
            servingOptions,
        };
    } catch (error) {
        console.error("Failed to fetch product from OpenFoodFacts:", error);
        return null;
    }
}
