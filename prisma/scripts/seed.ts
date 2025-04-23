import { PrismaClient, User, Mood, Event, Pixel } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import readlineSync from 'readline-sync';
import { isValid, format, set, getYear, getMonth, getDate } from 'date-fns';
import * as XLSX from 'xlsx'; // Import the xlsx library

// --- Initialize Prisma Client ---
const prisma = new PrismaClient();

// --- Configuration ---
const XLSX_FILE_PATH = path.join(__dirname, 'pixels_data.xlsx');
const TARGET_SHEET_NAME = 'Days 2024';
const TARGET_USER_EMAIL = 'g0dafkq@gmail.com';
const TARGET_YEAR = 2024;

// --- XLSX Ranges ---
const MOOD_LEGEND_RANGE = 'A1:A10';
const PIXEL_GRID_START_CELL = 'H2';
const PIXEL_GRID_END_CELL = 'S32';

// --- Interfaces ---
interface ParsedMoodLegend {
    name: string;
    colorHex: string;
}

interface ParsedPixelEntry {
    date: Date;
    moodColorHex: string | null;
    eventName: string | null;
}

interface PreparedDbPixel {
    pixelData: {
        userId: string;
        pixelDate: Date;
    };
    moodId: string | null;
    eventId: string | null;
}

// --- Helper Functions ---

/**
 * Attempts to normalize various color representations from XLSX cell styles
 * into a standard lowercase #rrggbb hex format.
 * Uses the correct type for the cell style object: XLSX.CellObject['s']
 */
function normalizeColorFromStyle(cellStyle: XLSX.CellObject['s']): string | null {
    const originalRgb = cellStyle?.fgColor?.rgb;
    console
    // 1. Ensure we have a string RGB value from the start
    if (!originalRgb || typeof originalRgb !== 'string') {
        // console.log("normalizeColor Debug: No originalRgb string found.");
        return null;
    }

    // 2. Process the RGB string
    let rgbHex = originalRgb.trim().toUpperCase();

    // 3. Handle potential ARGB format ('FFRRGGBB' or 'AARRGGBB')
    if (rgbHex.length === 8) {
        rgbHex = rgbHex.substring(2);
    }

    // 4. Validate the final format (must be 6 hex chars)
    if (rgbHex.length !== 6 || !/^[0-9A-F]{6}$/.test(rgbHex)) {
        console.warn(`normalizeColorFromStyle: Skipping invalid RGB format "${originalRgb}" -> "${rgbHex}"`);
        return null;
    }

    // 5. Filter out white (optional, keep if white is a mood color)
    if (rgbHex === 'FFFFFF') {
        // console.log("normalizeColor Debug: Skipping white color.");
        return null;
    }

    // 6. Return the normalized hex code
    return `#${rgbHex.toLowerCase()}`;
}


/**
 * Parses the Mood Legend and Pixel Grid from the specified XLSX sheet.
 */
