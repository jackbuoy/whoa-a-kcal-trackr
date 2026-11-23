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
    );
    const hourIndex = HOURS.indexOf(selectedHour);
    const periodIndex = PERIODS.indexOf(selectedPeriod);

    const handleSetTime = () => {
        const finalDate = new Date(selectedWheelDate);
        let hours24 = selectedHour % 12;
        if (selectedPeriod === 'PM') hours24 += 12;
        finalDate.setHours(hours24, 0, 0, 0);
        onChangeTime(finalDate);
    };

    return (
        <div className="flex flex-col h-full bg-app-surface rounded-t-3xl overflow-hidden pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {/* handle */}
            <div className="w-9 h-1 bg-app-muted/30 rounded-full mx-auto mt-2.5 mb-1" />

            <div className="flex justify-between items-center px-4 py-3 border-b border-app-separator">
                <button
                    onClick={onBack}
                    className="text-[15px] font-medium text-app-muted hover:text-app-text transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <span className="font-semibold text-app-text text-[15px]">
                    Select Date & Time
                </span>
                <button
                    onClick={handleSetTime}
                    className="text-[15px] font-semibold text-brand hover:text-brand-hover transition-colors cursor-pointer"
                >
                    Done
                </button>
            </div>

            <div className="flex flex-row divide-x divide-app-separator my-4">
                <div className="flex-1">
                    <WheelColumn 
                        values={dateRange} 
                        initialIndex={dateIndex}
                        onSelect={(val) => { setSelectedWheelDate(val); }}
                        renderItem={(d) => <span className="text-[14px] font-medium text-app-text">{d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>}
                    />
                </div>
                <div className="flex-1">
                    <WheelColumn 
                        values={HOURS} 
                        initialIndex={hourIndex}
                        onSelect={(val) => setSelectedHour(val)}
                        renderItem={(hour) => <span className="text-[15px] font-medium text-app-text">{hour}</span>}
                    />
                </div>
                <div className="flex-1">
                    <WheelColumn 
                        values={PERIODS} 
                        initialIndex={periodIndex}
                        onSelect={(val) => setSelectedPeriod(val)}
                        renderItem={(period) => <span className="w-full text-center text-[15px] font-medium text-app-text">{period}</span>}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2.5 px-4 mt-auto">
                <button
                    onClick={handleSetTime}
                    className="w-full py-3.5 bg-app-surface-raised text-app-text font-semibold rounded-2xl transition-all active:scale-[0.98] text-[14px] cursor-pointer"
                >
                    Set Time to {selectedWheelDate?.toLocaleDateString?.('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedHour} {selectedPeriod}
                </button>
                <button
                    onClick={() => onLogAtTime()}
                    className="w-full py-3.5 bg-brand text-white font-bold rounded-2xl transition-all active:scale-[0.98] text-[14px] shadow-md shadow-brand/20 cursor-pointer"
                >
                    Log for {selectedWheelDate?.toLocaleDateString?.('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedHour} {selectedPeriod}
                </button>
            </div>
        </div>
    );
};
