"use server"

import { prisma } from "../lib/prisma"
import { revalidatePath } from "next/cache"

export async function createEntry(formData) {
    const date = formData.get("date")

    // Check if an entry already exists for this date
    const existing = await prisma.dailyEntry.findFirst({
        where: { date }
    })

    if (existing) {
        const formattedDate = new Date(date).toLocaleDateString('ur-PK');
        return { success: false, error: `${formattedDate} کی انٹری پہلے سے موجود ہے` }
    }

    const sale_total = parseFloat(formData.get("sales")) || 0
    const purchase_total = parseFloat(formData.get("purchases")) || 0
    const expense_total = parseFloat(formData.get("expenses")) || 0
    const profit_total = sale_total - (purchase_total + expense_total)

    // Parse year and month from date
    const [yearStr, monthStr] = date.split("-")
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10)

    await prisma.dailyEntry.create({
        data: {
            date,
            month,
            year,
            sale_total,
            purchase_total,
            expense_total,
            profit_total,
        }
    })

    revalidatePath("/records")
    revalidatePath("/dashboard")
    revalidatePath(`/monthly/${year}/${monthStr}`)
    return { success: true }
}

export async function updateEntry(id, formData) {
    const date = formData.get("date")
    const sale_total = parseFloat(formData.get("sales")) || 0
    const purchase_total = parseFloat(formData.get("purchases")) || 0
    const expense_total = parseFloat(formData.get("expenses")) || 0
    const profit_total = sale_total - (purchase_total + expense_total)

    // Parse year and month from date
    const [yearStr, monthStr] = date.split("-")
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10)

    await prisma.dailyEntry.update({
        where: { id: parseInt(id) },
        data: {
            date,
            month,
            year,
            sale_total,
            purchase_total,
            expense_total,
            profit_total,
        }
    })

    revalidatePath("/records")
    revalidatePath("/dashboard")
    revalidatePath(`/monthly/${year}/${monthStr}`)
    return { success: true }
}

export async function deleteEntry(id) {
    const entry = await prisma.dailyEntry.findUnique({ where: { id: parseInt(id) } });
    if (entry) {
        await prisma.dailyEntry.delete({
            where: { id: parseInt(id) }
        })
        const monthStr = entry.month.toString().padStart(2, '0');
        revalidatePath(`/monthly/${entry.year}/${monthStr}`);
    }
    revalidatePath("/records")
    revalidatePath("/dashboard")
    return { success: true }
}

export async function getEntries() {
    return await prisma.dailyEntry.findMany({
        orderBy: { date: 'desc' }
    })
}

export async function getEntryById(id) {
    return await prisma.dailyEntry.findUnique({
        where: { id: parseInt(id) }
    })
}

export async function getEntriesByMonth(year, month) {
    return await prisma.dailyEntry.findMany({
        where: {
            year: parseInt(year, 10),
            month: parseInt(month, 10),
        },
        orderBy: { date: 'desc' }
    })
}

export async function importCsvEntries(entries, overwrite = false) {
    try {
        const datesInCsv = entries.map(e => e.date);

        // Find existing entries for the dates being imported
        const existingEntries = await prisma.dailyEntry.findMany({
            where: {
                date: { in: datesInCsv }
            },
            select: { id: true, date: true }
        });

        const existingDates = new Set(existingEntries.map(e => e.date));

        if (!overwrite && existingDates.size > 0) {
            // Filter out entries that already exist
            entries = entries.filter(e => !existingDates.has(e.date));
            if (entries.length === 0) {
                return { success: false, error: "تمام تاریخوں کا ریکارڈ پہلے سے موجود ہے۔ 'اوور رائٹ کریں' چیک کر کے دوبارہ کوشش کریں۔" };
            }
        } else if (overwrite && existingDates.size > 0) {
            // Delete existing records to overwrite them
            await prisma.dailyEntry.deleteMany({
                where: { date: { in: Array.from(existingDates) } }
            });
        }

        await prisma.dailyEntry.createMany({
            data: entries
        });

        revalidatePath("/records");
        revalidatePath("/dashboard");
        revalidatePath("/monthly");
        revalidatePath("/reports");

        // Revalidate specific month pages based on the distinct months in entries
        const uniqueMonths = new Set(entries.map(e => `${e.year}-${e.month.toString().padStart(2, '0')}`));
        uniqueMonths.forEach(ym => {
            const [y, m] = ym.split('-');
            revalidatePath(`/monthly/${y}/${m}`);
        });

        return { success: true };
    } catch (error) {
        console.error("Error importing CSV:", error);
        return { success: false, error: "Database error during import" };
    }
}

export async function getEntryByDate(date) {
    return await prisma.dailyEntry.findFirst({
        where: { date }
    })
}

