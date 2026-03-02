"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateEntry } from "../../../actions";

export default function EditClient({ entry }) {
    const router = useRouter();

    const [date, setDate] = useState(entry.date);
    const [sales, setSales] = useState(entry.sale_total);
    const [purchases, setPurchases] = useState(entry.purchase_total);
    const [expenses, setExpenses] = useState(entry.expense_total);
    const [profit, setProfit] = useState(entry.profit_total);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const salesVal = parseFloat(sales) || 0;
        const purchasesVal = parseFloat(purchases) || 0;
        const expensesVal = parseFloat(expenses) || 0;
        setProfit(salesVal - (purchasesVal + expensesVal));
    }, [sales, purchases, expenses]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (sales < 0 || purchases < 0 || expenses < 0) {
            alert("منفی نمبر درج نہیں کیے جا سکتے");
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("date", date);
        formData.append("sales", sales);
        formData.append("purchases", purchases);
        formData.append("expenses", expenses);

        await updateEntry(entry.id, formData);

        setShowSuccess(true);
        setIsSubmitting(false);

        setTimeout(() => {
            setShowSuccess(false);
            router.push("/records");
        }, 2000);
    };

    return (
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {showSuccess && (
                <div className="success-message">
                    تبدیلیاں محفوظ ہوگئیں ✓
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
                        value={expenses}
                        onChange={(e) => setExpenses(e.target.value)}
                        required
                    />
                </div>

                <div className="profit-calculation-box">
                    <div className="profit-label">موجودہ بچت/منافع:</div>
                    <div className={`profit-amount ${profit >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                        <span className="card-currency">OMR</span>
                        <span className="profit-value">{profit.toFixed(2)}</span>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-save" disabled={isSubmitting}>
                        {isSubmitting ? "محفوظ کر رہا ہے..." : "تبدیلیاں محفوظ کریں"}
                    </button>
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => router.push("/records")}
                        disabled={isSubmitting}
                    >
                        منسوخ کریں
                    </button>
                </div>
            </form>
        </div>
    );
}