function parseXlsxData(filePath: string, sheetName: string, year: number): {
    moods: ParsedMoodLegend[],
    pixels: ParsedPixelEntry[],
    uniqueEventNames: Set<string>,
    unknownColors: Set<string>,
} {
    console.log(`\nParsing XLSX data from: ${filePath}, Sheet: ${sheetName}`);
    if (!fs.existsSync(filePath)) {
        throw new Error(`XLSX file not found at: ${filePath}`);
    }

    // Read workbook with cell styles enabled
    const workbook = XLSX.readFile(filePath, { cellStyles: true });
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
        throw new Error(`Sheet "${sheetName}" not found. Available: ${Object.keys(workbook.Sheets).join(', ')}`);
    }

    const parsedMoods: ParsedMoodLegend[] = [];
    const parsedPixels: ParsedPixelEntry[] = [];
    const uniqueEventNames = new Set<string>();
    const unknownColors = new Set<string>(); // Track colors found in grid but not in legend

    // 1. Parse Mood Legend (e.g., A1:A10)
    console.log(`Parsing mood legend from range: ${MOOD_LEGEND_RANGE}`);
    const moodRange = XLSX.utils.decode_range(MOOD_LEGEND_RANGE);
    let moodsFoundCount = 0; // Counter for debugging

    for (let R = moodRange.s.r; R <= moodRange.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: moodRange.s.c });
        const cell: XLSX.CellObject | undefined = worksheet[cellAddress];
        const moodName = cell?.w?.trim() || cell?.v?.toString().trim();
        const cellStyle = cell?.s; // Get the style object
        // --- >>> ADD DEBUG LOGGING HERE <<< ---
        console.log(`\n--- Debugging Legend Row ${R + 1} (${cellAddress}) ---`);
        console.log(`  Raw Mood Name: "${moodName}"`);
        // Log the entire style object to see its structure
        console.log(`  Raw Cell Style Object (cell.s):`, JSON.stringify(cellStyle, null, 2));

        const colorHex = normalizeColorFromStyle(cellStyle);
        console.log(`  Result from normalizeColorFromStyle: ${colorHex}`);
        // --- >>> END DEBUG LOGGING <<< ---

        if (moodName && colorHex) {
            if (!parsedMoods.some(m => m.colorHex === colorHex)) {
                parsedMoods.push({ name: moodName, colorHex: colorHex });
                console.log(`  ✅ Added Mood: "${moodName}" -> Color: ${colorHex}`);
                moodsFoundCount++; // Increment counter
            } else {
                console.warn(`  ⚠️ Duplicate or unhandled color ${colorHex} found for mood "${moodName}" in legend. Skipping.`);
            }
        } else {
             console.log(`  ❌ Skipping row ${R + 1} because condition (moodName && colorHex) failed.`);
             if (!moodName) console.log("     Reason: Mood name is missing or empty.");
             if (!colorHex) console.log("     Reason: normalizeColorFromStyle returned null.");
        }
    }

    // After the loop, report the count found during parsing
    console.log(`\nFinished parsing legend. Moods found directly in loop: ${moodsFoundCount}`);

    if (parsedMoods.length === 0 && moodsFoundCount === 0) { // Enhanced warning condition
        console.warn("Warning: No valid mood names WITH extractable RGB colors found in the legend range!");
    }
    const legendColorMap = new Map(parsedMoods.map(m => [m.colorHex, m.name]));

    // 2. Parse Pixel Grid (e.g., H2:S32)
    console.log(`\nParsing pixel grid from ${PIXEL_GRID_START_CELL} to ${PIXEL_GRID_END_CELL}`);
    const gridRange = XLSX.utils.decode_range(`${PIXEL_GRID_START_CELL}:${PIXEL_GRID_END_CELL}`);
    const startCol = gridRange.s.c; // 0-based column index (e.g., H is 7)
    const startRow = gridRange.s.r; // 0-based row index (e.g., row 2 is 1)

    for (let R = gridRange.s.r; R <= gridRange.e.r; ++R) { // Iterate rows (days)
        const dayOfMonth = R - startRow + 1; // Calculate day (1-31)

        for (let C = gridRange.s.c; C <= gridRange.e.c; ++C) { // Iterate columns (months)
            const monthIndex = C - startCol; // 0-based month (0 = Jan, 1 = Feb, ...)

            // Construct Date - Use date-fns for safety and validation
            const potentialDate = set(new Date(year, monthIndex, dayOfMonth), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });

            // Validate the generated date
            if (!isValid(potentialDate) || getYear(potentialDate) !== year || getMonth(potentialDate) !== monthIndex || getDate(potentialDate) !== dayOfMonth) {
                continue; // Skip invalid dates like Feb 31st
            }
            const currentDate = potentialDate;

            // Get Cell Data
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell: XLSX.CellObject | undefined = worksheet[cellAddress];

            // Pass the cell's 's' property to the corrected function
            const moodColorHex = normalizeColorFromStyle(cell?.s);
            const eventName = cell?.w?.trim() || cell?.v?.toString().trim() || null; // Prefer formatted text

            // Store Pixel Entry
            const pixelEntry: ParsedPixelEntry = {
                date: currentDate,
                moodColorHex: moodColorHex,
                eventName: eventName,
            };
            parsedPixels.push(pixelEntry);

            // Track unique event names found
            if (eventName) {
                uniqueEventNames.add(eventName);
            }

            // Track unknown colors
            if (moodColorHex && !legendColorMap.has(moodColorHex)) {
                unknownColors.add(moodColorHex);
            }
        }
    }

    console.log(`\nParsed ${parsedPixels.length} potential pixel entries from grid.`);
    if (unknownColors.size > 0) {
        console.warn("\n--- !!! WARNING: Unknown Colors Encountered in Grid !!! ---");
        console.warn("Colors found in grid but NOT in legend:");
        unknownColors.forEach(color => console.warn(` - ${color}`));
        console.warn("Pixels with these colors will NOT have a Mood assigned.");
        console.warn("--- ^^^ ---------------------------------------------- ^^^ ---\n");
    }

    return {
        moods: parsedMoods,
        pixels: parsedPixels.filter(p => p.moodColorHex || p.eventName), // Only keep pixels with *some* data
        uniqueEventNames,
        unknownColors
    };
}


/**
 * Finds or creates Mood records in the database. Handles potential color updates.
 * Does NOT rely on @@unique([userId, name]).
 */