export async function importPastedData(pastedText, saveValid = false) {
    try {
        const lines = pastedText.split('\n');
        let duplicateCount = 0;
        let errorCount = 0;
        let successCount = 0;
        let errors = [];
        let validEntries = [];
        let totalExtraExpenseAdded = 0;
        let totalLinesParsed = 0;

        for (let i = 0; i < lines.length; i++) {
            const lineNumber = i + 1;
            const line = lines[i].trim();

            if (!line) continue; // EMPTY_LINE

            totalLinesParsed++;

            if (line.includes("خریداری") || line.includes("تاریخ") || line.includes("کس مد میں") || line.includes("اضافی اخراجات") || line.includes("روزنامچہ")) {
                continue; // HEADER_LINE
            }

            const tokens = line.split(/\s+/);
            if (tokens.length < 5) {
                errorCount++;
                errors.push({
                    lineNumber,
                    rawLine: line,
                    errorCode: 'COLUMN_MISSING',
                    messageUrdu: 'لائن میں کالمز پورے نہیں ہیں۔',
                    expectedFormat: 'کم از کم: خریداری، سیل، دن، تاریخ کے 3 حصے',
                    extractedColumns: tokens
                });
                continue;
            }

            // Find Date: could be 3 tokens ('28 November 2025') or 1 token ('2026-01-01')
            let parsedDateObj = null;
            let dateTokensCount = 0;

            let dateRawStr3 = tokens.slice(-3).join(" ");
            let d3 = new Date(dateRawStr3);

            let dateRawStr1 = tokens.slice(-1)[0];
            let d1 = new Date(dateRawStr1);

            if (!isNaN(d3.getTime())) {
                parsedDateObj = d3;
                dateTokensCount = 3;
            } else if (!isNaN(d1.getTime())) {
                parsedDateObj = d1;
                dateTokensCount = 1;
            } else {
                errorCount++;
                errors.push({
                    lineNumber,
                    rawLine: line,
                    errorCode: 'DATE_PARSE_ERROR',
                    messageUrdu: 'تاریخ کا فارمیٹ درست نہیں، یا تاریخ پہچانی نہیں جا سکی۔',
                    expectedFormat: 'مثال: 1 January 2026',
                    extractedColumns: tokens
                });
                continue;
            }

            const otherTokens = tokens.slice(0, tokens.length - dateTokensCount);
            if (otherTokens.length < 3) {
                errorCount++;
                errors.push({
                    lineNumber,
                    rawLine: line,
                    errorCode: 'COLUMN_MISSING',
                    messageUrdu: 'تاریخ کے علاوہ سیل، خریداری اور دن کا ہونا لازمی ہے۔',
                    expectedFormat: 'خریداری | سیل | دن',
                    extractedColumns: otherTokens
                });
                continue;
            }

            const day_text = otherTokens[otherTokens.length - 1];
            const saleStr = otherTokens[otherTokens.length - 2];
            const purchaseStr = otherTokens[otherTokens.length - 3];

            let extra_expense_total = 0;
            let extra_expense_reason = "";

            if (otherTokens.length > 3) {
                const extraTokens = otherTokens.slice(0, otherTokens.length - 3);
                let possibleExtraStr = extraTokens[extraTokens.length - 1];
                let parsedExtra = parseFloat(possibleExtraStr);
                if (!isNaN(parsedExtra)) {
                    extra_expense_total = parsedExtra;
                    extra_expense_reason = extraTokens.slice(0, extraTokens.length - 1).join(" ");
                } else {
                    extra_expense_reason = extraTokens.join(" ");
                }
            }

            const purchase_total = parseFloat(purchaseStr);
            const sale_total = parseFloat(saleStr);

            if (isNaN(purchase_total) || isNaN(sale_total)) {
                errorCount++;
                errors.push({
                    lineNumber,
                    rawLine: line,
                    errorCode: 'NUMBER_PARSE_ERROR',
                    messageUrdu: 'سیل یا خریداری کی رقم درست نمبر (Number) نہیں ہے۔',
                    expectedFormat: 'رقم نمبرز میں ہونی چاہیے (مثال: 12.5)',
                    extractedColumns: [purchaseStr, saleStr]
                });
                continue;
            }

            const yyyy = parsedDateObj.getFullYear();
            const mm = parsedDateObj.getMonth() + 1;
            const dd = String(parsedDateObj.getDate()).padStart(2, '0');
            const formattedDate = `${yyyy}-${String(mm).padStart(2, '0')}-${dd}`;

            validEntries.push({
                lineNumber,
                rawLine: line,
                entry: {
                    date: formattedDate,
                    day_text: day_text,
                    month: mm,
                    year: yyyy,
                    sale_total,
                    purchase_total,
                    expense_total: 0,
                    profit_total: sale_total - purchase_total,
                    extra_expense_total,
                    extra_expense_reason
                }
            });
        }

        const finalNewEntries = [];
        const existingDatesFound = new Set();

        if (validEntries.length > 0) {
            const datesInInput = validEntries.map(e => e.entry.date);
            const existingDBEntries = await prisma.dailyEntry.findMany({
                where: { date: { in: datesInInput } },
                select: { date: true }
            });
            const existingDatesDB = new Set(existingDBEntries.map(e => e.date));

            for (let item of validEntries) {
                if (existingDatesDB.has(item.entry.date)) {
                    duplicateCount++;
                    errors.push({
                        lineNumber: item.lineNumber,
                        rawLine: item.rawLine,
                        errorCode: 'DUPLICATE_DATE',
                        messageUrdu: `اس تاریخ (${item.entry.date}) کا ریکارڈ پہلے ہی محفوظ ہے۔`,
                        expectedFormat: 'تاریخ منفرد (Unique) ہونی چاہیے',
                        extractedColumns: [item.entry.date]
                    });
                } else if (existingDatesFound.has(item.entry.date)) {
                    duplicateCount++;
                    errors.push({
                        lineNumber: item.lineNumber,
                        rawLine: item.rawLine,
                        errorCode: 'DUPLICATE_DATE_IN_TEXT',
                        messageUrdu: `اس تاریخ (${item.entry.date}) کی ایک اور لائن اوپر موجود تھی۔ وہ محفوظ ہو گی، یہ نہیں۔`,
                        expectedFormat: 'ہر لائن کی تاریخ مختلف ہو',
                        extractedColumns: [item.entry.date]
                    });
                } else {
                    existingDatesFound.add(item.entry.date);
                    finalNewEntries.push(item.entry);
                }
            }
        }

        if (saveValid && finalNewEntries.length > 0) {
            totalExtraExpenseAdded = finalNewEntries.reduce((sum, e) => sum + (e.extra_expense_total || 0), 0);
            await prisma.dailyEntry.createMany({
                data: finalNewEntries
            });

            revalidatePath("/records");
            revalidatePath("/dashboard");
            revalidatePath("/monthly");
            revalidatePath("/reports");

            const uniqueMonths = new Set(finalNewEntries.map(e => `${e.year}-${e.month.toString().padStart(2, '0')}`));
            uniqueMonths.forEach(ym => {
                const [y, m] = ym.split('-');
                revalidatePath(`/monthly/${y}/${m}`);
            });
        }

        successCount = finalNewEntries.length;

        // "If some lines succeed and some fail: Save valid lines (by default)... Add buttons: 'صرف درست لائنیں محفوظ کریں' (save valid lines even if some fail)". 
        // We handle this directly by accepting saveValid.
        return {
            success: true,
            totalLinesParsed,
            successCount,
            duplicateCount,
            errorCount,
            errors,
            totalExtraExpenseAdded,
            isSaved: saveValid
        };
    } catch (error) {
        console.error("Error importing parsed data:", error);
        return { success: false, error: "ڈیٹا امپورٹ کرتے وقت ڈیٹا بیس کی خرابی پیدا ہو گئی۔" };
    }
}

