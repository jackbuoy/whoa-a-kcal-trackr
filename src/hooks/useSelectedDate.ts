import { useState } from "react";

export function useSelectedDate() {
    const [ selectedDate, setSelectedDate ] = useState(new Date());

    const navigate = (days: 1 | -1) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    }

    return { selectedDate, setSelectedDate, navigate };
}