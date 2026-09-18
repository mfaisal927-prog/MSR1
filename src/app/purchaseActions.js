"use server";
import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

// --- STORES ---
let storesSeeded = false;

export async function seedDefaultStores() {
    try {
        const defaultStores = [
            "بنگالی سبزی مارکیٹ",
            "بنگالی سپر سٹور",
            "نستو",
            "الاستقرار",
            "البیادر",
            "ہائی مارٹ",
            "صناعیہ بیکری",
            "پیٹرول پمپ"
        ];

        const existing = await prisma.store.findMany({
            where: { name: { in: defaultStores } }
        });

        const existingNames = existing.map(s => s.name);
        const toCreate = defaultStores.filter(name => !existingNames.includes(name));

        if (toCreate.length > 0) {
            await prisma.store.createMany({
                data: toCreate.map(name => ({ name }))
            });
            revalidatePath('/purchases');
            revalidatePath('/stores');
        }
    } catch (e) {
        console.error("Seed error:", e);
    }
}

export async function getStores() {
    try {
        if (!storesSeeded) {
            await seedDefaultStores();
            storesSeeded = true;
        }
        return await prisma.store.findMany({
            where: { is_active: true },
            orderBy: { name: 'asc' }
        });
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function addStore(data) {
    try {
        const store = await prisma.store.create({ data });
        revalidatePath('/purchases');
        revalidatePath('/stores');
        return { success: true, store };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to add store" };
    }
}

export async function updateStore(id, data) {
    try {
        const store = await prisma.store.update({
            where: { id: parseInt(id) },
            data
        });
        revalidatePath('/purchases');
        revalidatePath('/stores');
        return { success: true, store };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to update store" };
    }
}

export async function deleteStore(id) {
    try {
        const usageCount = await prisma.purchaseLine.count({
            where: { storeId: parseInt(id) }
        });
        if (usageCount > 0) {
            return { success: false, error: "یہ اسٹور پہلے سے ریکارڈ میں استعمال ہو رہا ہے، حذف نہیں ہو سکتا" };
        }

        await prisma.store.update({
            where: { id: parseInt(id) },
            data: { is_active: false }
        });
        revalidatePath('/purchases');
        revalidatePath('/stores');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to delete store" };
    }
}

// --- ITEMS ---
let itemsSeeded = false;

export async function seedDefaultItems() {
    try {
        const defaultItems = [
            { name: "انڈے کریٹ", category: "گروسری", default_unit: "Pcs" },
            { name: "دہی", category: "ڈیری", default_unit: "Kg" },
            { name: "برگر", category: "گروسری", default_unit: "Pcs" },
            { name: "چینی", category: "گروسری", default_unit: "Kg" },
            { name: "دودھ", category: "ڈیری", default_unit: "Liter" },
            { name: "پانی", category: "پانی", default_unit: "Pcs" },
            { name: "گیس سلنڈر", category: "گیس", default_unit: "Pcs" },
            { name: "سیب", category: "پھل", default_unit: "Kg" },
            { name: "کیلے", category: "پھل", default_unit: "Dozen" },
            { name: "انار", category: "پھل", default_unit: "Kg" },
            { name: "انگور", category: "پھل", default_unit: "Kg" },
            { name: "آلو", category: "سبزیاں", default_unit: "Kg" },
            { name: "پیاز", category: "سبزیاں", default_unit: "Kg" },
            { name: "ٹماٹر", category: "سبزیاں", default_unit: "Kg" },
            { name: "دھنیا", category: "سبزیاں", default_unit: "Kg" },
            { name: "پودینہ", category: "سبزیاں", default_unit: "Kg" },
            { name: "بند گوبھی", category: "سبزیاں", default_unit: "Kg" },
            { name: "دال چنا", category: "گروسری", default_unit: "Kg" },
            { name: "بیسن", category: "گروسری", default_unit: "Kg" },
            { name: "میدہ", category: "گروسری", default_unit: "Kg" },
            { name: "گول گپے", category: "گروسری", default_unit: "Pcs" },
            { name: "کیچپ", category: "گروسری", default_unit: "Kg" },
            { name: "بادام", category: "ڈرائی فروٹس", default_unit: "Kg" },
            { name: "کاجو", category: "ڈرائی فروٹس", default_unit: "Kg" },
            { name: "اخروٹ", category: "ڈرائی فروٹس", default_unit: "Kg" },
            { name: "میوہ", category: "ڈرائی فروٹس", default_unit: "Kg" },
            { name: "مائیونیز", category: "گروسری", default_unit: "Kg" }
        ];

        const existingNamesQuery = await prisma.item.findMany({ select: { name: true } });
        const existingNames = existingNamesQuery.map(i => i.name);

        const toCreate = defaultItems.filter(item => !existingNames.includes(item.name));

        if (toCreate.length > 0) {
            await prisma.item.createMany({
                data: toCreate
            });
            revalidatePath('/purchases');
            revalidatePath('/items');
        }
    } catch (e) {
        console.error("Seed error:", e);
    }
}

export async function getItems() {
    try {
        if (!itemsSeeded) {
            await seedDefaultItems();
            itemsSeeded = true;
        }
        return await prisma.item.findMany({
            where: { is_active: true },
            orderBy: { name: 'asc' }
        });
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function addItem(data) {
    try {
        const item = await prisma.item.create({ data });
        revalidatePath('/purchases');
        revalidatePath('/items');
        return { success: true, item };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to add item" };
    }
}

export async function updateItem(id, data) {
    try {
        const item = await prisma.item.update({
            where: { id: parseInt(id) },
            data
        });
        revalidatePath('/purchases');
        revalidatePath('/items');
        return { success: true, item };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to update item" };
    }
}

export async function deleteItem(id) {
    try {
        const usageCount = await prisma.purchaseLine.count({
            where: { itemId: parseInt(id) }
        });
        if (usageCount > 0) {
            return { success: false, error: "یہ آئٹم پہلے سے ریکارڈ میں استعمال ہو رہا ہے، حذف نہیں ہو سکتا" };
        }

        await prisma.item.update({
            where: { id: parseInt(id) },
            data: { is_active: false }
        });
        revalidatePath('/purchases');
        revalidatePath('/items');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to delete item" };
    }
}

// --- PURCHASES ---
export async function getPurchaseHistory() {
    try {
        return await prisma.purchaseEntry.findMany({
            include: {
                lines: {
                    include: { item: true, store: true }
                }
            },
            orderBy: { date: 'desc' }
        });
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function addPurchaseEntry(date, notes, lines) {
    try {
        // Calculate total purchase amount for this entry
        let totalPurchaseAmt = 0;
        lines.forEach(line => {
            totalPurchaseAmt += line.total_price;
        });

        // Create the Purchase Entry and Lines within a transaction
        const result = await prisma.$transaction(async (tx) => {
            const entry = await tx.purchaseEntry.upsert({
                where: { date: date },
                update: { notes: notes },
                create: { date: date, notes: notes }
            });

            // Fetch all items to get default units
            const items = await tx.item.findMany();
            const itemMap = {};
            items.forEach(i => itemMap[i.id] = i.default_unit);

            // We need to support adding items to existing day.
            // Let's just create new lines and link them to the entry.
            for (let line of lines) {
                const baseUnit = itemMap[parseInt(line.itemId)] || line.unit;
                let q_in_base = parseFloat(line.quantity);

                // Normalization rules
                const lUnit = (line.unit || '').toLowerCase();
                const bUnit = (baseUnit || '').toLowerCase();

                if ((lUnit === 'gram' || lUnit === 'g') && bUnit === 'kg') {
                    q_in_base = q_in_base / 1000.0;
                } else if ((lUnit === 'ml' || lUnit === 'milliliter') && bUnit === 'liter') {
                    q_in_base = q_in_base / 1000.0;
                }

                const u_price_base = q_in_base > 0 ? (line.total_price / q_in_base) : line.unit_price;

                await tx.purchaseLine.create({
                    data: {
                        purchaseEntryId: entry.id,
                        itemId: parseInt(line.itemId),
                        storeId: parseInt(line.storeId),
                        quantity: parseFloat(line.quantity),
                        unit: line.unit,
                        unit_price: parseFloat(line.unit_price),
                        total_price: parseFloat(line.total_price),
                        quantity_in_base_unit: q_in_base,
                        unit_price_per_base_unit: u_price_base,
                        item_image_url: line.item_image_url || null
                    }
                });
            }

            // Sync with DailyEntry
            // We need to get all PurchaseLines for this date to get the sum
            const allEntryLines = await tx.purchaseLine.findMany({
                where: { purchaseEntryId: entry.id }
            });

            const newTotalPurchase = allEntryLines.reduce((sum, l) => sum + l.total_price, 0);

            // Get date parts
            const d = new Date(date);
            const month = d.getMonth() + 1;
            const year = d.getFullYear();
            const daysArr = ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"];
            const dayText = daysArr[d.getDay()];

            // Find or create DailyEntry
            const daily = await tx.dailyEntry.findUnique({ where: { date: date } });

            if (daily) {
                const updatedProfit = daily.sale_total - newTotalPurchase - daily.expense_total;
                await tx.dailyEntry.update({
                    where: { id: daily.id },
                    data: {
                        purchase_total: newTotalPurchase,
                        profit_total: updatedProfit
                    }
                });
            } else {
                await tx.dailyEntry.create({
                    data: {
                        date: date,
                        day_text: dayText,
                        month: month,
                        year: year,
                        sale_total: 0,
                        purchase_total: newTotalPurchase,
                        expense_total: 0,
                        profit_total: -newTotalPurchase,
                        extra_expense_total: 0
                    }
                });
            }

            return entry;
        });

        revalidatePath('/purchases');
        revalidatePath('/dashboard');
        revalidatePath('/monthly');
        revalidatePath('/daily');
        revalidatePath('/price-compare');
        return { success: true, result };
    } catch (e) {
        console.error(e);
        return { success: false, error: e.message || "Failed to add purchase entry" };
    }
}

function parseDateKey(dateKey) {
    if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

function formatDateKey(date) {
    return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
    const next = new Date(date.getTime());
    next.setUTCDate(next.getUTCDate() + days);
    return next;
}

function emptyPeriod() {
    return { quantity: 0, amount: 0 };
}

function addToPeriod(period, quantity, amount) {
    period.quantity += quantity;
    period.amount += amount;
}

function roundNumber(value) {
    return Number((value || 0).toFixed(3));
}

// Item-wise consumption/purchase summary for latest available purchase date.
export async function getItemUsageSummary() {
    try {
        const lines = await prisma.purchaseLine.findMany({
            include: {
                item: true,
                entry: true
            }
        });

        const validLines = lines.filter(line => line.entry?.date && parseDateKey(line.entry.date));

        if (validLines.length === 0) {
            return {
                reportDate: null,
                ranges: null,
                totals: {
                    day: emptyPeriod(),
                    week: emptyPeriod(),
                    twoWeeks: emptyPeriod(),
                    month: emptyPeriod()
                },
                items: []
            };
        }

        const reportDate = validLines
            .map(line => line.entry.date)
            .sort()
            .at(-1);

        const report = parseDateKey(reportDate);
        const weekStart = formatDateKey(addDays(report, -6));
        const twoWeeksStart = formatDateKey(addDays(report, -13));
        const monthStart = formatDateKey(new Date(Date.UTC(report.getUTCFullYear(), report.getUTCMonth(), 1)));

        const ranges = {
            day: { start: reportDate, end: reportDate },
            week: { start: weekStart, end: reportDate },
            twoWeeks: { start: twoWeeksStart, end: reportDate },
            month: { start: monthStart, end: reportDate }
        };

        const totals = {
            day: emptyPeriod(),
            week: emptyPeriod(),
            twoWeeks: emptyPeriod(),
            month: emptyPeriod()
        };
        const byItem = new Map();

        const ensureItem = (line) => {
            const itemId = line.itemId;
            if (!byItem.has(itemId)) {
                byItem.set(itemId, {
                    itemId,
                    name: line.item?.name || "Unknown Item",
                    category: line.item?.category || "دیگر",
                    unit: line.item?.default_unit || line.unit || "",
                    lastDate: line.entry.date,
                    day: emptyPeriod(),
                    week: emptyPeriod(),
                    twoWeeks: emptyPeriod(),
                    month: emptyPeriod()
                });
            }

            const item = byItem.get(itemId);
            if (line.entry.date > item.lastDate) item.lastDate = line.entry.date;
            return item;
        };

        for (const line of validLines) {
            const date = line.entry.date;
            if (date > reportDate) continue;

            const quantity = Number(line.quantity_in_base_unit ?? line.quantity ?? 0);
            const amount = Number(line.total_price ?? 0);
            const item = ensureItem(line);

            if (date === reportDate) {
                addToPeriod(item.day, quantity, amount);
                addToPeriod(totals.day, quantity, amount);
            }

            if (date >= weekStart) {
                addToPeriod(item.week, quantity, amount);
                addToPeriod(totals.week, quantity, amount);
            }

            if (date >= twoWeeksStart) {
                addToPeriod(item.twoWeeks, quantity, amount);
                addToPeriod(totals.twoWeeks, quantity, amount);
            }

            if (date >= monthStart) {
                addToPeriod(item.month, quantity, amount);
                addToPeriod(totals.month, quantity, amount);
            }
        }

        const items = Array.from(byItem.values())
            .map(item => ({
                ...item,
                day: { quantity: roundNumber(item.day.quantity), amount: roundNumber(item.day.amount) },
                week: { quantity: roundNumber(item.week.quantity), amount: roundNumber(item.week.amount) },
                twoWeeks: { quantity: roundNumber(item.twoWeeks.quantity), amount: roundNumber(item.twoWeeks.amount) },
                month: { quantity: roundNumber(item.month.quantity), amount: roundNumber(item.month.amount) }
            }))
            .filter(item => item.month.amount > 0 || item.twoWeeks.amount > 0 || item.week.amount > 0 || item.day.amount > 0)
            .sort((a, b) => b.month.amount - a.month.amount || a.name.localeCompare(b.name));

        return {
            reportDate,
            ranges,
            totals: {
                day: { quantity: roundNumber(totals.day.quantity), amount: roundNumber(totals.day.amount) },
                week: { quantity: roundNumber(totals.week.quantity), amount: roundNumber(totals.week.amount) },
                twoWeeks: { quantity: roundNumber(totals.twoWeeks.quantity), amount: roundNumber(totals.twoWeeks.amount) },
                month: { quantity: roundNumber(totals.month.quantity), amount: roundNumber(totals.month.amount) }
            },
            items
        };
    } catch (e) {
        console.error(e);
        return {
            reportDate: null,
            ranges: null,
            totals: {
                day: emptyPeriod(),
                week: emptyPeriod(),
                twoWeeks: emptyPeriod(),
                month: emptyPeriod()
            },
            items: []
        };
    }
}

// Get the latest price of each item at each store
export async function getPriceComparison() {
    try {
        const lines = await prisma.purchaseLine.findMany({
            include: {
                item: true,
                store: true,
                entry: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const latestPrices = [];
        const seen = new Set();

        for (const line of lines) {
            const key = `${line.itemId}-${line.storeId}`;
            if (!seen.has(key)) {
                seen.add(key);
                latestPrices.push(line);
            }
        }

        return latestPrices;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function getItemPriceIntelligence(itemId) {
    try {
        // Fetch recent purchases for this item
        const lines = await prisma.purchaseLine.findMany({
            where: { itemId: parseInt(itemId) },
            include: { entry: true, store: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        if (lines.length === 0) return null;

        // Group by store to get last price per store
        const lastByStore = {};
        for (const l of lines) {
            if (!lastByStore[l.storeId]) {
                lastByStore[l.storeId] = {
                    price: l.unit_price_per_base_unit || l.unit_price,
                    date: l.entry.date
                };
            }
        }

        // Find absolute lowest recent price
        let lowestPrice = lines[0].unit_price_per_base_unit || lines[0].unit_price;
        for (const l of lines) {
            const price = l.unit_price_per_base_unit || l.unit_price;
            if (price < lowestPrice) lowestPrice = price;
        }

        return {
            lastByStore,
            lowestRecentPrice: lowestPrice,
            baseUnit: lines[0].item ? lines[0].item.default_unit : lines[0].unit
        };
    } catch (e) {
        return null;
    }
}