async function findOrCreateMoods(userId: string, parsedMoods: ParsedMoodLegend[]): Promise<Map<string, Mood>> {
    console.log('\nFinding or Creating moods in database...');
    const moodMap = new Map<string, Mood>(); // colorHex -> Mood Record

    for (const moodData of parsedMoods) {
        try {
            let mood = await prisma.mood.findFirst({
                where: { userId: userId, name: moodData.name }
            });

            if (mood) {
                if (mood.color !== moodData.colorHex) {
                    mood = await prisma.mood.update({
                        where: { id: mood.id },
                        data: { color: moodData.colorHex }
                    });
                    console.log(`  - Updated Mood Color: "${mood.name}" (ID: ${mood.id}) to ${mood.color}`);
                } else {
                    console.log(`  - Found Mood: "${mood.name}" (ID: ${mood.id})`);
                }
            } else {
                mood = await prisma.mood.create({
                    data: {
                        userId: userId,
                        name: moodData.name,
                        color: moodData.colorHex,
                    }
                });
                console.log(`  - Created Mood: "${mood.name}" (ID: ${mood.id}, Color: ${mood.color})`);
            }
            moodMap.set(moodData.colorHex, mood);
        } catch (error) {
            console.error(`  - Failed to process mood "${moodData.name}":`, error);
        }
    }
    console.log(`Mood processing complete. Mapped ${moodMap.size} colors to Mood records.`);
    return moodMap;
}

/**
 * Finds or creates Event records in the database based on unique names found.
 * Does NOT rely on @@unique([userId, name]).
 */
async function findOrCreateEvents(userId: string, eventNames: Set<string>): Promise<Map<string, Event>> {
    console.log('\nFinding or Creating events in database...');
    const eventMap = new Map<string, Event>(); // eventName -> Event Record

    for (const eventName of eventNames) {
        if (!eventName) continue;
        try {
            let event = await prisma.event.findFirst({
                where: { userId: userId, name: eventName }
            });

            if (event) {
                console.log(`  - Found Event: "${event.name}" (ID: ${event.id})`);
            } else {
                event = await prisma.event.create({
                    data: { userId: userId, name: eventName }
                });
                console.log(`  - Created Event: "${event.name}" (ID: ${event.id})`);
            }
            eventMap.set(eventName, event);
        } catch (error) {
            console.error(`  - Failed to process event "${eventName}":`, error);
        }
    }
    console.log(`Event processing complete. Mapped ${eventMap.size} names to Event records.`);
    return eventMap;
}


