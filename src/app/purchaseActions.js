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
        return { success: true, result };
    } catch (e) {
        console.error(e);
        return { success: false, error: e.message || "Failed to add purchase entry" };
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
