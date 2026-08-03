import { useState } from "react";
import type { LogEntryWithFood } from "../types/food";

export function usePlate() {
    const [plate, setPlate] = useState<LogEntryWithFood[]>([]);

    const add = (foodEntry: LogEntryWithFood) => {
        // we provide an instance id to differentiate
        // same food id's needing to be removed in the plate
        const instanceId = crypto.randomUUID();
        setPlate(prev => [...prev, {
            ...foodEntry,
            entry: { ...foodEntry.entry, instanceId }
    }]);
    }   

    const addFromDetail = (foodEntry: LogEntryWithFood) => {
        if (foodEntry.entry.instanceId) {
            // update existing plate item (has instanceId from prior add / search tap)
            const updatedPlate = plate.map((item) =>
            item.entry.instanceId === foodEntry.entry.instanceId ? foodEntry : item
        );
        setPlate(updatedPlate);
        } else {
            // new item from search — add() will assign fresh instanceId
            add(foodEntry);
        }
    }

    const remove = (instanceId: string) => {
        setPlate(plate.filter(item => item.entry.instanceId !== instanceId));
    }

    const clearPlate = () => {
        setPlate([]);
    }

    return { plate, add, addFromDetail, remove, clearPlate };
}