"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MonthlySelectPage() {
    const router = useRouter();

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12

    const [year, setYear] = useState(currentYear.toString());
    const [month, setMonth] = useState(currentMonth.toString().padStart(2, '0'));

    const months = [
        { value: "01", label: "جنوری" },
        { value: "02", label: "فروری" },
        { value: "03", label: "مارچ" },
        { value: "04", label: "اپریل" },
        { value: "05", label: "مئی" },
        { value: "06", label: "جون" },
        { value: "07", label: "جولائی" },
        { value: "08", label: "اگست" },
        { value: "09", label: "ستمبر" },
        { value: "10", label: "اکتوبر" },
        { value: "11", label: "نومبر" },
        { value: "12", label: "دسمبر" },
    ];

    // Generate years (e.g., 2024 to 2030)
    const years = Array.from({ length: 10 }, (_, i) => (currentYear - 1) + i);

    const handleOpenMonth = (e) => {
        e.preventDefault();
        router.push(`/monthly/${year}/${month}`);
    };

    return (
        <div className="container">
            <div className="dashboard-header animate-slide-up">
                <h1 className="dashboard-title">ماہانہ حساب</h1>
                <p className="dashboard-subtitle">مہینہ اور سال منتخب کریں</p>
            </div>

            <div className="dashboard-content animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
                    <button
                        className="btn-cancel"
                        style={{ width: 'auto' }}
                        onClick={() => router.push("/dashboard")}
                    >
                        &larr; ڈیش بورڈ پر واپس جائیں
                    </button>
                </div>

                <form onSubmit={handleOpenMonth} className="entry-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="monthSelect">مہینہ</label>
                        <select
                            id="monthSelect"
                            className="form-input"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            required
                        >
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="yearSelect">سال</label>
                        <select
                            id="yearSelect"
                            className="form-input"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            required
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="btn-save" style={{ marginTop: '1rem' }}>
                        اس ماہ کا حساب کھولیں
                    </button>
                </form>
            </div>
        </div>
    );
}