export async function getMonthlySettings(year, month) {
    try {
        const settings = await prisma.monthlySettings.findUnique({
            where: {
                year_month: {
                    year: parseInt(year, 10),
                    month: parseInt(month, 10),
                }
            }
        });
        return settings ? settings : { include_prev_profit: false };
    } catch (error) {
        console.error("Error fetching monthly settings:", error);
        return { include_prev_profit: false };
    }
}

export async function updateMonthlySettings(year, month, include_prev_profit) {
    try {
        const y = parseInt(year, 10);
        const m = parseInt(month, 10);

        await prisma.monthlySettings.upsert({
            where: {
                year_month: { year: y, month: m }
            },
            update: {
                include_prev_profit
            },
            create: {
                year: y,
                month: m,
                include_prev_profit
            }
        });

        revalidatePath(`/monthly/${year}/${month.toString().padStart(2, '0')}`);
        // Also revalidate the generic monthly route since it caches
        revalidatePath(`/monthly`);

        return { success: true };
    } catch (error) {
        console.error("Error updating monthly settings:", error);
        return { success: false, error: "ترتیبات محفوظ کرتے وقت خرابی پیدا ہو گئی۔" };
    }
}

export async function getLast6MonthsSummary() {
    try {
        const aggregated = await prisma.dailyEntry.groupBy({
            by: ['year', 'month'],
            _sum: {
                sale_total: true,
                purchase_total: true,
                expense_total: true,
                profit_total: true,
                extra_expense_total: true,
            },
            orderBy: [
                { year: 'desc' },
                { month: 'desc' }
            ],
            take: 6,
        });
        return aggregated;
    } catch (error) {
        console.error("Error fetching 6 months summary:", error);
        return [];
    }
}
