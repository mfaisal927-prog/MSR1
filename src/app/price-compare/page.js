import Link from "next/link";
import { getPriceComparison } from "../purchaseActions";
import { Search, MapPin, TrendingDown, Clock, Info } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function PriceComparePage() {
    const latestPrices = await getPriceComparison();

    // Group items for display
    // Structure: { itemName: [ { storeName, unitPrice, date, unit } ] }
    const categorized = {};

    latestPrices.forEach(line => {
        const iName = line.item ? line.item.name : "Unknown Item";
        if (!categorized[iName]) {
            categorized[iName] = [];
        }

        categorized[iName].push({
            storeName: line.store ? line.store.name : "Unknown Store",
            unitPrice: line.unit_price_per_base_unit || line.unit_price,
            unit: (line.item && line.item.default_unit) ? line.item.default_unit : line.unit,
            date: line.entry ? line.entry.date : "N/A"
        });
    });

    // Sort stores within each item by price ascending (cheapest first)
    for (const key in categorized) {
        categorized[key].sort((a, b) => a.unitPrice - b.unitPrice);
    }

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <div className="dashboard-header animate-slide-up">
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <Link href="/purchases" className="btn-cancel" style={{ textDecoration: 'none', width: 'auto', display: 'flex', alignItems: 'center' }}>&larr; واپس</Link>
                </div>
                <h1 className="dashboard-title"><Search style={{ verticalAlign: 'middle', marginLeft: '10px' }} /> قیمتوں کا موازنہ</h1>
                <p className="dashboard-subtitle">مختلف اسٹورز پر آئٹمز کی تازہ ترین قیمتیں (سب سے سستا پہلے)</p>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {Object.keys(categorized).length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <Info size={40} style={{ marginBottom: '1rem', color: '#cbd5e1' }} />
                        <p>ابھی تک کوئی خریداری کا ریکارڈ موجود نہیں ہے۔ <br />جب آپ ریکارڈ شامل کریں گے تو یہاں قیمتوں کا موازنہ نظر آئے گا۔</p>
                        <Link href="/purchases/new" className="btn-submit" style={{ display: 'inline-block', marginTop: '20px', width: 'auto' }}>
                            پہلی خریداری شامل کریں
                        </Link>
                    </div>
                ) : (
                    Object.entries(categorized).map(([itemName, storePrices], index) => (
                        <div key={index} className="card" style={{ marginBottom: '20px', padding: '20px', borderTop: '4px solid var(--primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
                                    {itemName}
                                </h2>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '20px' }}>
                                    {storePrices.length} اسٹورز کا ریکارڈ
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                                {storePrices.map((sp, idx) => {
                                    const isCheapest = idx === 0 && storePrices.length > 1; // Highlight the cheapest if multiple

                                    return (
                                        <div key={idx} style={{
                                            padding: '15px',
                                            borderRadius: '12px',
                                            border: isCheapest ? '2px solid #10b981' : '1px solid var(--border)',
                                            backgroundColor: isCheapest ? '#ecfdf5' : 'white',
                                            position: 'relative'
                                        }}>
                                            {isCheapest && (
                                                <div style={{ position: 'absolute', top: '-10px', right: '15px', backgroundColor: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <TrendingDown size={14} /> سب سے سستا
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                                                <MapPin size={18} color={isCheapest ? '#10b981' : 'var(--text-muted)'} />
                                                {sp.storeName}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={14} />
                                                    آخری خرید: {sp.date}
                                                </div>
                                                <div style={{ direction: 'ltr', textAlign: 'right' }}>
                                                    <span style={{ fontSize: '1.4rem', fontWeight: '900', color: isCheapest ? '#10b981' : 'var(--danger)' }}>
                                                        {sp.unitPrice.toFixed(2)} OMR
                                                    </span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                                                        / {sp.unit}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
