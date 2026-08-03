const NAME_ICON_KEYWORDS: Array<{ keywords: string[]; icon: string }> = [
    { keywords: ['chicken', 'turkey', 'poultry'], icon: '🍗' },
    { keywords: ['beef', 'steak'], icon: '🥩' },
    { keywords: ['pork', 'bacon', 'ham'], icon: '🥓' },
    { keywords: ['lamb', 'veal'], icon: '🍖' },
    { keywords: ['egg'], icon: '🥚' },
    { keywords: ['milk'], icon: '🥛' },
    { keywords: ['cheese'], icon: '🧀' },
    { keywords: ['yogurt', 'yoghurt'], icon: '🥛' },
    { keywords: ['fish', 'salmon', 'tuna', 'cod'], icon: '🐟' },
    { keywords: ['shrimp', 'crab', 'lobster', 'shellfish'], icon: '🦐' },
    { keywords: ['bread', 'toast', 'bagel', 'bun', 'roll'], icon: '🍞' },
    { keywords: ['rice'], icon: '🍚' },
    { keywords: ['pasta', 'spaghetti', 'noodle'], icon: '🍝' },
    { keywords: ['apple'], icon: '🍎' },
    { keywords: ['banana'], icon: '🍌' },
    { keywords: ['orange'], icon: '🍊' },
    { keywords: ['grape'], icon: '🍇' },
    { keywords: ['strawberry', 'berry', 'berries'], icon: '🍓' },
    { keywords: ['carrot'], icon: '🥕' },
    { keywords: ['broccoli'], icon: '🥦' },
    { keywords: ['potato'], icon: '🥔' },
    { keywords: ['tomato'], icon: '🍅' },
    { keywords: ['corn'], icon: '🌽' },
    { keywords: ['bean', 'lentil', 'legume'], icon: '🫘' },
    { keywords: ['nut', 'almond', 'peanut', 'cashew'], icon: '🥜' },
    { keywords: ['soup', 'broth'], icon: '🍲' },
    { keywords: ['pizza'], icon: '🍕' },
    { keywords: ['cake', 'cookie', 'pastry'], icon: '🍰' },
    { keywords: ['candy', 'chocolate'], icon: '🍫' },
    { keywords: ['chip', 'pretzel', 'cracker'], icon: '🥨' },
    { keywords: ['coffee'], icon: '☕' },
    { keywords: ['tea'], icon: '🍵' },
    { keywords: ['juice'], icon: '🧃' },
    { keywords: ['soda', 'cola', 'sports drink'], icon: '🥤' },
    { keywords: ['beer'], icon: '🍺' },
    { keywords: ['wine'], icon: '🍷' },
    { keywords: ['cereal'], icon: '🥣' },
    { keywords: ['oil', 'butter'], icon: '🧈' },
];

// USDA foundational categories
const CATEGORY_ICON_KEYWORDS: Array<{ keywords: string[]; icon: string }> = [
    { keywords: ['dairy and egg'], icon: '🥛' },
    { keywords: ['spices and herbs'], icon: '🌿' },
    { keywords: ['baby food'], icon: '🍼' },
    { keywords: ['fats and oils'], icon: '🧈' },
    { keywords: ['poultry'], icon: '🍗' },
    { keywords: ['soups, sauces', 'gravies'], icon: '🍲' },
    { keywords: ['sausages', 'luncheon meat'], icon: '🌭' },
    { keywords: ['breakfast cereal'], icon: '🥣' },
    { keywords: ['fruit'], icon: '🍎' },
    { keywords: ['pork'], icon: '🥓' },
    { keywords: ['vegetable'], icon: '🥦' },
    { keywords: ['nut and seed'], icon: '🥜' },
    { keywords: ['beef'], icon: '🥩' },
    { keywords: ['beverage', 'drink'], icon: '🥤' },
    { keywords: ['finfish', 'shellfish'], icon: '🐟' },
    { keywords: ['legume'], icon: '🫘' },
    { keywords: ['lamb', 'veal', 'game'], icon: '🍖' },
    { keywords: ['baked product'], icon: '🍞' },
    { keywords: ['sweet'], icon: '🍬' },
    { keywords: ['cereal grain', 'pasta'], icon: '🍚' },
    { keywords: ['fast food'], icon: '🍔' },
    { keywords: ['meal', 'entree', 'side dish'], icon: '🍽️' },
    { keywords: ['snack'], icon: '🍿' },
    { keywords: ['restaurant'], icon: '🍽️' },
];

const DEFAULT_SOLID_ICON = '🍽️';
const DEFAULT_LIQUID_ICON = '🥤';

export const guessFoodIcon = (name: string, baseUnit: 'g' | 'ml', category?: string): string => {
    const lowerName = name.toLowerCase();

    const nameMatch = NAME_ICON_KEYWORDS.find(({ keywords }) =>
        keywords.some(keyword => lowerName.includes(keyword))
    );
    if (nameMatch) return nameMatch.icon;

    if (category) {
        const lowerCategory = category.toLowerCase();
        const categoryMatch = CATEGORY_ICON_KEYWORDS.find(({ keywords }) =>
            keywords.some(keyword => lowerCategory.includes(keyword))
        );
        if (categoryMatch) return categoryMatch.icon;
    }

    return baseUnit === 'ml' ? DEFAULT_LIQUID_ICON : DEFAULT_SOLID_ICON;
};