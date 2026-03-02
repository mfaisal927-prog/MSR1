import Link from "next/link";
import { getPurchaseHistory } from "../purchaseActions";
import { PlusCircle, ShoppingBag, Store, Search, History } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function PurchasesDashboardPage() {
    const history = await getPurchaseHistory();

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
                                            {entry.lines ? entry.lines.reduce((s, line) => s + line.total_price, 0).toLocaleString() : 0}
                                        </td>
                                        <td>
                                            <button className="icon-btn" title="View details (Not implemented)">
                                                <Search size={18} color="var(--primary)" />
                                            </button>
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
