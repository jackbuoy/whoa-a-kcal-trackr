import { useMemo, useState } from "react";
import { HOURS, PERIODS } from "../constants/date-time";
import { generateDateRange } from "../utils/dateUtils";
import { WheelColumn } from "./WheelColumn";

interface Props {
    date: Date;
    onChangeTime: (date: Date) => void;
    onBack: () => void;
    onLogAtTime: () => void;
}

export const DateSelectModal = ({date, onChangeTime, onBack, onLogAtTime}: Props) => {
    const [selectedWheelDate, setSelectedWheelDate] = useState(date);
    const hour12 = date.getHours() % 12 || 12;
    const [selectedHour, setSelectedHour] = useState(hour12);
    const [selectedPeriod, setSelectedPeriod] = useState(date.getHours() < 12 ? 'AM' : 'PM');
    
    const dateRange = useMemo(() => generateDateRange(), []);

    const dateIndex = dateRange.findIndex(d =>
        d.toDateString() === selectedWheelDate.toDateString()
    )
    const hourIndex = HOURS.indexOf(selectedHour);
    const periodIndex = PERIODS.indexOf(selectedPeriod);

    const handleSetTime = () => {
        const finalDate = new Date(selectedWheelDate);
        let hours24 = selectedHour % 12;
        if (selectedPeriod === 'PM') hours24 += 12;
        finalDate.setHours(hours24, 0, 0, 0);
        onChangeTime(finalDate);
    }

    return (
        <div className="flex flex-col h-full bg-app-surface backdrop-blur-md rounded-t-3xl overflow-hidden pb-6">
            <div
                className="flex justify-between items-center p-4 border-b border-app-border"
            >
                <button
                    onClick={onBack}
                    className="text-sm font-semibold text-app-muted hover:text-app-text transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <span
                    className="font-extrabold text-app-text text-sm uppercase tracking-wider"
                >
                    Select Date & Time
                </span>
                <div className="w-12" /> {/* Spacer to align title */}
            </div>
            <div
                className="flex flex-row divide-x divide-app-border my-6"
            >
                <div className="flex-1">
                    <WheelColumn 
                        values={dateRange} 
                        initialIndex={dateIndex}
                        onSelect={(val) => { setSelectedWheelDate(val) }}
                        renderItem={(date) => <span className="text-sm font-bold text-app-text">{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>}
                    />
                </div>
                <div className="flex-1">
                    <WheelColumn 
                        values={HOURS} 
                        initialIndex={hourIndex}
                        onSelect={(val) => setSelectedHour(val)}
                        renderItem={(hour) => <span className="text-sm font-bold text-app-text">{hour}</span>}
                    />
                </div>
                <div className="flex-1">
                    <WheelColumn 
                        values={PERIODS} 
                        initialIndex={periodIndex}
                        onSelect={(val) => setSelectedPeriod(val)}
                        renderItem={(period) => <span className="w-full text-center text-sm font-bold text-app-text">{period}</span>}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2 px-6 mt-auto">
                <button
                    onClick={handleSetTime}
                    className="w-full py-3 bg-app-bg hover:bg-app-border border border-app-border text-app-text font-bold rounded-2xl transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                >
                    Set Time to {selectedWheelDate?.toLocaleDateString?.('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedHour} {selectedPeriod}
                </button>
                <button
                    onClick={() => onLogAtTime()}
                    className="w-full py-3.5 bg-brand hover:bg-brand-hover text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-md shadow-brand/10 cursor-pointer"
                >
                    Log for {selectedWheelDate?.toLocaleDateString?.('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedHour} {selectedPeriod}
                </button>
            </div>
        </div>
    );
}