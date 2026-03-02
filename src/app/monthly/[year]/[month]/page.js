import MonthlyDashboardClient from "./MonthlyDashboardClient";
import { getEntriesByMonth, getMonthlySettings } from "../../../actions";

export const metadata = {
    title: "ماہانہ ڈیش بورڈ - Malik Sajawal Refreshment",
};

export default async function MonthlyDashboardPage({ params }) {
    const resolvedParams = await params;

    const yearInt = parseInt(resolvedParams.year, 10);
    const monthInt = parseInt(resolvedParams.month, 10);

    // Fetch entries from DB for given year and month
    const entries = await getEntriesByMonth(resolvedParams.year, resolvedParams.month);

    // Calculate totals
    let sales = 0;
    let purchases = 0;
    let expenses = 0;
    let profit = 0;

    entries.forEach(entry => {
        sales += entry.sale_total;
        purchases += entry.purchase_total;
        expenses += entry.expense_total;
        profit += entry.profit_total;
    });

    const totals = { sales, purchases, expenses, profit };

    // Fetch previous month's profit
    let prevMonth = monthInt - 1;
    let prevYear = yearInt;
    if (prevMonth === 0) {
        prevMonth = 12;
        prevYear -= 1;
    }

    const prevMonthEntries = await getEntriesByMonth(prevYear.toString(), prevMonth.toString());
    const prevMonthProfit = prevMonthEntries.reduce((sum, entry) => sum + entry.profit_total, 0);

    // Fetch monthly settings
    const settings = await getMonthlySettings(resolvedParams.year, resolvedParams.month);

    return (
        <MonthlyDashboardClient
            year={resolvedParams.year}
            month={resolvedParams.month}
            totals={totals}
            prevMonthProfit={prevMonthProfit}
            initialSettings={settings}
            entries={entries}
        />
    );
}
