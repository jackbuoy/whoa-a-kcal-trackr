import type { LogEntryWithFood } from '../types/food';
import { groupFoodByHour } from '../utils/dateUtils';
import { HourTotalsHeader } from './HourTotalsHeader';
import { FoodCard } from './FoodCard';

interface Props {
    logs: LogEntryWithFood[];
    onSelectFood: (entry: LogEntryWithFood) => void;
}

export const FoodLog = ({ logs, onSelectFood }: Props) => {
    const groupedLog = groupFoodByHour(logs);

    return (
        <div className="flex flex-col gap-3">
            {Object.entries(groupedLog).map(([hour, logs]) => {
                return (
                    <div key={hour} className="mb-6">

                    <HourTotalsHeader hour={hour} foodEntries={logs} />

                    <div className="flex flex-col gap-3">
                        {logs.map((log) => (
                            <FoodCard 
                                key={log.entry.id} 
                                foodEntry={log} 
                                onSelectCard={() => onSelectFood(log)}
                            />
                        ))}
                    </div>
                </div>
                );
            })}
        </div>
    );
};