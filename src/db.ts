import Dexie, { type Table } from 'dexie';
import type { Food, LogEntry } from './types/food';

class kctDB extends Dexie {
    foods!: Table<Food>;
    logEntries!: Table<LogEntry>;

    constructor() {
        super('kct');
        this.version(1).stores({
            foods: 'id, name',
            logEntries: '++id, foodId, timestamp'
        });
    }
}

export const db = new kctDB();