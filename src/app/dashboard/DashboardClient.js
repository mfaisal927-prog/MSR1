"use client";
import { useRouter } from "next/navigation";
import { CalendarDays, TrendingUp, TrendingDown } from "lucide-react";

export default function DashboardClient({ sixMonthsData }) {
    const router = useRouter();

    const navigateTo = (path) => {
        router.push(path);
    };

    const monthLabels = {
        1: "جنوری", 2: "فروری", 3: "مارچ", 4: "اپریل",
        5: "مئی", 6: "جون", 7: "جولائی", 8: "اگست",
        9: "ستمبر", 10: "اکتوبر", 11: "نومبر", 12: "دسمبر",
    };

    return (
        <div className="container">
            <div className="dashboard-header animate-slide-up">
                <h1 className="dashboard-title">ڈیش بورڈ</h1>
                <p className="dashboard-subtitle">آج کا خلاصہ</p>
            </div>

            <div className="dashboard-content animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="summary-grid">
                    <div className="summary-card">
                        <div className="card-title">آج کی سیل</div>
                        <div className="card-value">
                            <span className="card-currency">OMR</span>
                            150.00
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="card-title">آج کی خریداری</div>
                        <div className="card-value">
                            <span className="card-currency">OMR</span>
                            85.50
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="card-title">آج کے اخراجات</div>
                        <div className="card-value">
                            <span className="card-currency">OMR</span>
                            12.00
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="card-title">آج کی بچت / منافع</div>
                        <div className="card-value profit-positive">
                            <span className="card-currency">OMR</span>
                            52.50
                        </div>
                    </div>
                </div>

                {/* NEW COMPONENT: Last 6 Months Summary */}
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)', paddingRight: '0.25rem', marginTop: '2rem' }}>
                    پچھلے مہینوں کا خلاصہ
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '3rem'
                }}>
                    {sixMonthsData.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)' }}>کوئی ریکارڈ موجود نہیں ہے۔</div>
                    ) : (
                        sixMonthsData.map((data, index) => {
                            const isPositive = data._sum.profit_total >= 0;
                            const bgColor = isPositive ? '#ecfdf5' : '#fef2f2';
                            const monthStr = String(data.month).padStart(2, '0');

                            return (
                                <div
                                    key={index}
                                    className="card monthly-summary-card"
                                    onClick={() => navigateTo(`/monthly/${data.year}/${monthStr}`)}
                                    style={{
                                        backgroundColor: isPositive ? 'var(--bg-positive)' : 'var(--bg-negative)',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        position: 'relative',
                                        border: '1px solid var(--border)',
                                        animation: `slideUp 0.3s ease-out ${(index + 1) * 0.1}s forwards`,
                                        opacity: 0
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    }}
                                >
                                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}>
                                        <CalendarDays size={20} color="var(--primary)" />
                                        {monthLabels[data.month]} {data.year}
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '1rem', fontWeight: '500' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>سیل:</span>
                                            <span style={{ color: '#3b82f6', direction: 'ltr' }}>{data._sum.sale_total.toFixed(2)} OMR</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>خریداری:</span>
                                            <span style={{ color: '#f97316', direction: 'ltr' }}>{data._sum.purchase_total.toFixed(2)} OMR</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>اخراجات:</span>
                                            <span style={{ color: '#ef4444', direction: 'ltr' }}>{data._sum.expense_total.toFixed(2)} OMR</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', fontWeight: 'bold' }}>
                                            <span style={{ color: 'var(--text-main)' }}>منافع:</span>
                                            <span style={{ color: isPositive ? '#10b981' : '#ef4444', direction: 'ltr', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                {data._sum.profit_total.toFixed(2)} OMR
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar (bottom edge) */}
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '6px', backgroundColor: 'rgba(0,0,0,0.05)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: '100%', backgroundColor: isPositive ? '#10b981' : '#ef4444', opacity: 0.8 }} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)', paddingRight: '0.25rem' }}>
                    فوری روابط
                </h2>

                <div className="actions-section">
                    <button className="btn-action" onClick={() => navigateTo('/daily-entry')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="icon-circle">+</div>
                            <span>نئی انٹری کریں</span>
                        </div>
                    </button>

                    <button className="btn-action" onClick={() => navigateTo('/records')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="icon-circle">📋</div>
                            <span>تمام ریکارڈ دیکھیں</span>
                        </div>
                    </button>

                    <button className="btn-action" onClick={() => navigateTo('/daily')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="icon-circle">📅</div>
                            <span>مخصوص تاریخ کا ریکارڈ</span>
                        </div>
                    </button>

                    <button className="btn-action" onClick={() => navigateTo('/monthly')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="icon-circle">🗓️</div>
                            <span>ماہانہ حساب</span>
                        </div>
                    </button>

                    <button className="btn-action" onClick={() => navigateTo('/reports')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="icon-circle">📊</div>
                            <span>رپورٹس</span>
                        </div>
                    </button>

                    <button className="btn-action" style={{ borderColor: '#fca5a5', color: '#ef4444' }} onClick={() => navigateTo('/')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="icon-circle" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>🚪</div>
                            <span>لاگ آؤٹ</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
