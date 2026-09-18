"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    BarChart3,
    CalendarDays,
    CalendarRange,
    ClipboardList,
    PackageCheck,
    PlusCircle,
    ReceiptText,
    Search,
    ShoppingBag,
    TrendingDown,
    TrendingUp,
    Wallet,
} from "lucide-react";

const monthLabels = {
    1: "جنوری",
    2: "فروری",
    3: "مارچ",
    4: "اپریل",
    5: "مئی",
    6: "جون",
    7: "جولائی",
    8: "اگست",
    9: "ستمبر",
    10: "اکتوبر",
    11: "نومبر",
    12: "دسمبر",
};

function formatAmount(value) {
    return Number(value || 0).toFixed(2);
}

function formatDateLabel(dateValue) {
    if (!dateValue) return "ابھی کوئی ریکارڈ موجود نہیں";
    const normalizedDate = typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
        ? new Date(`${dateValue}T12:00:00`)
        : new Date(dateValue);
    const date = normalizedDate;
    if (Number.isNaN(date.getTime())) return dateValue;

    return date.toLocaleDateString("ur-PK", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function DashboardClient({ sixMonthsData = [], latestEntry }) {
    const router = useRouter();

    const navigateTo = (path) => {
        router.push(path);
    };

    const latestTotals = useMemo(() => {
        const sales = latestEntry?.sale_total || 0;
        const purchases = latestEntry?.purchase_total || 0;
        const dailyExpenses = latestEntry?.expense_total || 0;
        const extraExpenses = latestEntry?.extra_expense_total || 0;
        const totalExpenses = dailyExpenses + extraExpenses;
        const profit = latestEntry?.profit_total ?? sales - purchases - totalExpenses;

        return { sales, purchases, totalExpenses, profit };
    }, [latestEntry]);

    const summaryCards = [
        {
            title: "آخری سیل",
            value: latestTotals.sales,
            icon: ShoppingBag,
            tone: "blue",
            note: "محفوظ شدہ تازہ ترین دن",
        },
        {
            title: "آخری خریداری",
            value: latestTotals.purchases,
            icon: PackageCheck,
            tone: "amber",
            note: "سپلائر اور اسٹاک خرچ",
        },
        {
            title: "کل اخراجات",
            value: latestTotals.totalExpenses,
            icon: ReceiptText,
            tone: "rose",
            note: "روزانہ + اضافی اخراجات",
        },
        {
            title: "بچت / منافع",
            value: latestTotals.profit,
            icon: latestTotals.profit >= 0 ? TrendingUp : TrendingDown,
            tone: latestTotals.profit >= 0 ? "green" : "rose",
            note: latestTotals.profit >= 0 ? "مثبت کارکردگی" : "توجہ کی ضرورت",
            valueClass: latestTotals.profit >= 0 ? "profit-positive" : "profit-negative",
        },
    ];

    const quickActions = [
        { label: "نئی انٹری کریں", path: "/daily-entry", icon: PlusCircle, tone: "green" },
        { label: "تمام ریکارڈ دیکھیں", path: "/records", icon: ClipboardList, tone: "indigo" },
        { label: "مخصوص تاریخ کا ریکارڈ", path: "/daily", icon: Search, tone: "violet" },
        { label: "ماہانہ حساب", path: "/monthly", icon: CalendarRange, tone: "blue" },
        { label: "رپورٹس", path: "/reports", icon: BarChart3, tone: "teal" },
        { label: "خریداری مینجمنٹ", path: "/purchases", icon: Wallet, tone: "amber" },
    ];

    return (
        <div className="container dashboard-shell">
            <section className="dashboard-hero animate-slide-up">
                <div>
                    <span className="eyebrow">Malik Sajawal Refreshment</span>
                    <h1 className="dashboard-title">آپریشن ڈیش بورڈ</h1>
                    <p className="dashboard-subtitle">
                        تازہ ترین ریکارڈ: {formatDateLabel(latestEntry?.date)}
                    </p>
                </div>

                <div className="dashboard-hero-meta">
                    <span>Live Accounting</span>
                    <strong>{sixMonthsData.length} ماہ کا خلاصہ</strong>
                </div>
            </section>

            <section className="summary-grid animate-slide-up" style={{ animationDelay: "0.08s" }}>
                {summaryCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <article key={card.title} className={`summary-card metric-card tone-${card.tone}`}>
                            <div className="metric-card-header">
                                <span className="metric-icon">
                                    <Icon size={20} />
                                </span>
                                <span className="card-title">{card.title}</span>
                            </div>
                            <div className={`card-value ${card.valueClass || ""}`}>
                                <span className="card-currency">OMR</span>
                                {formatAmount(card.value)}
                            </div>
                            <p className="metric-note">{card.note}</p>
                        </article>
                    );
                })}
            </section>

            <section className="dashboard-section animate-slide-up" style={{ animationDelay: "0.16s" }}>
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">Trend View</span>
                        <h2>پچھلے مہینوں کا خلاصہ</h2>
                    </div>
                </div>

                <div className="month-summary-grid">
                    {sixMonthsData.length === 0 ? (
                        <div className="empty-state">کوئی ریکارڈ موجود نہیں ہے۔</div>
                    ) : (
                        sixMonthsData.map((data, index) => {
                            const isPositive = (data._sum.profit_total || 0) >= 0;
                            const monthStr = String(data.month).padStart(2, "0");

                            return (
                                <button
                                    key={`${data.year}-${data.month}`}
                                    className={`monthly-summary-card ${isPositive ? "positive" : "negative"}`}
                                    onClick={() => navigateTo(`/monthly/${data.year}/${monthStr}`)}
                                    style={{ animationDelay: `${(index + 1) * 0.05}s` }}
                                >
                                    <div className="monthly-card-top">
                                        <span className="metric-icon">
                                            <CalendarDays size={18} />
                                        </span>
                                        <strong>{monthLabels[data.month]} {data.year}</strong>
                                    </div>

                                    <div className="monthly-lines">
                                        <span>سیل <b>{formatAmount(data._sum.sale_total)} OMR</b></span>
                                        <span>خریداری <b>{formatAmount(data._sum.purchase_total)} OMR</b></span>
                                        <span>
                                            اخراجات <b>{formatAmount((data._sum.expense_total || 0) + (data._sum.extra_expense_total || 0))} OMR</b>
                                        </span>
                                    </div>

                                    <div className="monthly-profit">
                                        <span>منافع</span>
                                        <b>
                                            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            {formatAmount(data._sum.profit_total)} OMR
                                        </b>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </section>

            <section className="dashboard-section animate-slide-up" style={{ animationDelay: "0.24s" }}>
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">Daily Workflow</span>
                        <h2>فوری روابط</h2>
                    </div>
                </div>

                <div className="actions-section">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.path}
                                className={`btn-action action-tile tone-${action.tone}`}
                                onClick={() => navigateTo(action.path)}
                            >
                                <span className="icon-circle">
                                    <Icon size={22} />
                                </span>
                                <span>{action.label}</span>
                            </button>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
