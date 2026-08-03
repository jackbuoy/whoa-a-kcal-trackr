import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import type { Food } from "../types/food";
import { searchUSDA } from "../utils/foodDataCentralUtils";

export function useFoodSearch(query: string) {
    const [apiResults, setApiResults] = useState<Food[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const dbFoods = useLiveQuery(() => db.foods.toArray(), []);

    const dbSearchResults = (dbFoods ?? []).filter((food) => {
        const name = food.name.toLowerCase();
        const search = query.toLowerCase();
        return name.includes(search);
    });

    useEffect(() => {
        if (!query) return;

        let debounced = false; // flagged true by cleanup so stale responses are discarded

        const timer = setTimeout(() => {
            setIsSearching(true);
            searchUSDA(query).then((results) => {
                if (!debounced) {
                    setApiResults(results);
                    setIsSearching(false);
                }
            });
        }, 500);

        return () => {
            debounced = true;
            clearTimeout(timer);
        };
    }, [query]);
    
    const combinedResults = query
        ? [...dbSearchResults, ...apiResults]
        : [];
        
    return { combinedResults, isSearching: query ? isSearching : false };
}