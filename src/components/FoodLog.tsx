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

const LOOP_COPIES = 3;
const MIDDLE_COPY = 1;

export const FoodLog = ({ logs, selectedDate, onSelectFood, onAddToHour }: Props) => {
    const [nowMs, setNowMs] = useState(() => Date.now());
    const scrollRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const adjustingRef = useRef(false);
    const hasUserScrolledRef = useRef(false);

    useEffect(() => {
        const now = new Date(nowMs);
        const nextHour = new Date(now);
        nextHour.setHours(now.getHours() + 1, 0, 0, 0);
        const id = setTimeout(() => setNowMs(Date.now()), nextHour.getTime() - now.getTime() + 50);
        return () => clearTimeout(id);
    }, [nowMs]);

    const sections = getHourSections(logs, selectedDate, new Date(nowMs));
    const anchorHour =
        sections.find((section) => section.isCurrent)?.hour
        ?? sections.find((section) => section.foodEntries.length > 0)?.hour
        ?? sections[0]?.hour;

    const scrollToAnchor = () => {
        const scroller = scrollRef.current;
        const content = contentRef.current;
        if (!scroller || !content) return;

        const anchor = content.querySelector<HTMLElement>(
            `[data-loop-copy="${MIDDLE_COPY}"][data-hour="${anchorHour}"]`,
        );
        if (!anchor) return;

        adjustingRef.current = true;
        const y = anchor.getBoundingClientRect().top - content.getBoundingClientRect().top;
        const copyHeight = scroller.scrollHeight / LOOP_COPIES;
        scroller.scrollTop = Math.max(y - 12, copyHeight);
        adjustingRef.current = false;
    };

    useLayoutEffect(() => {
        if (hasUserScrolledRef.current) return;
        scrollToAnchor();
    }, [logs, anchorHour]);

    const wrapLoop = () => {
        const scroller = scrollRef.current;
        if (!scroller || adjustingRef.current) return;

        const copyHeight = scroller.scrollHeight / LOOP_COPIES;
        if (copyHeight < 1) return;

        if (scroller.scrollTop < copyHeight) {
            adjustingRef.current = true;
            scroller.scrollTop += copyHeight;
            adjustingRef.current = false;
        } else if (scroller.scrollTop >= copyHeight * 2) {
            adjustingRef.current = true;
            scroller.scrollTop -= copyHeight;
            adjustingRef.current = false;
        }
    };

    const handleScroll = () => {
        if (adjustingRef.current) return;
        hasUserScrolledRef.current = true;
        wrapLoop();
    };

    return (
        <div className="relative flex-1 min-h-0 rounded-2xl border border-app-border bg-app-surface/60 overflow-hidden">
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto overscroll-y-contain px-3 py-3"
            >
                <div ref={contentRef} className="relative">
                    <div
                        aria-hidden
                        className="absolute top-4 bottom-4 w-px bg-app-border left-[2.375rem] -translate-x-1/2"
                    />

                    {Array.from({ length: LOOP_COPIES }, (_, copy) => (
                        <div key={copy} className="flex flex-col">
                            {sections.map(({ hour, foodEntries, isCurrent }) => (
                                <div
                                    key={`${copy}-${hour}`}
                                    data-loop-copy={copy}
                                    data-hour={hour}
                                    className={`relative py-1.5 ${foodEntries.length > 0 ? 'pb-4' : ''}`}
                                >
                                    <HourTotalsHeader
                                        hour={hour}
                                        foodEntries={foodEntries}
                                        isCurrent={isCurrent}
                                        onAdd={() => onAddToHour(dateAtHourLabel(selectedDate, hour, new Date(nowMs)))}
                                    />

                                    {foodEntries.length > 0 && (
                                        <div className="flex flex-col gap-2 mt-2 ml-[calc(4.75rem+0.5rem)]">
                                            {foodEntries.map((log) => (
                                                <FoodCard
                                                    key={`${copy}-${log.entry.id}`}
                                                    foodEntry={log}
                                                    onSelectCard={() => onSelectFood(log)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-app-surface to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-app-surface to-transparent" />
        </div>
    );
};
