"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Plus, Save, Edit, Trash2 } from "lucide-react";
import { getItems, addItem, updateItem, deleteItem } from "../purchaseActions";

export default function ItemsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({ name: "", category: "", default_unit: "Kg" });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const router = useRouter();

    const units = ["Kg", "Liter", "Pcs", "Box", "Carton", "Gram", "Dozen"];
    const categories = ["سبزیاں", "گوشت", "ڈیری", "خشک راشن", "پیکجنگ", "دیگر"];

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        const data = await getItems();
        setItems(data);
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (isEditing && currentItem) {
            await updateItem(currentItem.id, formData);
        } else {
            await addItem(formData);
        }

        setIsEditing(false);
        setCurrentItem(null);
        setFormData({ name: "", category: "", default_unit: "Kg" });
        await loadItems();
    };

    const editItem = (item) => {
        setCurrentItem(item);
        setFormData({ name: item.name, category: item.category || "", default_unit: item.default_unit || "Kg" });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (confirm("کیا آپ واقعی اس آئٹم کو حذف کرنا چاہتے ہیں؟")) {
            setLoading(true);
            setErrorMsg("");
            const result = await deleteItem(id);
            if (!result.success) {
                setErrorMsg(result.error);
            }
            await loadItems();
        }
    };

    const filteredItems = items.filter(item => {
        const matchName = item.name.includes(searchQuery);
        const matchCat = selectedCategory ? item.category === selectedCategory : true;
        return matchName && matchCat;
    });

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            {errorMsg && (
                <div className="error-message" style={{ margin: '20px 0', position: 'sticky', top: '20px', zIndex: 100 }}>
                    {errorMsg}
                    <button onClick={() => setErrorMsg("")} style={{ float: 'left', background: 'none', border: 'none', color: 'darkred', cursor: 'pointer' }}>✖</button>
                </div>
            )}
            <div className="dashboard-header animate-slide-up">
                <button className="btn-cancel" style={{ width: 'auto', marginBottom: '10px' }} onClick={() => router.push('/purchases')}>&larr; واپس</button>
                <h1 className="dashboard-title"><ShoppingBag style={{ verticalAlign: 'middle', marginLeft: '10px' }} /> آئٹمز، سامان (کموڈیٹیز)</h1>
                <p className="dashboard-subtitle">سامان اور فہرست کی تفصیلات</p>
            </div>

            <div className="card custom-form animate-slide-up" style={{ marginBottom: '30px', animationDelay: '0.1s' }}>
                <h2 className="section-title">نیا سامان شامل کریں</h2>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label className="form-label">نامِ سامان (آئٹم) *</label>
                            <input type="text" className="form-input" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label className="form-label">زمرہ (Category)</label>
                            <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                <option value="">کوئی بھی نہیں</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label className="form-label">بنیادی یونٹ</label>
                            <select className="form-select" value={formData.default_unit} onChange={(e) => setFormData({ ...formData, default_unit: e.target.value })} dir="ltr">
                                {units.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading} style={{ width: 'auto', alignSelf: 'flex-start' }}>
                        {loading ? "..." : (isEditing ? "اپڈیٹ کریں" : "محفوظ کریں")}
                    </button>
                    {isEditing && (
                        <button type="button" className="btn-cancel" style={{ width: 'auto', alignSelf: 'flex-start', marginTop: '0' }} onClick={() => { setIsEditing(false); setFormData({ name: "", category: "", default_unit: "Kg" }); }}>
                            کینسل (Cancel)
                        </button>
                    )}
                </form>
            </div>

            <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <h2 className="section-title" style={{ margin: 0 }}>سامان کی مکمل فہرست</h2>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <select
                            className="form-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{ minWidth: '150px' }}
                        >
                            <option value="">سب کیٹیگریز</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <input
                            type="text"
                            placeholder="آئٹم تلاش کریں..."
                            className="form-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ minWidth: '200px' }}
                        />
                    </div>
                </div>
                <div className="table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>آئٹم</th>
                                <th>زمرہ (Category)</th>
                                <th>یونٹ</th>
                                <th>ایکشن</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="4" style={{ textAlign: 'center' }}>لوڈ ہو رہا ہے...</td></tr> : filteredItems.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center' }}>کوئی آئٹم موجود نہیں۔</td></tr> : filteredItems.map(item => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: 'bold' }}>{item.name}</td>
                                    <td>{item.category || "-"}</td>
                                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{item.default_unit || "Kg"}</td>
                                    <td style={{ display: 'flex', gap: '10px' }}>
                                        <button className="icon-btn" onClick={() => editItem(item)}><Edit size={18} color="var(--primary)" /></button>
                                        <button className="icon-btn" onClick={() => handleDelete(item.id)}><Trash2 size={18} color="var(--danger)" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
