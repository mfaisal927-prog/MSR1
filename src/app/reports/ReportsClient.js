"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

export default function ReportsClient({ entries }) {
    const router = useRouter();

    // Initialize with current month
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    });

    // Calculate totals and chart data based on selected month
    const { totals, chartData } = useMemo(() => {
        let sales = 0;
        let purchases = 0;
        let expenses = 0;
        let profit = 0;

        const filteredEntries = (entries || []).filter((entry) => {
            if (!selectedMonth) return true; // if no month is selected, show all time

            const entryDate = new Date(entry.date);
            const entryMonth = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;
            return entryMonth === selectedMonth;
        });

        filteredEntries.forEach((entry) => {
            sales += entry.sale_total;
            purchases += entry.purchase_total;
            expenses += entry.expense_total;
            profit += entry.profit_total;
        });

        // Formatting chart data
        const data = [
            {
                name: 'رپورٹ', // Report
                'سیل (Sales)': sales,
                'خریداری (Purch)': purchases,
                'اخراجات (Exp)': expenses,
                'منافع (Profit)': profit,
            }
        ];

        return {
            totals: { sales, purchases, expenses, profit },
            chartData: data
        };
    }, [entries, selectedMonth]);

    return (
        <div className="reports-page animate-slide-up">
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
                <button
                    className="btn-cancel"
                    style={{ width: 'auto' }}
                    onClick={() => router.push("/dashboard")}
                >
                    &larr; ڈیش بورڈ پر واپس جائیں
                </button>
            </div>

            <div className="filters-card">
                <div className="filter-group">
                    <label htmlFor="month">مہینہ منتخب کریں (آل ٹائم کے لیے خالی چھوڑیں)</label>
                    <input
                        id="month"
                        type="month"
                        className="form-input"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                </div>
            </div>

            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)', paddingRight: '0.25rem' }}>
                مجموعی خلاصہ
            </h2>

            <div className="summary-grid">
                <div className="summary-card">
                    <div className="card-title">کل سیل</div>
                    <div className="card-value">
                        <span className="card-currency">OMR</span>
                        {totals.sales.toFixed(2)}
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-title">کل خریداری</div>
                    <div className="card-value">
                        <span className="card-currency">OMR</span>
                        {totals.purchases.toFixed(2)}
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-title">کل اخراجات</div>
                    <div className="card-value">
                        <span className="card-currency">OMR</span>
                        {totals.expenses.toFixed(2)}
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-title">خالص منافع</div>
                    <div className={`card-value ${totals.profit >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                        <span className="card-currency">OMR</span>
                        {totals.profit.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '2rem', color: 'var(--text-main)', paddingRight: '0.25rem' }}>
                گرافیکل رپورٹ
            </h2>

            <div className="auth-card" style={{ padding: '2rem 1rem', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    /* Recharts RTL trick: set isAnimationActive strictly depending on required LTR orientation,
                     but since we are charting numbers, we supply standard values. */
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            contentStyle={{ textAlign: 'right', direction: 'rtl', borderRadius: '8px' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        <Bar dataKey="سیل (Sales)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="خریداری (Purch)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="اخراجات (Exp)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="منافع (Profit)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}
