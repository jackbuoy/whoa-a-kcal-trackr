import { motion, useMotionValue, animate } from "motion/react";

interface Props<T> {
    values: T[];
    initialIndex: number;
    onSelect: (value: T) => void;
    renderItem: (item: T) => React.ReactNode;
    itemHeight?: number;
}

const CONTAINER_HEIGHT = 192;

export const WheelColumn = <T,>({
    values, 
    initialIndex = 0, 
    onSelect, 
    renderItem, 
    itemHeight = 48 
}: Props<T>) => {

    // offset that centers the selected item vertically within the container
    const centerOffset = (CONTAINER_HEIGHT - itemHeight) / 2;
    
    const y = useMotionValue(centerOffset - initialIndex * itemHeight);

    const snapToIndex = (rawIndex: number) => {
        const index = Math.max(0, Math.min(values.length - 1, rawIndex));
        const targetY = centerOffset - index * itemHeight;
        animate(y, targetY, { type: "spring", stiffness: 300, damping: 30 });
        onSelect(values[index]);
    }
    
    return (
        <div
            className="h-48 overflow-hidden relative"
            style={{
                // fade out items at top and bottom edges of the wheel
                maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
            }}
        >
            <div className="absolute top-1/2 -mt-6 w-full h-12 border-y border-app-border/40 bg-app-surface-raised/40 rounded-lg pointer-events-none z-10" />
            <motion.div
                drag="y"
                dragConstraints={{
                    top: centerOffset - (values.length - 1) * itemHeight,
                    bottom: centerOffset,
                }}
                style={{ y }}
                onDragEnd={() => {
                    const currentY = y.get();
                    const index = Math.round((centerOffset - currentY) / itemHeight);
                    snapToIndex(index);
                }}
                className="flex flex-col items-center"
            >
                {values.map((item, index) => (
                    <div
                        key={index}
                        className="h-12 flex items-center justify-center text-app-text font-medium"
                        style={{ height: itemHeight }}
                    >
                        {renderItem(item)}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
