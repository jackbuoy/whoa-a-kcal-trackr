import { useState, useEffect } from 'react';
import type { LogEntryWithFood } from "./types/food";
import { DayTotals } from "./components/DayTotals";
import { FoodLog } from "./components/FoodLog";
import { DateNavigator } from './components/DateNavigator';
import { AddFoodButton } from './components/AddFoodButton';
import { SearchScreen } from './components/SearchScreen';
import { FoodDetailModal } from './components/FoodDetailModal';
import { PlatePill } from './components/PlatePill';
import { LogFoodButton } from './components/LogFoodButton';
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
  const [searchHeaderHeight, setSearchHeaderHeight] = useState(60); // 60 is generic fallback
  const [isSettingTime, setIsSettingTime] = useState(false);

  // lock scrolling while activeFood is set, for FoodDetailModal
  useEffect(() => {
    if(!activeFood) document.body.style.overflow = '';
    if(activeFood) document.body.style.overflow = 'hidden';
  }, [activeFood])

  const handleAddFromDetail = async (foodEntry: LogEntryWithFood, shouldCommit?: boolean) => {
    addFromDetail(foodEntry);
    setActiveFood(null);

    if (shouldCommit) {
      // calculate updated plate state locally to commit immediately
      const updatedPlate = foodEntry.entry.instanceId
        ? plate.map(item => item.entry.instanceId === foodEntry.entry.instanceId ? foodEntry : item)
        : [...plate, { ...foodEntry, entry: { ...foodEntry.entry, instanceId: crypto.randomUUID() } }];

      await commit(updatedPlate);
      clearPlate();
      setView('dashboard');
    }
  }

  const handleConfirm = async (foodEntry: LogEntryWithFood, shouldCommit?: boolean) => {
    if (foodEntry.entry.id !== undefined) {
        // this is a logged food in the db, update entry
        await updateLogEntry(foodEntry);
        setActiveFood(null);
    } else {
        // this is an uncommitted food, use plate logic
        handleAddFromDetail(foodEntry, shouldCommit);
    }
  };

  const handleRemove = async (instanceIdOrId: string | number) => {
    if (typeof instanceIdOrId === 'number') {
        // this is a logged food database id, delete from db
        await deleteLogEntry(instanceIdOrId);
        setActiveFood(null);
    } else {
        // this is a plate instance id, remove from plate
        remove(instanceIdOrId);
        setActiveFood(null);
    }
  };


  const handleLogPlate = () => {
    commit(plate);
    clearPlate();
    setActiveFood(null);
    setView('dashboard');
  }

  return (
    <div className="p-6 md:p-8 bg-app-bg min-h-screen text-app-text font-sans antialiased">

      {/* dashboard view */}
      <h1 className="text-3xl font-extrabold text-brand tracking-tight mb-6">whoa, a kcal trackr!</h1>
      {view === 'dashboard' && (
        <>
          <DateNavigator date={selectedDate} onPrev={() => navigate(-1)} onNext={() => navigate(1)} />
          <DayTotals foodEntries={filteredLogs} />
          <FoodLog logs={filteredLogs} onSelectFood={setActiveFood} />
          <AddFoodButton onClick={() => setView('search')} />
        </>

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
            className="fixed inset-0 z-8 bg-app-bg flex flex-col"

          >
            <div className="h-screen w-screen flex flex-col overflow-hidden bg-app-bg text-app-text">
              {/* persistent header */}
              <nav className="p-4 border-b border-app-border flex justify-between items-center bg-app-surface/90 backdrop-blur-md">
                {/* back button, adjust time, cals, plate pill */}
                <button
                  onClick={() => {
                    if (view === 'plate-detail') { setView('search'); } // keep workspace open, switch to search
                    else {
                      // full exit: clear plate state and close workspace
                      setView('dashboard');
                      clearPlate();
                      setActiveFood(null);
                    }
                  }}
                  className="px-3 py-1.5 bg-app-surface border border-app-border rounded-xl text-sm font-semibold text-app-text hover:bg-app-border active:scale-95 transition-all cursor-pointer"
                >
                  Back
                </button>

                <DateSelectPill date={selectedDate} onSelectPill={() => setIsSettingTime(!isSettingTime)} />

                <button onClick={() => setView(view === 'plate-detail' ? 'search' : 'plate-detail')} className="cursor-pointer">
                  <PlatePill plate={plate} isOpen={view === 'plate-detail'} />
                </button>

              </nav>

              {/* workspace content */}
              <main className="relative flex-1 overflow-hidden w-full px-4">

                {/* plate sits at the bottom of the 'stack' */}
                <PlateDetailScreen
                  plate={plate}
                  onSelectFood={setActiveFood}
                  loggedEntries={filteredLogs}
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
                  />
                  {view === 'plate-detail' &&
                    <div className='absolute top-0 w-full h-1 bg-brand' />
                  }
                </motion.div>

                {/* <AnimatePresence>
                  {activeFood && (
                    <motion.div
                      className="absolute inset-0 z-11 bg-app-bg flex flex-col overflow-hidden"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 30, stiffness: 250 }}
                    >
                      <FoodDetailModal
                        foodEntry={activeFood}
                        onBack={() => setActiveFood(null)}
                        onConfirm={handleAddFromDetail}
                        onRemove={handleRemove}
                      />
                    </motion.div>
                  )}
                </AnimatePresence> */}

                <AnimatePresence>
                  {isSettingTime && (
                    <motion.div
                      className="absolute inset-x-0 bottom-0 z-11 bg-app-surface max-h-[75vh] rounded-t-3xl border-t border-app-border shadow-2xl pb-6"
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
            </div>


            {/* log button appears when plate is not empty,
                disappears when empty 
            */}
            <AnimatePresence>
              {view !== 'dashboard' && plate.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="fixed bottom-8 right-8 z-10"
                >
                  <LogFoodButton onLog={handleLogPlate} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/*
          food detail modal slides up when we tap on a food card 
          in PlateDetailScreen, SearchScreen, FoodLog 
      */}
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
export default App