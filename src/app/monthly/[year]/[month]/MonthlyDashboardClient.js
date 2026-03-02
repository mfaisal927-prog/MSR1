"use client";
import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateMonthlySettings } from "../../../actions";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { Download, FileText, Plus, List, Upload, ClipboardPaste } from 'lucide-react';
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function MonthlyDashboardClient({ year, month, totals, prevMonthProfit, initialSettings, entries = [] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const monthLabels = {
        "01": "جنوری", "02": "فروری", "03": "مارچ", "04": "اپریل",
        "05": "مئی", "06": "جون", "07": "جولائی", "08": "اگست",
        "09": "ستمبر", "10": "اکتوبر", "11": "نومبر", "12": "دسمبر",
    };
    const currentMonthLabel = `${monthLabels[month]} ${year}`;

    const navigateTo = (path) => router.push(path);

    const handleToggleSetting = async (e) => {
        const newValue = e.target.checked;
        startTransition(() => {
            updateMonthlySettings(year, month, newValue);
        });
    };

    const isOptionOn = initialSettings?.include_prev_profit || false;

    // Memoize the analytics
    const {
        displayExpenses, displayProfit,
        dailyData, weeklyProfit, maxSaleDayText,
        avgDailySale, totalExtraExpense
    } = useMemo(() => {
        let expenses = totals.expenses;
        let profit = totals.profit;

        if (isOptionOn) {
            expenses = totals.expenses + prevMonthProfit;
            profit = totals.sales - (totals.purchases + expenses);
        }

        // Daily Trend Data sorting
        const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
        const dailyData = sortedEntries.map(e => ({
            dateStr: new Date(e.date).getDate().toString(),
            سیل: e.sale_total,
            منافع: e.profit_total
        }));

        // Weekly Breakdown
        let w1 = 0, w2 = 0, w3 = 0, w4 = 0;

        // Smart Insights Logic
        let maxSale = -1;
        let maxSaleDay = "";
        let totalDays = sortedEntries.length;

        sortedEntries.forEach(e => {
            const dateNum = new Date(e.date).getDate();
            if (dateNum <= 7) w1 += e.profit_total;
            else if (dateNum <= 14) w2 += e.profit_total;
            else if (dateNum <= 21) w3 += e.profit_total;
            else w4 += e.profit_total;

            if (e.sale_total > maxSale) {
                maxSale = e.sale_total;
                maxSaleDay = e.day_text || new Date(e.date).toLocaleDateString('ur-PK', { weekday: 'long' });
            }
        });

        const avgDailySale = totalDays > 0 ? totals.sales / totalDays : 0;

        return {
            displayExpenses: expenses,
            displayProfit: profit,
            dailyData,
            weeklyProfit: [w1, w2, w3, w4],
            maxSaleDayText: maxSaleDay,
            avgDailySale,
            totalExtraExpense: entries.reduce((sum, e) => sum + (e.extra_expense_total || 0), 0)
        };
    }, [totals, prevMonthProfit, isOptionOn, entries]);

    const barChartData = [
        { name: 'سیل', sum: totals.sales, fill: '#14532d' },
        { name: 'خریداری', sum: totals.purchases, fill: '#ef4444' },
        { name: 'اخراجات', sum: displayExpenses, fill: '#f59e0b' },
        { name: 'منافع', sum: displayProfit, fill: displayProfit >= 0 ? '#10b981' : '#ef4444' }
    ];

    const weeklyChartData = [
        { name: 'ہفتہ 1', منافع: weeklyProfit[0] },
        { name: 'ہفتہ 2', منافع: weeklyProfit[1] },
        { name: 'ہفتہ 3', منافع: weeklyProfit[2] },
        { name: 'ہفتہ 4+', منافع: weeklyProfit[3] },
    ];

    const handleDownloadCSV = () => {
        const headers = "Date,Day,Sale,Purchase,Expense,Profit\n";
        const rows = entries.map(entry => {
            const dateStr = entry.date;
            const dayStr = entry.day_text || new Date(entry.date).toLocaleDateString('ur-PK', { weekday: 'long' }).replace(/,/g, '');
            return `${dateStr},${dayStr},${entry.sale_total},${entry.purchase_total},${entry.expense_total},${entry.profit_total}`;
        }).join("\n");

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(headers + rows);
        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", `monthly_report_${year}_${month}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF('p', 'pt');
        // Simple English/Fallback due to jsPdf urdu limitations without custom font
        // Using basic english table just for export standard. 
        doc.setFontSize(20);
        doc.text(`Monthly Report - ${year}/${month}`, 40, 40);

        doc.setFontSize(12);
        doc.text(`Total Sale: ${totals.sales} OMR`, 40, 70);
        doc.text(`Total Purchase: ${totals.purchases} OMR`, 40, 90);
        doc.text(`Total Expense: ${displayExpenses} OMR`, 40, 110);
        doc.text(`Net Profit: ${displayProfit} OMR`, 40, 130);

        const tableColumn = ["Date", "Day", "Sale", "Purchase", "Expense", "Profit"];
        const tableRows = [];

        [...entries].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(e => {
            const eData = [
                e.date,
                e.day_text || "-",
                e.sale_total,
                e.purchase_total,
                e.expense_total,
                e.profit_total
            ];
            tableRows.push(eData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 150,
            theme: 'striped',
            headStyles: { fillColor: [20, 83, 45] }
        });

        doc.save(`report_${year}_${month}.pdf`);
    };

    if (!mounted) {
        return <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}></div>;
    }

    return (
        <div className="container">
            <div className="dashboard-header animate-slide-up">
                <h1 className="dashboard-title">{currentMonthLabel} کا حساب</h1>
            </div>

            <div className="dashboard-content animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <button className="btn-cancel" style={{ width: 'auto', margin: 0 }} onClick={() => router.push("/monthly")}>
                        &larr; مہینہ تبدیل کریں
                    </button>

                    {/* EXPORT BUTTONS */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-action" style={{ padding: '0.5rem 1rem', width: 'auto', fontSize: '0.9rem', gap: '0.5rem' }} onClick={handleDownloadPDF}>
                            <FileText size={18} /> <span>PDF ڈاؤن لوڈ</span>
                        </button>
                        <button className="btn-action" style={{ padding: '0.5rem 1rem', width: 'auto', fontSize: '0.9rem', gap: '0.5rem' }} onClick={handleDownloadCSV}>
                            <Download size={18} /> <span>CSV ایکسپورٹ</span>
                        </button>
                    </div>
                </div>

                <div style={{
                    marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: 'var(--bg-color)',
                    borderRadius: '16px', border: '1px solid var(--border)', display: 'flex',
                    alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)'
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '1rem', width: '100%' }}>
                        <div style={{ position: 'relative', display: 'inline-block', width: '48px', height: '28px', flexShrink: 0 }}>
                            <input type="checkbox" checked={isOptionOn} onChange={handleToggleSetting} disabled={isPending} style={{ opacity: 0, width: 0, height: 0 }} />
                            <span style={{
                                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: isOptionOn ? 'var(--accent)' : 'var(--text-muted)',
                                transition: '.4s', borderRadius: '34px', opacity: isPending ? 0.5 : 1
                            }}>
                                <span style={{
                                    position: 'absolute', content: '""', height: '20px', width: '20px',
                                    left: isOptionOn ? '24px' : '4px', bottom: '4px',
                                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                                }}></span>
                            </span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                پچھلے ماہ کا منافع شامل کریں
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                اس ماہ کے اخراجات میں پچھلے ماہ کا منافع ایڈجسٹ کریں۔
                            </div>
                        </div>
                    </label>
                </div>

                <div className="summary-grid">
                    <div className="summary-card">
                        <div className="card-title">اس ماہ کی کل سیل</div>
                        <div className="card-value"><span className="card-currency">OMR</span>{totals.sales.toFixed(2)}</div>
                    </div>
                    <div className="summary-card">
                        <div className="card-title">کل خریداری</div>
                        <div className="card-value"><span className="card-currency">OMR</span>{totals.purchases.toFixed(2)}</div>
                    </div>
                    <div className="summary-card">
                        <div className="card-title">{isOptionOn ? "ایڈجسٹڈ اخراجات" : "کل اخراجات"}</div>
                        <div className="card-value"><span className="card-currency">OMR</span>{displayExpenses.toFixed(2)}</div>
                        {isOptionOn && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>اصل: {totals.expenses.toFixed(2)} + پچھلا منافع: {prevMonthProfit.toFixed(2)}</div>}
                    </div>
                    <div className="summary-card">
                        <div className="card-title">{isOptionOn ? "ایڈجسٹڈ منافع" : "خالص منافع"}</div>
                        <div className={`card-value ${displayProfit >= 0 ? 'profit-positive' : 'profit-negative'}`}><span className="card-currency">OMR</span>{displayProfit.toFixed(2)}</div>
                        {isOptionOn && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>اصل منافع: {totals.profit.toFixed(2)}</div>}
                    </div>
                </div>

                <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
                    <div className="summary-card" style={{ borderColor: '#f97316', backgroundColor: '#fff7ed', maxWidth: '300px', padding: '1rem 1.25rem' }}>
                        <div className="card-title" style={{ color: '#c2410c' }}>اضافی اخراجات (پرسنل)</div>
                        <div className="card-value" style={{ fontSize: '1.5rem', color: '#ea580c' }}><span className="card-currency" style={{ color: '#ea580c' }}>OMR</span>{totalExtraExpense.toFixed(2)}</div>
                    </div>
                </div>

                {/* SMART INSIGHTS */}
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '2rem' }}>کاروباری تجزیہ</h2>
                <div className="card" style={{ marginBottom: '2.5rem', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'var(--accent)' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '1.05rem', fontWeight: '500' }}>
                            <span style={{ color: 'var(--accent)' }}>✦</span>
                            <span>اوسطاً روزانہ کی سیل <strong>{avgDailySale.toFixed(1)} OMR</strong> رہی ہے۔</span>
                        </li>
                        <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '1.05rem', fontWeight: '500' }}>
                            <span style={{ color: 'var(--accent)' }}>✦</span>
                            {maxSaleDayText ? <span>اس مہینے سب سے زیادہ سیل <strong>{maxSaleDayText}</strong> کے روز ہوئی۔</span> : <span>ابھی سیل کا ریکارڈ موجود نہیں ہے۔</span>}
                        </li>
                        <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '1.05rem', fontWeight: '500' }}>
                            <span style={{ color: 'var(--accent)' }}>✦</span>
                            {displayProfit > 0 ? <span>مجموعی طور پر یہ مہینہ <strong>منافع بخش</strong> جا رہا ہے۔</span> : <span>اس مہینے مجموعی طور پر اخراجات سیل سے زیادہ ہیں۔</span>}
                        </li>
                    </ul>
                </div>

                {/* ADVANCED ANALYTICS */}
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>ماہانہ تجزیہ (گرافس)</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>

                    {/* Line Chart */}
                    <div className="card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
                        <h3 className="card-title">روزانہ کی کارکردگی (سیل بمقابلہ منافع)</h3>
                        <div style={{ flex: 1, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                                <LineChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                    <XAxis dataKey="dateStr" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="سیل" stroke="var(--primary)" strokeWidth={3} dot={false} />
                                    <Line type="monotone" dataKey="منافع" stroke="var(--accent)" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bar Chart Total */}
                    <div className="card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
                        <h3 className="card-title">مجموعی موازنہ</h3>
                        <div style={{ flex: 1, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                    <Bar dataKey="sum" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Weekly Breakdown Bar Chart */}
                    <div className="card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
                        <h3 className="card-title">ہفتہ وار منافع</h3>
                        <div style={{ flex: 1, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                                <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                    <Bar dataKey="منافع" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>انتظامی روابط</h2>
                <div className="actions-section">
                    <button className="btn-action" onClick={() => navigateTo(`/daily-entry?year=${year}&month=${month}`)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Plus size={24} color="var(--accent)" /><span>نئی انٹری کریں</span></div>
                    </button>
                    <button className="btn-action" onClick={() => navigateTo(`/monthly/${year}/${month}/records`)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><List size={24} color="var(--accent)" /><span>ریکارڈز دیکھیں</span></div>
                    </button>
                    <button className="btn-action" onClick={() => navigateTo(`/monthly/${year}/${month}/upload`)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Upload size={24} color="var(--accent)" /><span>CSV اپلوڈ</span></div>
                    </button>
                    <button className="btn-action" onClick={() => navigateTo(`/monthly/${year}/${month}/paste`)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><ClipboardPaste size={24} color="var(--accent)" /><span>ڈیٹا پیسٹ کریں</span></div>
                    </button>
                </div>
            </div>
        </div>
    );
}
