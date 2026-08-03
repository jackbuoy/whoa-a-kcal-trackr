export interface ServingOption {
    label: string;      // "cup", "oz", "gram/g", "piece(s)"
    multiplier: number; // how many "base units" this represents
}

export interface Food {
    id: string;
    name: string;
    brand: string;
    icon?: string;
    // our "base unit" is 1 gram or 1 milliliter
    baseUnit: 'g' | 'ml'; 
    // macros for 1 "base unit"
    baseMacros: {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    }
    servingOptions: ServingOption[];
}

export interface LogEntry {
    id?: number;
    instanceId?: string;            // client-side, assigned when added to plate
    foodId: string;                 // links to foods table
    timestamp: number;
    quantity: number;               // current amount of serving "mode"
    selectedServing: ServingOption; // current serving "mode"
}

export interface LogEntryWithFood {
    food: Food;
    entry: LogEntry;
}