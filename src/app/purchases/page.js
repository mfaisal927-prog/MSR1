import Link from "next/link";
import { getItemUsageSummary, getPurchaseHistory } from "../purchaseActions";
import {
    CalendarDays,
    History,
    Layers3,
    PackageCheck,
    PlusCircle,
    Search,
    ShoppingBag,
    Store,
    WalletCards
} from "lucide-react";
import { formatOMR } from "../../lib/formatMoney";

export const dynamic = 'force-dynamic';

function formatAmount(value) {
    return formatOMR(value);
}

function formatQuantity(value) {
    const numberValue = Number(value || 0);
    return Number.isInteger(numberValue) ? numberValue.toString() : numberValue.toFixed(2);
}

export default async function PurchasesDashboardPage() {
    const [history, usageSummary] = await Promise.all([
        getPurchaseHistory(),
        getItemUsageSummary()
    ]);

    const usageCards = [
        {
            key: "day",
            title: "تازہ دن",
            subtitle: usageSummary.reportDate || "کوئی ریکارڈ نہیں",
            icon: CalendarDays,
            tone: "usage-green"
        },
        {
            key: "week",
            title: "7 دن",
            subtitle: usageSummary.ranges ? `${usageSummary.ranges.week.start} تا ${usageSummary.ranges.week.end}` : "کوئی ریکارڈ نہیں",
            icon: PackageCheck,
            tone: "usage-blue"
        },
        {
            key: "twoWeeks",
            title: "14 دن",
            subtitle: usageSummary.ranges ? `${usageSummary.ranges.twoWeeks.start} تا ${usageSummary.ranges.twoWeeks.end}` : "کوئی ریکارڈ نہیں",
            icon: Layers3,
            tone: "usage-violet"
        },
        {
            key: "month",
            title: "رواں مہینہ",
            subtitle: usageSummary.ranges ? `${usageSummary.ranges.month.start} تا ${usageSummary.ranges.month.end}` : "کوئی ریکارڈ نہیں",
            icon: WalletCards,
            tone: "usage-amber"
        }
    ];

    return (
        <div className="container">
            <div className="dashboard-header animate-slide-up">
                <h1 className="dashboard-title">روزمرہ خریداری سسٹم</h1>
                <p className="dashboard-subtitle">اسٹور وائز قیمتوں اور خریداری کا تفصیلی ریکارڈ</p>
            </div>

            <div className="grid-cards animate-slide-up" style={{ animationDelay: '0.1s', marginBottom: '32px' }}>
                <Link href="/purchases/new" className="stat-card" style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <PlusCircle size={40} color="var(--primary)" style={{ marginBottom: '10px' }} />
                    <div className="stat-label">آج کی خریداری کے اندراج</div>
                </Link>

                <Link href="/items" className="stat-card" style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={40} color="#3b82f6" style={{ marginBottom: '10px' }} />
                    <div className="stat-label">آئٹمز (سامان)</div>
                </Link>

                <Link href="/stores" className="stat-card" style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Store size={40} color="#f59e0b" style={{ marginBottom: '10px' }} />
                    <div className="stat-label">اسٹورز و سپلائرز</div>
                </Link>

                <Link href="/price-compare" className="stat-card" style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Search size={40} color="#8b5cf6" style={{ marginBottom: '10px' }} />
                    <div className="stat-label">قیمتوں کا موازنہ</div>
                </Link>
            </div>

            <section className="purchase-usage-section animate-slide-up" style={{ animationDelay: '0.16s' }}>
                <div className="section-heading purchase-section-heading">
                    <div>
                        <span className="eyebrow">Item Wise Usage</span>
                        <h2>سامان کے حساب سے روزانہ، ہفتہ وار اور ماہانہ خرچ</h2>
                        <p>ہر آئٹم کی مقدار اور رقم خودکار طور پر خریداری کے ریکارڈ سے جمع ہوتی رہے گی۔</p>
                    </div>
                    <Link href="/purchases/new" className="btn-submit purchase-inline-action">
                        نئی خریداری شامل کریں
                    </Link>
                </div>

                <div className="usage-card-grid">
                    {usageCards.map((card) => {
                        const Icon = card.icon;
                        const total = usageSummary.totals[card.key];
                        return (
                            <div key={card.key} className={`usage-total-card ${card.tone}`}>
                                <span className="usage-total-icon">
                                    <Icon size={20} />
                                </span>
                                <div>
                                    <span>{card.title}</span>
                                    <strong>{formatAmount(total.amount)} OMR</strong>
                                    <small>{card.subtitle}</small>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="card purchase-usage-card">
                    <div className="table-container">
                        <table className="data-table usage-table">
                            <thead>
                                <tr>
                                    <th>سامان</th>
                                    <th>تازہ دن</th>
                                    <th>7 دن</th>
                                    <th>14 دن</th>
                                    <th>مہینہ</th>
                                    <th>آخری خرید</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usageSummary.items.length > 0 ? (
                                    usageSummary.items.map((item) => (
                                        <tr key={item.itemId}>
                                            <td>
                                                <div className="usage-item-name">
                                                    <strong>{item.name}</strong>
                                                    <span>{item.category || "دیگر"} · {item.unit}</span>
                                                </div>
                                            </td>
                                            {["day", "week", "twoWeeks", "month"].map((period) => (
                                                <td key={period}>
                                                    <div className="usage-period-cell">
                                                        <strong>{formatAmount(item[period].amount)} OMR</strong>
                                                        <span>{formatQuantity(item[period].quantity)} {item.unit}</span>
                                                    </div>
                                                </td>
                                            ))}
                                            <td style={{ direction: 'ltr', textAlign: 'right' }}>{item.lastDate}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                            ابھی تک item-wise خریداری کا ریکارڈ موجود نہیں۔
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <History size={24} color="var(--primary)" />
                        حالیہ خریداری کی فہرست
                    </h2>
                </div>

                <div className="table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>تاریخ</th>
                                <th>آئٹمز کی تعداد</th>
                                <th>کل رقم (OMR)</th>
                                <th>تفصیلات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? (
                                history.map((entry) => (
                                    <tr key={entry.id}>
                                        <td style={{ direction: 'ltr', textAlign: 'right' }}>{entry.date}</td>
                                        <td>{entry.lines ? entry.lines.length : 0} آئٹمز</td>
                                        <td style={{ fontWeight: 'bold', color: 'var(--danger)' }}>
                                            {formatAmount(entry.lines ? entry.lines.reduce((s, line) => s + line.total_price, 0) : 0)}
                                        </td>
                                        <td>
                                            <div className="purchase-history-lines">
                                                {entry.lines.slice(0, 3).map((line) => (
                                                    <span key={line.id}>
                                                        <Search size={13} />
                                                        {line.item?.name || "آئٹم"}: {formatQuantity(line.quantity)} {line.unit} · {formatAmount(line.total_price)} OMR
                                                    </span>
                                                ))}
                                                {entry.lines.length > 3 && <small>+{entry.lines.length - 3} مزید آئٹمز</small>}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                                        کوئی خریداری کا ریکارڈ نہیں ملا۔
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
