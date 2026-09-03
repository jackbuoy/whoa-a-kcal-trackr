# whoa, a kcal trackr!

a calorie and macro tracker that stays out of your way, works offline, and stores your data right on your device

---

## why i built this

most nutrition apps have gotten frustrating to use. they ask you to create accounts, push monthly subscriptions, show ads, and make you wait on network requests just to log an apple or a cup of rice

i wanted something straightforward:
- **offline by default**: your foods and logs are saved directly in your browser using IndexedDB. no accounts, no tracking, no loading spinners, and it still works if you lose service
- **staging meals before logging**: instead of saving every ingredient one by one, you can build out a meal on "the plate", adjust your portion sizes, see how the numbers add up, and log the whole thing at once
- **good food data**: search whole foods and raw ingredients through the USDA database, or scan barcodes on packaged groceries with your phone camera using Open Food Facts
- **built for phones**: a 24-hour daily timeline, custom scroll wheels for time and date, and an on-screen number pad so your phone's keyboard doesn't push the screen around

---

## how it works

### barcode scanning & food search
- **camera barcode scanner**: uses your device's camera to read barcodes directly. it tries the browser's native `BarcodeDetector` first, falling back to `@zxing/library` if needed. includes controls for zoom and flashlight
- **open food facts**: scans look up packaged foods through the Open Food Facts database
- **usda fooddata central**: text search pulls whole foods and ingredients from the USDA database, automatically converting nutrients down to per-gram or per-milliliter values

### the plate (meal staging)
- add multiple foods to a temporary plate before committing anything to your day
- tweak quantities and serving units (grams, ounces, cups, tablespoons, or custom packaging)
- view a breakdown of calories and macros (protein, fat, carbs) across the whole plate
- commit the entire meal at once or update an existing logged meal

### 24-hour timeline
- daily log laid out hour by hour from 12 AM to 11 PM
- highlights the current hour so you know where you are in the day
- add food directly to any hour with a quick "+" button
- hourly and daily totals update as you log

---

## tech stack

- **frontend**: React 19, TypeScript, Vite
- **styling**: Tailwind CSS v4
- **database**: Dexie.js (IndexedDB)
- **animations**: Motion
- **scanning**: `@zxing/library` & native BarcodeDetector
- **food data**: USDA FoodData Central & Open Food Facts

---

## technical details & architecture

### local-first reactive queries
data is stored locally using IndexedDB through Dexie.js. components subscribe to database queries using `useLiveQuery`, meaning any time a log is created, updated, or deleted, the timeline and summary totals re-render automatically without needing a global state store or manual re-fetching

### base-unit scaling
foods imported from the USDA or Open Food Facts are normalized to base metric units (1g or 1ml). serving options store simple multipliers relative to that base. this keeps macro calculations consistent regardless of the unit:

$$\text{macro} = \text{base value} \times \text{serving ratio} \times \text{quantity}$$

### staged plate state & instance ids
items on the plate are given a temporary `instanceId` via `crypto.randomUUID()`. this allows having multiple separate entries of the same food on the same plate (e.g., olive oil used for cooking vs. olive oil used as dressing) with different serving sizes, without key conflicts

### barcode decoder fallback
the scanner attempts to use the browser's hardware-accelerated `BarcodeDetector` API first for better battery life and higher frame rates on supported mobile browsers. if that API isn't available, it falls back to a software decode loop using `@zxing/library`

---

## getting started

### prerequisites
- Node.js (v18 or newer)
- a free [USDA FoodData Central API key](https://fdc.nal.usda.gov/api-key-signup.html) (Open Food Facts doesn't require a key)

### setup

1. clone the repository:
   ```bash
   git clone https://github.com/your-username/whoa-a-kcal-trackr.git
   cd whoa-a-kcal-trackr
   ```

2. install dependencies:
   ```bash
   npm install
   ```

3. set up environment variables:
   create a `.env` file in the root:
   ```env
   VITE_USDA_API_KEY=your_usda_api_key_here
   ```

4. run the development server:
   ```bash
   npm run dev
   ```

5. build for production:
   ```bash
   npm run build
   ```