// --- Main Execution Function ---
async function main() {
    console.log(`Starting Pixel seeding process for year ${TARGET_YEAR}...`);

    // 1. Find Target User
    console.log(`\nLooking for user: ${TARGET_USER_EMAIL}`);
    const user = await prisma.user.findUnique({ where: { email: TARGET_USER_EMAIL } });
    if (!user) {
        console.error(`❌ Error: User with email ${TARGET_USER_EMAIL} not found.`);
        return;
    }
    console.log(`✅ Found user: ${user.name || user.email} (ID: ${user.id})`);

    // 2. Parse XLSX Data
    let parsedData: ReturnType<typeof parseXlsxData>;
    try {
        parsedData = parseXlsxData(XLSX_FILE_PATH, TARGET_SHEET_NAME, TARGET_YEAR);
    } catch (error) {
        console.error("❌ Failed to parse XLSX data:", error instanceof Error ? error.message : error);
        return;
    }
    const { moods: parsedMoods, pixels: parsedPixels, uniqueEventNames } = parsedData;
    if (parsedPixels.length === 0) {
        console.warn("\n⚠️ No pixel data with mood colors or event text found in the grid. Nothing to import.");
        return;
    }
    if (parsedMoods.length === 0) {
        console.warn("\n⚠️ No moods found in the legend. Pixels will be imported without mood information.");
    }

    // 3. Find/Create Moods and Events -> Get Maps for ID lookup
    const moodColorToRecordMap = await findOrCreateMoods(user.id, parsedMoods);
    const eventNameToRecordMap = await findOrCreateEvents(user.id, uniqueEventNames);

    // 4. Prepare Pixel data for DB insertion
    console.log("\nPreparing final pixel data for database operation...");
    const pixelsToProcess: PreparedDbPixel[] = [];
    let pixelsWithMood = 0;
    let pixelsWithEvent = 0;
    let pixelsWithoutMood = 0;

    for (const pixel of parsedPixels) {
        const moodRecord = pixel.moodColorHex ? moodColorToRecordMap.get(pixel.moodColorHex) : null;
        const eventRecord = pixel.eventName ? eventNameToRecordMap.get(pixel.eventName) : null;

        if (!moodRecord && pixel.moodColorHex) {
            pixelsWithoutMood++;
        }
        if (moodRecord) pixelsWithMood++;
        if (eventRecord) pixelsWithEvent++;

        if (moodRecord || eventRecord) {
            pixelsToProcess.push({
                pixelData: {
                    userId: user.id,
                    pixelDate: pixel.date,
                },
                moodId: moodRecord?.id ?? null,
                eventId: eventRecord?.id ?? null,
            });
        }
    }
    console.log(`Prepared ${pixelsToProcess.length} pixels for DB upsert.`);
    console.log(`  - ${pixelsWithMood} pixels have a mood.`);
    console.log(`  - ${pixelsWithEvent} pixels have an event.`);
    if (pixelsWithoutMood > 0) {
        console.warn(`  - ⚠️ ${pixelsWithoutMood} pixels had a color (${parsedData.unknownColors.size} unique unknown colors) but no matching mood record was found/created.`);
    }

    // 5. Verification and Confirmation
    console.log("\n--- Verification ---");
    if (pixelsToProcess.length === 0) {
        console.log("No valid pixels with associated moods or events found to insert. Exiting.");
        return;
    }
    console.log(`About to upsert/update ${pixelsToProcess.length} Pixel entries for user ${TARGET_USER_EMAIL} for year ${TARGET_YEAR}.`);
    console.log("This involves:");
    console.log("  1. Upserting the Pixel record itself (based on userId + date).");
    console.log("  2. Deleting existing Mood/Event links for that pixel.");
    console.log("  3. Creating new Mood/Event links based on the parsed data.");
    console.log("\nSample data (first 3 & last 3):");

    const samplePixels = [...pixelsToProcess.slice(0, 3), ...pixelsToProcess.slice(-3)];
    for (const p of samplePixels) {
        const mood = p.moodId ? [...moodColorToRecordMap.values()].find(m => m.id === p.moodId) : null;
        const event = p.eventId ? [...eventNameToRecordMap.values()].find(e => e.id === p.eventId) : null;
        console.log(`  - Date: ${format(p.pixelData.pixelDate, 'yyyy-MM-dd')}, Mood: ${mood?.name ?? 'None'}, Event: ${event?.name ?? 'None'}`);
    }

    const confirmation = readlineSync.question(`\nProceed with writing ${pixelsToProcess.length} pixels to the database? (yes/no): `);
    if (confirmation.toLowerCase() !== 'yes') {
        console.log("\n🚫 Operation cancelled by user.");
        return;
    }

    // 6. Database Write Operation
    console.log("\n🚀 Proceeding with database upserts...");
    let successCount = 0;
    let failureCount = 0;
    const total = pixelsToProcess.length;

    for (let i = 0; i < total; i++) {
        const { pixelData, moodId, eventId } = pixelsToProcess[i];
        const pixelDateStr = format(pixelData.pixelDate, 'yyyy-MM-dd');

        try {
            await prisma.$transaction(async (tx) => {
                const pixel = await tx.pixel.upsert({
                    where: { userId_pixelDate: { userId: pixelData.userId, pixelDate: pixelData.pixelDate } },
                    update: {},
                    create: {
                        userId: pixelData.userId,
                        pixelDate: pixelData.pixelDate,
                    },
                    select: { id: true }
                });

                await tx.moodToPixel.deleteMany({ where: { pixelId: pixel.id } });
                await tx.pixelToEvent.deleteMany({ where: { pixelId: pixel.id } });

                if (moodId) {
                    await tx.moodToPixel.create({
                        data: { pixelId: pixel.id, moodId: moodId }
                    });
                }
                if (eventId) {
                    await tx.pixelToEvent.create({
                        data: { pixelId: pixel.id, eventId: eventId }
                    });
                }
            });
            successCount++;
            process.stdout.write(`   Processed ${successCount}/${total} pixels... (Date: ${pixelDateStr}) \r`);
        } catch (error) {
            process.stdout.write('\n');
            failureCount++;
            console.error(`\n❌ Failed to process pixel for date ${pixelDateStr}:`, error instanceof Error ? error.message : error);
        }
    }
    process.stdout.write('\n');

    // 7. Final Summary
    console.log("\n--- Seeding Complete ---");
    console.log(`✅ Successfully processed: ${successCount} pixels`);
    if (failureCount > 0) {
        console.log(`❌ Failed: ${failureCount} pixels`);
    } else {
        console.log("✨ All operations completed successfully.");
    }
}

// --- Execute Script ---
main()
    .catch((e) => {
        console.error("\n--- 💥 An uncaught error occurred during the script execution ---");
        console.error(e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log("\n🔌 Database connection closed.");
        process.exit(process.exitCode ?? 0);
    });