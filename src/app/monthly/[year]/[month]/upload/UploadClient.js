"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { importCsvEntries } from "../../../../actions";

export default function UploadClient({ year, month }) {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [overwrite, setOverwrite] = useState(false);
    const [fileName, setFileName] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setMessage(null); // Clear errors on new file select
        } else {
            setFileName("");
        }
    }

    const handleCsvUpload = async () => {
        const file = fileInputRef.current?.files[0];
        if (!file) {
            setMessage({ type: "error", text: "براہ کرم پہلے ایک فائل منتخب کریں" });
            return;
        }

        setIsUploading(true);
        setMessage(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

                if (lines.length === 0) {
                    throw new Error("فائل خالی ہے");
                }

                // Check headers
                const headers = lines[0].toLowerCase().split(',');
                if (!headers.includes("date") || !headers.includes("purchase") || !headers.includes("sale")) {
                    throw new Error("فائل کا فارمیٹ درست نہیں۔ درست فارمیٹ: Date,Day,Purchase,Sale");
                }

                const entries = [];
                for (let i = 1; i < lines.length; i++) {
                    const columns = lines[i].split(',');
                    // Mapping columns based on expected index. 
                    // Date: 0, Day: 1, Purchase: 2, Sale: 3
                    const dateVal = columns[0]?.trim();
                    const purchaseVal = parseFloat(columns[2]) || 0;
                    const saleVal = parseFloat(columns[3]) || 0;

                    if (!dateVal) continue;

                    let entryDate;
                    try {
                        entryDate = new Date(dateVal);
                        if (isNaN(entryDate.getTime())) throw new Error("Invalid date");
                    } catch (dErr) {
                        continue; // skip invalid dates
                    }

                    const entryYear = entryDate.getFullYear();
                    const entryMonth = entryDate.getMonth() + 1;
                    const profitVal = saleVal - purchaseVal;

                    entries.push({
                        date: dateVal,
                        year: entryYear,
                        month: entryMonth,
                        sale_total: saleVal,
                        purchase_total: purchaseVal,
                        expense_total: 0,
                        profit_total: profitVal
                    });
                }

                if (entries.length === 0) {
                    throw new Error("کوئی درست انٹری نہیں ملی");
                }

                const response = await importCsvEntries(entries, overwrite);
                if (response.success) {
                    setMessage({ type: "success", text: "ڈیٹا کامیابی سے اپلوڈ ہوگیا ✓" });
                    setTimeout(() => {
                        setMessage(null);
                        router.push(`/monthly/${year}/${month}`);
                    }, 2000);
                } else {
                    throw new Error(response.error || "اپلوڈ میں مسئلہ ہوا");
                }

            } catch (error) {
                setMessage({ type: "error", text: error.message });
            } finally {
                setIsUploading(false);
                // Reset file input
                if (fileInputRef.current) fileInputRef.current.value = "";
                setFileName("");
            }
        };
        reader.onerror = () => {
            setMessage({ type: "error", text: "فائل پڑھنے میں مسئلہ ہوا" });
            setIsUploading(false);
        };
        reader.readAsText(file);
    };

    return (
        <div className="container">
            <div className="dashboard-header animate-slide-up">
                <h1 className="dashboard-title">CSV فائل اپلوڈ کریں</h1>
                <p className="dashboard-subtitle">اپنا ڈیٹا فائل کے ذریعے ایک ساتھ محفوظ کریں</p>
            </div>

            <div className="dashboard-content animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
                    <button
                        className="btn-cancel"
                        style={{ width: 'auto' }}
                        onClick={() => router.push(`/monthly/${year}/${month}`)}
                        disabled={isUploading}
                    >
                        &larr; واپس جائیں
                    </button>
                </div>

                {message && (
                    <div className={message.type === 'success' ? 'success-message' : 'profit-negative'} style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: message.type === 'error' ? '#fee2e2' : undefined, borderRadius: 'var(--radius-sm)', textAlign: 'center', fontWeight: 'bold' }}>
                        {message.text}
                    </div>
                )}

                <div className="entry-form">
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <strong>ضروری فارمیٹ برائے CSV:</strong>
                        <p style={{ marginTop: '0.5rem', marginBottom: 0, direction: 'ltr', textAlign: 'left', fontWeight: 'bold', fontFamily: 'monospace' }}>
                            Date,Day,Purchase,Sale
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ marginBottom: '1rem' }}>فائل منتخب کریں</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                                type="button"
                                className="btn-cancel"
                                style={{ width: 'auto', flex: 1, borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                انتخاب کریں 📁
                            </button>
                            <input
                                type="file"
                                accept=".csv"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                        {fileName && (
                            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
                                منتخب فائل: <span style={{ direction: 'ltr', display: 'inline-block' }}>{fileName}</span>
                            </p>
                        )}
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', padding: '0.5rem 0' }}>
                        <input
                            type="checkbox"
                            id="overwrite"
                            checked={overwrite}
                            onChange={(e) => setOverwrite(e.target.checked)}
                            style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                            disabled={isUploading}
                        />
                        <label htmlFor="overwrite" style={{ margin: 0, cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>
                            پہلے سے موجود ڈیٹا کو تبدیل کریں (Overwrite)
                        </label>
                    </div>

                    <div className="form-actions" style={{ marginTop: '2rem' }}>
                        <button
                            type="button"
                            className="btn-save"
                            onClick={handleCsvUpload}
                            disabled={isUploading || !fileName}
                        >
                            {isUploading ? "اپلوڈ ہو رہا ہے..." : "اپلوڈ کریں"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
