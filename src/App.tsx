import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import type { LogEntryWithFood } from "./types/food";
import { DayTotals } from "./components/DayTotals";
import { FoodLog } from "./components/FoodLog";
import { DateNavigator } from './components/DateNavigator';
import { AddFoodButton } from './components/AddFoodButton';
import { SearchScreen } from './components/SearchScreen';
import { FoodDetailModal } from './components/FoodDetailModal';
import { PlatePill } from './components/PlatePill';
import { PlateDetailScreen } from './components/PlateDetailScreen';
import { AnimatePresence, motion } from "motion/react";
import { DateSelectPill } from './components/DateSelectPill';
import { DateSelectModal } from './components/DateSelectModal';
import { usePlate } from './hooks/usePlate';
import { useSelectedDate } from './hooks/useSelectedDate';
import { useLogs } from './hooks/useLogs';
import { seedDatabase } from './utils/dbUtil.ts';

function App() {

  useEffect(() => {
    seedDatabase();
  }, []);

  const { selectedDate, setSelectedDate, navigate } = useSelectedDate();
  const [view, setView] = useState('dashboard');
  const { filteredLogs, commit, updateLogEntry, deleteLogEntry } = useLogs(selectedDate);
  const { plate, add, addFromDetail, remove, clearPlate } = usePlate();
  const [activeFood, setActiveFood] = useState<LogEntryWithFood | null>(null);
  const [searchHeaderHeight, setSearchHeaderHeight] = useState(64);
  const [isSettingTime, setIsSettingTime] = useState(false);
  // Track date/time before opening search for a specific hour so we can cleanly revert back
  const preSearchDateRef = useRef<Date | null>(null);

  // lock scrolling while activeFood is set, for FoodDetailModal
  useEffect(() => {
    if (!activeFood) document.body.style.overflow = '';
    if (activeFood) document.body.style.overflow = 'hidden';
  }, [activeFood]);

  const exitWorkspace = () => {
    // Revert time back to current time (if viewing today) or to pre-search date/time
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    if (isToday) {
      setSelectedDate(new Date());
    } else if (preSearchDateRef.current) {
      setSelectedDate(preSearchDateRef.current);
    }
    preSearchDateRef.current = null;
    clearPlate();
    setActiveFood(null);
    setView('dashboard');
  };

  const handleAddFromDetail = async (foodEntry: LogEntryWithFood, shouldCommit?: boolean) => {
    addFromDetail(foodEntry);
    setActiveFood(null);

    if (shouldCommit) {
      const updatedPlate = foodEntry.entry.instanceId
        ? plate.map(item => item.entry.instanceId === foodEntry.entry.instanceId ? foodEntry : item)
        : [...plate, { ...foodEntry, entry: { ...foodEntry.entry, instanceId: crypto.randomUUID() } }];

      await commit(updatedPlate);
      exitWorkspace();
    }
  };

  const handleConfirm = async (foodEntry: LogEntryWithFood, shouldCommit?: boolean) => {
    if (foodEntry.entry.id !== undefined) {
      await updateLogEntry(foodEntry);
      setActiveFood(null);
    } else {
      handleAddFromDetail(foodEntry, shouldCommit);
    }
  };

  const handleRemove = async (instanceIdOrId: string | number) => {
    if (typeof instanceIdOrId === 'number') {
      await deleteLogEntry(instanceIdOrId);
      setActiveFood(null);
    } else {
      remove(instanceIdOrId);
      setActiveFood(null);
    }
  };

  const handleLogPlate = async () => {
    await commit(plate);
    exitWorkspace();
  };

  const handleOpenSearch = (date?: Date) => {
    flushSync(() => {
      if (date) {
        // User clicked a specific hour's '+' button (e.g. 7 PM): preserve current date and set time to 7 PM
        preSearchDateRef.current = new Date(selectedDate);
        setSelectedDate(date);
      } else {
        // User clicked general bottom search: if today, ensure time reflects right now
        const isToday = selectedDate.toDateString() === new Date().toDateString();
        if (isToday) {
          setSelectedDate(new Date());
        }
        preSearchDateRef.current = null;
      }
      setView('search');
    });
    const searchInput = document.getElementById('search-food-input') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="h-dvh overflow-hidden pt-[calc(env(safe-area-inset-top,54px)+0.75rem)] px-4 bg-app-bg text-app-text font-sans antialiased flex flex-col mt-1">

      {/* dashboard view */}
      {view === 'dashboard' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2.5">
          <DateNavigator date={selectedDate} onPrev={() => navigate(-1)} onNext={() => navigate(1)} />
          <DayTotals foodEntries={filteredLogs} />
          <FoodLog
            key={selectedDate.toDateString()}
            logs={filteredLogs}
            selectedDate={selectedDate}
            onSelectFood={setActiveFood}
            onAddToHour={handleOpenSearch}
          />
          {/* Edge-to-edge docked bottom bar: lowered cleanly to eliminate distracting bottom gap */}
          <div className="-mx-4 px-4 pt-1 pb-[max(0.25rem,calc(env(safe-area-inset-bottom,21px)-18px))] bg-app-bg/95 border-t border-app-separator backdrop-blur-xl flex-none pt-2">
            <AddFoodButton onClick={() => handleOpenSearch()} />
          </div>
        </div>
      )}

      {/* logging workspace (plate, search, food detail) */}
      <AnimatePresence>
        {view !== 'dashboard' && (
          <motion.div
            key={"workspace"}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-8 bg-app-bg flex flex-col h-dvh w-full overflow-hidden"
          >
            {/* persistent header: aligned with dashboard safe-area height so blur NEVER bleeds into it */}
            <nav className="flex-none shrink-0 pt-[calc(env(safe-area-inset-top,54px)+0.75rem)] px-4 pb-3 border-b border-app-separator flex justify-between items-center bg-app-bg z-20 mt-2">
              <button
                onClick={() => {
                  if (view === 'plate-detail') {
                    setView('search');
                  } else {
                    exitWorkspace();
                  }
                }}
                className="h-8 px-3.5 bg-app-surface-raised active:bg-white/15 border border-app-separator rounded-full text-[13px] font-semibold text-app-text active:scale-95 transition-all cursor-pointer flex items-center"
              >
                Back
              </button>

              <DateSelectPill date={selectedDate} onSelectPill={() => setIsSettingTime(!isSettingTime)} />

              <button onClick={() => setView(view === 'plate-detail' ? 'search' : 'plate-detail')} className="cursor-pointer">
                <PlatePill plate={plate} isOpen={view === 'plate-detail'} />
              </button>
            </nav>

            {/* workspace content */}
            <main className="relative flex-1 min-h-0 overflow-hidden w-full px-4">
              {/* plate sits at the bottom of the 'stack' */}
              <PlateDetailScreen
                plate={plate}
                onSelectFood={setActiveFood}
                loggedEntries={filteredLogs}
                onLogPlate={handleLogPlate}
              />

              {/* search sits below and slides up/down, leaves header bar visible when plate is open */}
              <motion.div
                className='absolute inset-0 z-9 bg-app-bg'
                animate={{ y: view === 'plate-detail' ? `calc(100% - ${searchHeaderHeight}px)` : '0%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <SearchScreen
                  onHeaderHeightReady={setSearchHeaderHeight}
                  onAdd={add}
                  onSelectFood={setActiveFood}
                  onEnteredSearchInput={() => setView('search')}
                  plateCount={plate.length}
                  onLogPlate={handleLogPlate}
                />
                {view === 'plate-detail' &&
                  <div className='absolute top-0 w-full h-px bg-app-separator' />
                }
              </motion.div>

              <AnimatePresence>
                {isSettingTime && (
                  <motion.div
                    className="absolute inset-x-0 bottom-0 z-11 bg-app-surface max-h-[75vh] rounded-t-3xl shadow-2xl pb-6"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 250 }}
                  >
                    <DateSelectModal
                      date={selectedDate}
                      onChangeTime={(date) => {
                        setSelectedDate(date);
                        setIsSettingTime(false);
                      }}
                      onBack={() => setIsSettingTime(false)}
                      onLogAtTime={handleLogPlate}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* food detail modal slides up when we tap on a food card in PlateDetailScreen, SearchScreen, FoodLog */}
      <AnimatePresence>
        {activeFood && (
          <motion.div
            className="fixed inset-0 z-11 bg-app-bg flex flex-col overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
          >
            <FoodDetailModal
              foodEntry={activeFood}
              onBack={() => setActiveFood(null)}
              onConfirm={handleConfirm}
              onRemove={handleRemove}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
export default App;
