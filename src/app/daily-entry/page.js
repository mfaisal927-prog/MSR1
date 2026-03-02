"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createEntry } from "../actions"; // Import the server action

function DailyEntryForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialYear = searchParams.get('year');
    const initialMonth = searchParams.get('month');
    // Using simulated mode if specifically asked, to respect "Database connect abhi nahi" requirements
    // but without breaking the real DB flow entirely.
    const isSimulated = searchParams.get('simulated') === 'true';

    // States for form fields
    const [date, setDate] = useState("");
    const [sales, setSales] = useState("");
    const [purchases, setPurchases] = useState("");
    const [expenses, setExpenses] = useState("");
    const [profit, setProfit] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for showing success message
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Set default date based on query parameters or just today
    useEffect(() => {
        let targetDate = new Date();

        if (initialYear && initialMonth) {
            const currentYear = targetDate.getFullYear();
            const currentMonth = targetDate.getMonth() + 1;

            // If the selected month is NOT the current month, default to the 1st day of that month
            if (parseInt(initialYear) !== currentYear || parseInt(initialMonth) !== currentMonth) {
                targetDate = new Date(parseInt(initialYear), parseInt(initialMonth) - 1, 1);
            }
        }

        // Use local date properly configured by locale offset
        const formattedDate = new Date(targetDate.getTime() - (targetDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        setDate(formattedDate);
    }, [initialYear, initialMonth]);

    // Recalculate profit whenever sales, purchases, or expenses change
    useEffect(() => {
        const salesVal = parseFloat(sales) || 0;
        const purchasesVal = parseFloat(purchases) || 0;
        const expensesVal = parseFloat(expenses) || 0;

        setProfit(salesVal - (purchasesVal + expensesVal));
    }, [sales, purchases, expenses]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (sales < 0 || purchases < 0 || expenses < 0) {
            setErrorMsg("منفی نمبر درج نہیں کیے جا سکتے"); // No negative numbers allowed
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        if (!isSimulated) {
            const formData = new FormData();
            formData.append("date", date);
            formData.append("sales", sales);
            formData.append("purchases", purchases);
            formData.append("expenses", expenses);

            const response = await createEntry(formData); // Server Action Call
            if (response && !response.success) {
                setErrorMsg(response.error);
                setIsSubmitting(false);
                return;
            }
        }

        setShowSuccess(true);
        setIsSubmitting(false);

        // Return back to dashboard or monthly dashboard depending on origin
        setTimeout(() => {
            setShowSuccess(false);
            if (initialYear && initialMonth) {
                router.push(`/monthly/${initialYear}/${initialMonth}`);
            } else {
                router.push("/dashboard");
            }
        }, 2000);
    };

    return (
        <div className="container">
            <div className="dashboard-header animate-slide-up">
                <h1 className="dashboard-title">روزانہ انٹری</h1>
                <p className="dashboard-subtitle">آج کا حساب کتاب درج کریں</p>
            </div>

            <div className="dashboard-content animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {showSuccess && (
                    <div className="success-message">
                        انٹری محفوظ ہوگئی ✓
                    </div>
                )}
                {errorMsg && (
                    <div className="profit-negative" style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#fee2e2', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontWeight: 'bold' }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="entry-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="date">تاریخ</label>
                        <input
                            id="date"
                            type="date"
                            className="form-input"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="sales">سیل (OMR)</label>
                        <input
                            id="sales"
                            type="number"
                            step="any"
                            min="0"
                            className="form-input numeric-input"
                            placeholder="0.00"
                            value={sales}
                            onChange={(e) => setSales(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="purchases">خریداری (OMR)</label>
                        <input
                            id="purchases"
                            type="number"
                            step="any"
                            min="0"
                            className="form-input numeric-input"
                            placeholder="0.00"
                            value={purchases}
                            onChange={(e) => setPurchases(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="expenses">اخراجات (OMR)</label>
                        <input
                            id="expenses"
                            type="number"
                            step="any"
                            min="0"
                            className="form-input numeric-input"
                            placeholder="0.00"
                            value={expenses}
                            onChange={(e) => setExpenses(e.target.value)}
                            required
                        />
                    </div>

                    {/* Auto Calculated Profit Section */}
                    <div className="profit-calculation-box">
                        <div className="profit-label">موجودہ بچت/منافع:</div>
                        <div className={`profit-amount ${profit >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                            <span className="card-currency">OMR</span>
                            <span className="profit-value">{profit.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-save" disabled={isSubmitting}>
                            {isSubmitting ? "محفوظ کر رہا ہے..." : "محفوظ کریں"}
                        </button>
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => {
                                if (initialYear && initialMonth) {
                                    router.push(`/monthly/${initialYear}/${initialMonth}`);
                                } else {
                                    router.push("/dashboard");
                                }
                            }}
                            disabled={isSubmitting}
                        >
                            منسوخ کریں
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Wrapping in Suspense because of useSearchParams hook inside
export default function DailyEntry() {
    return (
        <Suspense fallback={<div className="container center-content">Loading...</div>}>
            <DailyEntryForm />
        </Suspense>
    );
}
