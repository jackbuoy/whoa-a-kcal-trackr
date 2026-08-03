import { MOCK_DATABASE } from "../data/mockDatabase";
import { db } from "../db";

export const seedDatabase = async () => {
    const existing = await db.foods.count();
    if (existing > 0) return; // already seeded, don't run again

    const foodRecords = MOCK_DATABASE.map(({ 
        id, name, brand, icon, baseUnit, baseMacros, servingOptions 
    }) => ({ id, name, brand, icon, baseUnit, baseMacros, servingOptions }));

    await db.foods.bulkAdd(foodRecords);
};