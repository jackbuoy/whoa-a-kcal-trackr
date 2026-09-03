import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { LogEntryWithFood } from '../types/food';
import { dateAtHourLabel, getHourSections } from '../utils/dateUtils';
import { HourTotalsHeader } from './HourTotalsHeader';
import { FoodCard } from './FoodCard';

interface Props {
    logs: LogEntryWithFood[];
    selectedDate: Date;
    onSelectFood: (entry: LogEntryWithFood) => void;
    onAddToHour: (date: Date) => void;
}

export const FoodLog = ({ logs, selectedDate, onSelectFood, onAddToHour }: Props) => {
    const [nowMs, setNowMs] = useState(() => Date.now());
    const scrollRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const now = new Date(nowMs);
        const nextHour = new Date(now);
        nextHour.setHours(now.getHours() + 1, 0, 0, 0);
        const id = setTimeout(() => setNowMs(Date.now()), nextHour.getTime() - now.getTime() + 50);
        return () => clearTimeout(id);
    }, [nowMs]);

    const sections = getHourSections(logs, selectedDate, new Date(nowMs));
    const currentSection = sections.find((section) => section.isCurrent);
    const anchorHour =
        currentSection?.hour
        ?? sections.find((section) => section.foodEntries.length > 0)?.hour
        ?? sections[8]?.hour // default to ~8 AM if early morning empty
        ?? sections[0]?.hour;

    const scrollToHour = (hour: string, smooth = false) => {
        const scroller = scrollRef.current;
        const content = contentRef.current;
        if (!scroller || !content) return;

        const target = content.querySelector<HTMLElement>(`[data-hour="${hour}"]`);
        if (!target) return;

        const top = target.offsetTop - 8;
        scroller.scrollTo({
            top: Math.max(0, top),
            behavior: smooth ? 'smooth' : 'auto',
        });
    };

    useLayoutEffect(() => {
        scrollToHour(anchorHour, false);
    }, [selectedDate.toDateString()]);

    return (
        <div className="relative flex-1 min-h-0 w-full rounded-2xl border border-app-border bg-app-surface/60 overflow-hidden flex flex-col">
            <div
                ref={scrollRef}
                className="h-full overflow-y-auto overflow-x-hidden overscroll-y-contain px-2.5 sm:px-3 py-2 sm:py-3"
            >
                <div ref={contentRef} className="relative w-full min-w-0">
                    <div
                        aria-hidden
                        className="absolute top-3.5 bottom-3.5 w-px bg-app-border left-[1.75rem] -translate-x-1/2 pointer-events-none"
                    />

                    <div className="flex flex-col w-full min-w-0">
                        {sections.map(({ hour, foodEntries, isCurrent }) => (
                            <div
                                key={hour}
                                data-hour={hour}
                                className={`relative py-1 sm:py-1.5 w-full min-w-0 ${foodEntries.length > 0 ? 'pb-3 sm:pb-3.5' : ''}`}
                            >
                                <HourTotalsHeader
                                    hour={hour}
                                    foodEntries={foodEntries}
                                    isCurrent={isCurrent}
                                    onAdd={() => onAddToHour(dateAtHourLabel(selectedDate, hour, new Date(nowMs)))}
                                />

                                {foodEntries.length > 0 && (
                                    <div className="flex flex-col gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 ml-[calc(3.5rem+0.5rem)] min-w-0">
                                        {foodEntries.map((log) => (
                                            <FoodCard
                                                key={log.entry.id ?? log.entry.instanceId}
                                                foodEntry={log}
                                                onSelectCard={() => onSelectFood(log)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-app-surface to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-app-surface to-transparent" />
        </div>
    );
};
