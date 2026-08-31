import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import type { LogEntry, LogEntryWithFood } from "../types/food";

export function useLogs(selectedDate: Date) {

    const logEntries = useLiveQuery(
        () => {
            const start = new Date(selectedDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(selectedDate);
            end.setHours(23, 59, 59, 999);
            return db.logEntries
                .where('timestamp')
                .between(start.getTime(), end.getTime())
                .toArray();
        },
        [selectedDate]
    );

    const [filteredLogs, setFilteredLogs] = useState<LogEntryWithFood[]>([]);

    useEffect(() => {
        if (!logEntries) return;

        let cancelled = false;

        const resolve = async () => {
            const pairs = await Promise.all(
                logEntries.map(async (entry) => {
                    const food = await db.foods.get(entry.foodId);
                    return food ? { food, entry } : null;
                })
            );

            if (cancelled) return;

            setFilteredLogs(pairs.filter((p): p is LogEntryWithFood => p !== null));
        };
        resolve();

        return () => {
            cancelled = true;
        };

    }, [logEntries]);

    const commit = async (plate: LogEntryWithFood[]) => {
        const timestamp = selectedDate.getTime();
        // only persist DB fields, instanceId is temporary, dropped here
        const entries: Omit<LogEntry, 'id'>[] = plate.map(({ entry }) => ({
            foodId: entry.foodId,
            timestamp,
            quantity: entry.quantity,
            selectedServing: entry.selectedServing,
        }));
        const foods = plate.map(({ food }) => food);
        await Promise.all([
            db.foods.bulkPut(foods),
            db.logEntries.bulkAdd(entries as LogEntry[]),
        ]);
    };

    const updateLogEntry = async (updated: LogEntryWithFood) => {
        // put the modified entry back into the db
        await db.logEntries.put(updated.entry);
    };

    const deleteLogEntry = async (id: number) => {
        // delete the entry by id
        await db.logEntries.delete(id);
    };


    return { filteredLogs, commit, updateLogEntry, deleteLogEntry };
}