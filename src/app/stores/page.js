"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, Plus, Save, Edit, Trash2, MapPin, Phone } from "lucide-react";
import { getStores, addStore, updateStore, deleteStore } from "../purchaseActions";

export default function StoresPage() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentStore, setCurrentStore] = useState(null);
    const [formData, setFormData] = useState({ name: "", location: "", phone: "", notes: "" });
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const router = useRouter();

    useEffect(() => {
        loadStores();
    }, []);

    const loadStores = async () => {
        setLoading(true);
        const data = await getStores();
        setStores(data);
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (isEditing && currentStore) {
            await updateStore(currentStore.id, formData);
        } else {
            await addStore(formData);
        }

        setIsEditing(false);
        setCurrentStore(null);
        setFormData({ name: "", location: "", phone: "", notes: "" });
        await loadStores();
    };

    const editStore = (store) => {
        setCurrentStore(store);
        setFormData({ name: store.name, location: store.location || "", phone: store.phone || "", notes: store.notes || "" });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (confirm("کیا آپ واقعی اس اسٹور کو حذف کرنا چاہتے ہیں؟")) {
            setLoading(true);
            setErrorMsg("");
            const result = await deleteStore(id);
            if (!result.success) {
                setErrorMsg(result.error);
            }
            await loadStores();
        }
    };

    const filteredStores = stores.filter(store =>
        store.name.includes(searchQuery) ||
        (store.location && store.location.includes(searchQuery))
    );

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            {errorMsg && (
                <div className="error-message" style={{ margin: '20px 0', position: 'sticky', top: '20px', zIndex: 100 }}>
                    {errorMsg}
                    <button onClick={() => setErrorMsg("")} style={{ float: 'left', background: 'none', border: 'none', color: 'darkred', cursor: 'pointer' }}>✖</button>
                </div>
            )}
            <div className="dashboard-header animate-slide-up">
                <button className="btn-cancel" style={{ width: 'auto', marginBottom: '10px' }} onClick={() => router.push('/purchases')}>&larr; واپس خریداری مینیو</button>
                <h1 className="dashboard-title"><Store style={{ verticalAlign: 'middle', marginLeft: '10px' }} /> اسٹورز اور سپلائرز</h1>
                <p className="dashboard-subtitle">دکانوں اور سپلائرز کی فہرست شامل یا تبدیل کریں</p>
            </div>

            <div className="card custom-form animate-slide-up" style={{ marginBottom: '30px', animationDelay: '0.1s' }}>
                <h2 className="section-title">نیا اسٹور شامل کریں</h2>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
                            <label className="form-label">نام (اسٹور یا بندہ) *</label>
                            <input type="text" className="form-input" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
                            <label className="form-label">لوکیشن (جگہ)</label>
                            <input type="text" className="form-input" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
                            <label className="form-label">فون نمبر</label>
                            <input type="text" className="form-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} direction="ltr" />
                        </div>
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading} style={{ width: 'auto', alignSelf: 'flex-start' }}>
                        {loading ? "..." : (isEditing ? "اپڈیٹ کریں" : "محفوظ کریں")}
                    </button>
                    {isEditing && (
                        <button type="button" className="btn-cancel" style={{ width: 'auto', alignSelf: 'flex-start', marginTop: '0' }} onClick={() => { setIsEditing(false); setFormData({ name: "", location: "", phone: "", notes: "" }); }}>
                            کینسل (Cancel)
                        </button>
                    )}
                </form>
            </div>

            <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <h2 className="section-title" style={{ margin: 0 }}>فہرستِ اسٹورز</h2>
                    <input
                        type="text"
                        placeholder="اسٹور تلاش کریں..."
                        className="form-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ maxWidth: '300px' }}
                    />
                </div>
                <div className="table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>نام</th>
                                <th>لوکیشن</th>
                                <th>فون</th>
                                <th>ایکشن</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="4" style={{ textAlign: 'center' }}>لوڈ ہو رہا ہے...</td></tr> : filteredStores.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center' }}>کوئی اسٹور موجود نہیں۔</td></tr> : filteredStores.map(store => (
                                <tr key={store.id}>
                                    <td style={{ fontWeight: 'bold' }}>{store.name}</td>
                                    <td>{store.location || "-"}</td>
                                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{store.phone || "-"}</td>
                                    <td style={{ display: 'flex', gap: '10px' }}>
                                        <button className="icon-btn" onClick={() => editStore(store)}><Edit size={18} color="var(--primary)" /></button>
                                        <button className="icon-btn" onClick={() => handleDelete(store.id)}><Trash2 size={18} color="var(--danger)" /></button>
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
