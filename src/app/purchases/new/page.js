"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Plus, Save, Trash2, ShoppingCart, Info } from "lucide-react";
import { getItems, getStores, addPurchaseEntry, getItemPriceIntelligence, addStore, addItem } from "../../purchaseActions";

export default function NewPurchasePage() {
    const router = useRouter();
    const today = new Date().toLocaleDateString('en-CA');

    const [date, setDate] = useState(today);
    const [notes, setNotes] = useState("");

    const [itemsList, setItemsList] = useState([]);
    const [storesList, setStoresList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [lines, setLines] = useState([
        { id: Date.now(), itemId: "", itemName: "", storeId: "", quantity: 1, unit: "Kg", unit_price: 0, total_price: 0 }
    ]);
    const [priceIntelligence, setPriceIntelligence] = useState({});

    // Modal state for adding a new store on the fly
    const [showStoreModal, setShowStoreModal] = useState(false);
    const [newStoreData, setNewStoreData] = useState({ name: "", location: "", phone: "" });
    const [addingStore, setAddingStore] = useState(false);
    const [pendingStoreLineId, setPendingStoreLineId] = useState(null);

    // Modal state for adding a new item on the fly
    const [showItemModal, setShowItemModal] = useState(false);
    const [newItemData, setNewItemData] = useState({ name: "", category: "", default_unit: "Kg" });
    const [addingItem, setAddingItem] = useState(false);
    const [pendingItemLineId, setPendingItemLineId] = useState(null);

    const itemCategories = ["سبزیاں", "گوشت", "ڈیری", "خشک راشن", "پیکجنگ", "دیگر"];
    const itemUnits = ["Kg", "Liter", "Pcs", "Box", "Carton", "Gram", "Dozen"];

    useEffect(() => {
        const fetchData = async () => {
            const i = await getItems();
            const s = await getStores();
            setItemsList(i);
            setStoresList(s);
            setLoading(false);
        };
        fetchData();
    }, []);

    const updateLine = async (id, field, value) => {
        let fetchIntelFor = null;

        setLines(currentLines => currentLines.map(line => {
            if (line.id === id) {
                const updated = { ...line, [field]: value };

                if (field === 'quantity' || field === 'unit_price') {
                    const q = parseFloat(updated.quantity) || 0;
                    const p = parseFloat(updated.unit_price) || 0;
                    updated.total_price = parseFloat((q * p).toFixed(3));
                }

                if (field === 'itemName') {
                    const item = itemsList.find(x => x.name === value);
                    if (item) {
                        updated.itemId = item.id.toString();
                        if (item.default_unit) updated.unit = item.default_unit;
                        fetchIntelFor = { itemId: item.id.toString(), lineId: id };
                    } else {
                        updated.itemId = "";
                    }
                }

                if (field === 'itemId') {
                    const item = itemsList.find(x => x.id.toString() === value);
                    if (item) {
                        updated.itemName = item.name;
                        if (item.default_unit) updated.unit = item.default_unit;
                    }
                    if (value) fetchIntelFor = { itemId: value, lineId: id };
                }

                return updated;
            }
            return line;
        }));

        if (fetchIntelFor) {
            const intel = await getItemPriceIntelligence(fetchIntelFor.itemId);
            setPriceIntelligence(prev => ({ ...prev, [fetchIntelFor.lineId]: intel }));
        }
    };

    const addLine = () => {
        setLines([...lines, { id: Date.now(), itemId: "", itemName: "", storeId: "", quantity: 1, unit: "Kg", unit_price: 0, total_price: 0 }]);
    };

    const removeLine = (id) => {
        if (lines.length === 1) return;
        setLines(lines.filter(l => l.id !== id));
    };

    const handleAddStoreSubmit = async (e) => {
        e.preventDefault();
        setAddingStore(true);
        const res = await addStore(newStoreData);
        if (res.success) {
            setStoresList(prev => [...prev, res.store].sort((a, b) => a.name.localeCompare(b.name)));
            if (pendingStoreLineId) {
                updateLine(pendingStoreLineId, 'storeId', res.store.id.toString());
            }
            setShowStoreModal(false);
            setNewStoreData({ name: "", location: "", phone: "" });
            setPendingStoreLineId(null);
        } else {
            alert(res.error);
        }
        setAddingStore(false);
    };

    const handleAddItemSubmit = async (e) => {
        e.preventDefault();
        setAddingItem(true);
        const res = await addItem(newItemData);
        if (res.success) {
            setItemsList(prev => [...prev, res.item].sort((a, b) => a.name.localeCompare(b.name)));
            if (pendingItemLineId) {
                setLines(currentLines => currentLines.map(line => {
                    if (line.id === pendingItemLineId) {
                        return { ...line, itemId: res.item.id.toString(), itemName: res.item.name, unit: res.item.default_unit || "Kg" };
                    }
                    return line;
                }));
            }
            setShowItemModal(false);
            setNewItemData({ name: "", category: "", default_unit: "Kg" });
            setPendingItemLineId(null);
        } else {
            alert(res.error);
        }
        setAddingItem(false);
    };

    const calculateGrandTotal = () => {
        return lines.reduce((sum, line) => sum + (parseFloat(line.total_price) || 0), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!date) {
            setErrorMsg("تاریخ لازمی ہے");
            return;
        }

        // Validate lines
        const validLines = [];
        for (const line of lines) {
            if (!line.itemId || !line.storeId || line.quantity <= 0 || line.unit_price <= 0) {
                setErrorMsg("براہ کرم تمام آئٹمز کے لیے اسٹور، مقدار، اور قیمت درج کریں (صفر نہیں ہونی چاہیے)۔");
                return;
            }
            validLines.push(line);
        }

        setIsSubmitting(true);
        const result = await addPurchaseEntry(date, notes, validLines);

        if (result.success) {
            alert("خریداری محفوظ ہوگئی ✓");
            router.push('/purchases');
        } else {
            setErrorMsg(result.error);
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="container"><p>لوڈ ہو رہا ہے...</p></div>;

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <div className="dashboard-header animate-slide-up">
                <button className="btn-cancel" style={{ width: 'auto', marginBottom: '10px' }} onClick={() => router.push('/purchases')}>&larr; واپس</button>
                <h1 className="dashboard-title"><ShoppingCart style={{ verticalAlign: 'middle', marginLeft: '10px' }} /> آج کی خریداری درج کریں</h1>
                <p className="dashboard-subtitle">اسٹور اور آئٹم وار خریداری کا اندراج کریں</p>
            </div>

            <div className="card custom-form animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <form onSubmit={handleSubmit}>

                    {errorMsg && <div className="error-message" style={{ marginBottom: '15px' }}>{errorMsg}</div>}

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label className="form-label">تاریخ *</label>
                            <input type="date" className="form-input" required value={date} onChange={e => setDate(e.target.value)} style={{ direction: 'ltr' }} />
                        </div>
                        <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
                            <label className="form-label">نوٹس (اختیاری)</label>
                            <input type="text" className="form-input" placeholder="آج کی خریداری کے حوالے سے کوئی خاص بات..." value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>
                    </div>

                    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-main)' }}>سامان شامل کریں</h3>
                            <button type="button" className="btn-cancel" onClick={addLine} style={{ margin: 0, width: 'auto', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <PlusCircle size={16} /> مزید آئٹم
                            </button>
                        </div>

                        {/* DESKTOP TABLE FORMAT */}
                        <div className="table-container" style={{ overflowX: 'visible' }}>
                            <table className="custom-table" style={{ minWidth: '800px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '20%' }}>آئٹم</th>
                                        <th style={{ width: '20%' }}>اسٹور / دکان</th>
                                        <th style={{ width: '12%' }}>مقدار</th>
                                        <th style={{ width: '12%' }}>یونٹ</th>
                                        <th style={{ width: '15%' }}>فی یونٹ قیمت</th>
                                        <th style={{ width: '15%' }}>کل (OMR)</th>
                                        <th style={{ width: '5%' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map((line, index) => {
                                        const intel = priceIntelligence[line.id];
                                        let storeHint = null;
                                        let lowestHint = null;
                                        let priceChangeBadge = null;

                                        if (intel && line.storeId) {
                                            const storeData = intel.lastByStore[line.storeId];
                                            if (storeData) {
                                                storeHint = `پچھلی بار یہاں سے: ${storeData.price} OMR (${storeData.date})`;

                                                // Calculate if current price is higher or lower
                                                const currentPrice = parseFloat(line.unit_price) || 0;
                                                // Assuming unit matches baseUnit for simplicity here. Exact conversion happens on backend.
                                                if (currentPrice > 0) {
                                                    const diff = currentPrice - storeData.price;
                                                    const pct = (diff / storeData.price) * 100;
                                                    if (pct > 5) {
                                                        priceChangeBadge = <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>مہنگا 🔺</span>;
                                                    } else if (pct < -5) {
                                                        priceChangeBadge = <span style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>سستا 🔻</span>;
                                                    }
                                                }
                                            }
                                        }

                                        if (intel && intel.lowestRecentPrice) {
                                            lowestHint = `سب سے سستا: ${intel.lowestRecentPrice} OMR / ${intel.baseUnit}`;
                                        }

                                        return (
                                            <tr key={line.id} style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ verticalAlign: 'top', paddingTop: '10px' }}>
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <input
                                                            type="text"
                                                            list="items-list"
                                                            className="form-input"
                                                            placeholder="تلاش کریں..."
                                                            value={line.itemName}
                                                            onChange={e => updateLine(line.id, 'itemName', e.target.value)}
                                                            required
                                                            style={{ padding: '8px', flex: 1 }}
                                                        />
                                                        <datalist id="items-list">
                                                            {itemsList.map(i => <option key={i.id} value={i.name} />)}
                                                        </datalist>
                                                        <button
                                                            type="button"
                                                            className="btn-submit"
                                                            style={{ padding: '0 8px', width: 'auto', backgroundColor: 'var(--primary)', border: 'none' }}
                                                            onClick={() => { setPendingItemLineId(line.id); setShowItemModal(true); }}
                                                            title="نیا آئٹم"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                    {lowestHint && <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px' }}>{lowestHint}</div>}
                                                </td>
                                                <td style={{ verticalAlign: 'top', paddingTop: '10px' }}>
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <select className="form-select" value={line.storeId} onChange={e => updateLine(line.id, 'storeId', e.target.value)} required style={{ padding: '8px', flex: 1 }}>
                                                            <option value="">منتخب کریں...</option>
                                                            {storesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                        </select>
                                                        <button
                                                            type="button"
                                                            className="btn-submit"
                                                            style={{ padding: '0 8px', width: 'auto', backgroundColor: 'var(--primary)', border: 'none' }}
                                                            onClick={() => { setPendingStoreLineId(line.id); setShowStoreModal(true); }}
                                                            title="نیا اسٹور"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                    {storeHint && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{storeHint}</div>}
                                                </td>
                                                <td style={{ verticalAlign: 'top', paddingTop: '10px' }}>
                                                    <input type="number" step="0.01" min="0" className="form-input" value={line.quantity} onChange={e => updateLine(line.id, 'quantity', e.target.value)} required style={{ direction: 'ltr', padding: '8px' }} />
                                                </td>
                                                <td style={{ verticalAlign: 'top', paddingTop: '10px' }}>
                                                    <select className="form-select" value={line.unit} onChange={e => updateLine(line.id, 'unit', e.target.value)} dir="ltr" style={{ padding: '8px' }}>
                                                        <option value="Kg">Kg</option>
                                                        <option value="Liter">Liter</option>
                                                        <option value="Pcs">Pcs</option>
                                                        <option value="Box">Box</option>
                                                        <option value="Carton">Carton</option>
                                                        <option value="Gram">Gram</option>
                                                        <option value="Dozen">Dozen</option>
                                                    </select>
                                                </td>
                                                <td style={{ verticalAlign: 'top', paddingTop: '10px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <input type="number" step="0.001" min="0" className="form-input" value={line.unit_price} onChange={e => updateLine(line.id, 'unit_price', e.target.value)} required style={{ direction: 'ltr', padding: '8px' }} />
                                                        {priceChangeBadge}
                                                    </div>
                                                </td>
                                                <td style={{ verticalAlign: 'top', paddingTop: '10px' }}>
                                                    <input type="number" step="0.001" className="form-input" value={line.total_price} readOnly style={{ direction: 'ltr', backgroundColor: '#f3f4f6', fontWeight: 'bold', padding: '8px' }} />
                                                </td>
                                                <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '10px' }}>
                                                    <button type="button" className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => removeLine(line.id)} disabled={lines.length === 1}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ paddingBottom: '80px' }}>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', backgroundColor: '#eff6ff', padding: '10px', borderRadius: '8px' }}>
                            <Info size={16} color="#3b82f6" style={{ marginTop: '2px' }} />
                            <span>اس اندراج کی کل رقم آج کے ڈیلی ریکارڈ (Daily Entry) کی <strong>خریداری (Purchase)</strong> میں خودکار طور پر جمع ہو جائے گی۔</span>
                        </div>
                    </div>

                    {/* Sticky Bottom Bar */}
                    <div style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'var(--card-bg)',
                        borderTop: '1px solid var(--border)',
                        padding: '15px 30px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 -4px 10px rgba(0,0,0,0.05)',
                        zIndex: 50
                    }}>
                        <div style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong style={{ marginLeft: '10px' }}>کل خریداری:</strong>
                            <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--danger)', direction: 'ltr', display: 'inline-block' }}>
                                {calculateGrandTotal().toLocaleString()} OMR
                            </span>
                        </div>
                        <button type="submit" className="btn-submit" disabled={isSubmitting} style={{ width: 'auto', padding: '12px 40px', fontSize: '1.1rem', borderRadius: '30px' }}>
                            {isSubmitting ? "محفوظ کیا جا رہا ہے..." : "محفوظ کریں (Save)"}
                        </button>
                    </div>

                </form>
            </div>
            {showStoreModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, direction: 'rtl' }}>
                    <div className="card animate-slide-up" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 className="section-title">نیا اسٹور شامل کریں</h3>
                        <form onSubmit={handleAddStoreSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="form-group">
                                <label className="form-label">دکان کا نام *</label>
                                <input type="text" className="form-input" required value={newStoreData.name} onChange={e => setNewStoreData({ ...newStoreData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">لوکیشن</label>
                                <input type="text" className="form-input" value={newStoreData.location} onChange={e => setNewStoreData({ ...newStoreData, location: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">فون نمبر</label>
                                <input type="text" className="form-input" value={newStoreData.phone} onChange={e => setNewStoreData({ ...newStoreData, phone: e.target.value })} style={{ direction: 'ltr' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" className="btn-cancel" onClick={() => setShowStoreModal(false)} style={{ width: 'auto' }}>کینسل</button>
                                <button type="submit" className="btn-submit" disabled={addingStore} style={{ width: 'auto', padding: '10px 20px' }}>
                                    {addingStore ? "..." : "+ شامل کریں"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showItemModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, direction: 'rtl' }}>
                    <div className="card animate-slide-up" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 className="section-title">نیا سامان شامل کریں</h3>
                        <form onSubmit={handleAddItemSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="form-group">
                                <label className="form-label">آئٹم کا نام *</label>
                                <input type="text" className="form-input" required value={newItemData.name} onChange={e => setNewItemData({ ...newItemData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">زمرہ (Category)</label>
                                <select className="form-select" value={newItemData.category} onChange={e => setNewItemData({ ...newItemData, category: e.target.value })}>
                                    <option value="">منتخب کریں...</option>
                                    {itemCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">بنیادی یونٹ</label>
                                <select className="form-select" value={newItemData.default_unit} onChange={e => setNewItemData({ ...newItemData, default_unit: e.target.value })} dir="ltr">
                                    {itemUnits.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" className="btn-cancel" onClick={() => setShowItemModal(false)} style={{ width: 'auto' }}>کینسل</button>
                                <button type="submit" className="btn-submit" disabled={addingItem} style={{ width: 'auto', padding: '10px 20px' }}>
                                    {addingItem ? "..." : "+ شامل کریں"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
