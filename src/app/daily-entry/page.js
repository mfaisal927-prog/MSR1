"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createEntry } from "../actions";

function DailyEntryForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialYear = searchParams.get("year");
    const initialMonth = searchParams.get("month");
    const isSimulated = searchParams.get("simulated") === "true";

    const [date, setDate] = useState("");
    const [sales, setSales] = useState("");
    const [purchases, setPurchases] = useState("");
    const [expenses, setExpenses] = useState("");
    const [profit, setProfit] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("انٹری محفوظ ہوگئی ✓");
    const [errorMsg, setErrorMsg] = useState("");
    const [existingEntry, setExistingEntry] = useState(null);

    useEffect(() => {
        let targetDate = new Date();

        if (initialYear && initialMonth) {
            const currentYear = targetDate.getFullYear();
            const currentMonth = targetDate.getMonth() + 1;

            if (parseInt(initialYear, 10) !== currentYear || parseInt(initialMonth, 10) !== currentMonth) {
                targetDate = new Date(parseInt(initialYear, 10), parseInt(initialMonth, 10) - 1, 1);
            }
        }

        const formattedDate = new Date(
            targetDate.getTime() - targetDate.getTimezoneOffset() * 60000
        )
            .toISOString()
            .split("T")[0];

        setDate(formattedDate);
    }, [initialYear, initialMonth]);

    useEffect(() => {
        const salesVal = parseFloat(sales) || 0;
        const purchasesVal = parseFloat(purchases) || 0;
        const expensesVal = parseFloat(expenses) || 0;

        setProfit(salesVal - (purchasesVal + expensesVal));
    }, [sales, purchases, expenses]);

    const buildFormData = () => {
        const formData = new FormData();
        formData.append("date", date);
        formData.append("sales", sales);
        formData.append("purchases", purchases);
        formData.append("expenses", expenses);
        return formData;
    };

    const clearDuplicatePrompt = () => {
        setExistingEntry(null);
        setErrorMsg("");
    };

    const formatAmount = (value) => {
        const number = parseFloat(value) || 0;
        return number.toFixed(3).replace(/\.?0+$/, "");
    };

    const finishAndRedirect = (message) => {
        setSuccessMsg(message);
        setShowSuccess(true);
        setIsSubmitting(false);

        setTimeout(() => {
            setShowSuccess(false);

            if (initialYear && initialMonth) {
                router.push(`/monthly/${initialYear}/${initialMonth}`);
            } else {
                router.push("/dashboard");
            }
        }, 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (sales < 0 || purchases < 0 || expenses < 0) {
            setErrorMsg("منفی نمبر درج نہیں کیے جا سکتے");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");
        setExistingEntry(null);

        if (!isSimulated) {
            const response = await createEntry(buildFormData());

            if (response && !response.success) {
                if (response.duplicate) {
                    setExistingEntry(response.existing);
                }
                setErrorMsg(response.error);
                setIsSubmitting(false);
                return;
            }
        }

        finishAndRedirect("انٹری محفوظ ہوگئی ✓");
    };

    const handleOverwriteExisting = async () => {
        setIsSubmitting(true);
        setErrorMsg("");

        const response = await createEntry(buildFormData(), true);

        if (response && !response.success) {
            setErrorMsg(response.error || "تبدیلی محفوظ کرتے وقت خرابی پیدا ہوئی۔");
            setIsSubmitting(false);
            return;
        }

        setExistingEntry(null);
        finishAndRedirect("پرانی انٹری تبدیل ہوگئی ✓");
    };

    const handleCancel = () => {
        if (initialYear && initialMonth) {
            router.push(`/monthly/${initialYear}/${initialMonth}`);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="container" suppressHydrationWarning>
            <div className="dashboard-header animate-slide-up" suppressHydrationWarning>
                <h1 className="dashboard-title">روزانہ انٹری</h1>
                <p className="dashboard-subtitle">آج کا حساب کتاب درج کریں</p>
            </div>

            <div
                className="dashboard-content animate-slide-up"
                style={{ animationDelay: "0.1s" }}
                suppressHydrationWarning
            >
                {showSuccess && (
                    <div className="success-message" suppressHydrationWarning>
                        {successMsg}
                    </div>
                )}

                {errorMsg && (
                    <div
                        className="profit-negative"
                        style={{
                            padding: "1rem",
                            marginBottom: "1.5rem",
                            backgroundColor: "#fee2e2",
                            borderRadius: "var(--radius-sm)",
                            textAlign: "center",
                            fontWeight: "bold",
                        }}
                        suppressHydrationWarning
                    >
                        {errorMsg}
                    </div>
                )}

                {existingEntry && (
                    <div
                        className="card"
                        style={{
                            padding: "1.25rem",
                            marginBottom: "1.5rem",
                            border: "1px solid #f59e0b",
                            backgroundColor: "#fffbeb",
                            borderRadius: "var(--radius-md)",
                        }}
                        suppressHydrationWarning
                    >
                        <h3 style={{ marginBottom: "0.75rem", color: "#92400e", fontWeight: "bold" }}>
                            اس تاریخ کا ریکارڈ پہلے موجود ہے۔ کیا آپ اسے تبدیل کرنا چاہتے ہیں؟
                        </h3>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "1rem",
                                marginBottom: "1rem",
                            }}
                        >
                            <div style={{ background: "white", padding: "1rem", borderRadius: "10px" }}>
                                <strong style={{ display: "block", marginBottom: "0.5rem", color: "#6b7280" }}>
                                    پہلے محفوظ data
                                </strong>
                                <div>سیل: OMR {formatAmount(existingEntry.sale_total)}</div>
                                <div>خریداری: OMR {formatAmount(existingEntry.purchase_total)}</div>
                                <div>اخراجات: OMR {formatAmount(existingEntry.expense_total)}</div>
                                <div>منافع: OMR {formatAmount(existingEntry.profit_total)}</div>
                            </div>
                            <div style={{ background: "white", padding: "1rem", borderRadius: "10px" }}>
                                <strong style={{ display: "block", marginBottom: "0.5rem", color: "#065f46" }}>
                                    نیا data
                                </strong>
                                <div>سیل: OMR {formatAmount(sales)}</div>
                                <div>خریداری: OMR {formatAmount(purchases)}</div>
                                <div>اخراجات: OMR {formatAmount(expenses)}</div>
                                <div>منافع: OMR {formatAmount(profit)}</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                            <button
                                type="button"
                                className="btn-save"
                                style={{ width: "auto" }}
                                onClick={handleOverwriteExisting}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "تبدیل کر رہا ہے..." : "ہاں، تبدیل کریں"}
                            </button>
                            <button
                                type="button"
                                className="btn-cancel"
                                style={{ width: "auto", margin: 0 }}
                                onClick={() => {
                                    setExistingEntry(null);
                                    setErrorMsg("");
                                }}
                                disabled={isSubmitting}
                            >
                                نہیں، منسوخ کریں
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="entry-form">
                    <div className="form-group" suppressHydrationWarning>
                        <label className="form-label" htmlFor="date">
                            تاریخ
                        </label>
                        <input
                            id="date"
                            type="date"
                            className="form-input"
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                clearDuplicatePrompt();
                            }}
                            required
                        />
                    </div>

                    <div className="form-group" suppressHydrationWarning>
                        <label className="form-label" htmlFor="sales">
                            سیل (OMR)
                        </label>
                        <input
                            id="sales"
                            type="number"
                            step="any"
                            min="0"
                            className="form-input numeric-input"
                            placeholder="0.00"
                            value={sales}
                            onChange={(e) => {
                                setSales(e.target.value);
                                clearDuplicatePrompt();
                            }}
                            required
                        />
                    </div>

                    <div className="form-group" suppressHydrationWarning>
                        <label className="form-label" htmlFor="purchases">
                            خریداری (OMR)
                        </label>
                        <input
                            id="purchases"
                            type="number"
                            step="any"
                            min="0"
                            className="form-input numeric-input"
                            placeholder="0.00"
                            value={purchases}
                            onChange={(e) => {
                                setPurchases(e.target.value);
                                clearDuplicatePrompt();
                            }}
                            required
                        />
                    </div>

                    <div className="form-group" suppressHydrationWarning>
                        <label className="form-label" htmlFor="expenses">
                            اخراجات (OMR)
                        </label>
                        <input
                            id="expenses"
                            type="number"
                            step="any"
                            min="0"
                            className="form-input numeric-input"
                            placeholder="0.00"
                            value={expenses}
                            onChange={(e) => {
                                setExpenses(e.target.value);
                                clearDuplicatePrompt();
                            }}
                            required
                        />
                    </div>

                    <div className="profit-calculation-box" suppressHydrationWarning>
                        <div className="profit-label" suppressHydrationWarning>
                            موجودہ بچت/منافع:
                        </div>
                        <div
                            className={`profit-amount ${profit >= 0 ? "profit-positive" : "profit-negative"}`}
                            suppressHydrationWarning
                        >
                            <span className="card-currency">OMR</span>
                            <span className="profit-value">{profit.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="form-actions" suppressHydrationWarning>
                        <button type="submit" className="btn-save" disabled={isSubmitting}>
                            {isSubmitting ? "محفوظ کر رہا ہے..." : "محفوظ کریں"}
                        </button>
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={handleCancel}
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

export default function DailyEntry() {
    return (
        <Suspense fallback={<div className="container center-content">Loading...</div>}>
            <DailyEntryForm />
        </Suspense>
    );
}
