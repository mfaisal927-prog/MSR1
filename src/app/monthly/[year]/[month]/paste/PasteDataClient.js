"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { importPastedData } from "../../../../actions";

export default function PasteDataClient({ year, month }) {
    const router = useRouter();
    const [pastedText, setPastedText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resultData, setResultData] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});

    const handleParseAndValidate = async () => {
        setIsSubmitting(true);
        setResultData(null);
        setErrorMsg(null);
        setExpandedRows({});

        try {
            if (!pastedText.trim()) {
                setErrorMsg("کوئی ڈیٹا موجود نہیں ہے۔ براہ کرم ڈیٹا چسپاں کریں۔");
                setIsSubmitting(false);
                return;
            }

            // Step 1: Validate Only
            const result = await importPastedData(pastedText, false);

            if (result.success) {
                if (result.errorCount === 0 && result.duplicateCount === 0 && result.successCount > 0) {
                    // All solid, Save automatically
                    await importPastedData(pastedText, true);
                    alert(`کامیابی! ${result.successCount} نئی انٹریاں شامل ہو گئیں۔`);
                    router.push(`/monthly/${year}/${month}`);
                } else if (result.totalLinesParsed === 0) {
                    setErrorMsg("کوئی درست ڈیٹا نہیں ملا۔ براہ کرم فارمیٹ چیک کریں۔");
                } else {
                    // Show detailed error panel
                    setResultData(result);
                }
            } else {
                setErrorMsg(result.error);
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("ڈیٹا پارس کرتے وقت غیر متوقع خرابی پیدا ہوئی۔");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveValidAndContinue = async () => {
        setIsSubmitting(true);
        try {
            const result = await importPastedData(pastedText, true);
            if (result.success) {
                alert(`${result.successCount} درست انٹریاں محفوظ کر لی گئیں۔`);
                router.push(`/monthly/${year}/${month}`);
            } else {
                setErrorMsg(result.error);
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("محفوظ کرتے وقت خرابی پیدا ہوئی۔");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkipInvalid = () => {
        // "skip invalid lines and continue" - implies the same action as saving valid ones, or just ignoring.
        // If they want to skip the bad ones, they are choosing to save the good ones and continue. 
        handleSaveValidAndContinue();
    };

    const copyErrorReport = () => {
        if (!resultData) return;
        const textToCopy = resultData.errors.map(e => `Line ${e.lineNumber}: [${e.errorCode}] ${e.messageUrdu}\nRaw: ${e.rawLine}`).join("\n\n");
        navigator.clipboard.writeText(textToCopy);
        alert("ایرر رپورٹ کاپی کر لی گئی۔");
    };

    const downloadErrorReport = () => {
        if (!resultData) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resultData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "error_report.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const toggleRow = (idx) => {
        setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <div className="dashboard-header animate-slide-up">
                <h1 className="dashboard-title">ڈیٹا پیسٹ کریں</h1>
                <p className="dashboard-subtitle">اپنا یومیہ سیلز، خریداری، اور اضافی اخراجات کا ڈیٹا یہاں چسپاں کریں</p>
            </div>

            <div className="card custom-form animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
                    <button
                        className="btn-cancel"
                        style={{ width: 'auto' }}
                        onClick={() => router.push(`/monthly/${year}/${month}`)}
                        type="button"
                    >
                        &larr; واپس ڈیش بورڈ
                    </button>
                </div>

                {errorMsg && (
                    <div className="error-message popup-message" style={{ marginBottom: '1.5rem' }}>
                        {errorMsg}
                    </div>
                )}

                {resultData && (
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', color: '#b91c1c', marginBottom: '1rem', fontWeight: 'bold' }}>امپورٹ میں خرابی — تفصیل</h2>

                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            <div><span style={{ color: 'var(--text-muted)' }}>پڑھی گئی لائنیں:</span> <strong style={{ fontSize: '1.2rem' }}>{resultData.totalLinesParsed}</strong></div>
                            <div><span style={{ color: 'var(--text-muted)' }}>درست (محفوظ ہونے کے لیے تیار):</span> <strong style={{ color: '#10b981', fontSize: '1.2rem' }}>{resultData.successCount}</strong></div>
                            <div><span style={{ color: 'var(--text-muted)' }}>پہلے سے موجود (ڈپلیکیٹ):</span> <strong style={{ color: '#f59e0b', fontSize: '1.2rem' }}>{resultData.duplicateCount}</strong></div>
                            <div><span style={{ color: 'var(--text-muted)' }}>خراب (ایرر):</span> <strong style={{ color: '#ef4444', fontSize: '1.2rem' }}>{resultData.errorCount}</strong></div>
                        </div>

                        {resultData.errors.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {resultData.errors.map((err, idx) => (
                                    <div key={idx} style={{ backgroundColor: 'white', border: '1px solid #fca5a5', borderRadius: '8px', overflow: 'hidden' }}>
                                        <div
                                            onClick={() => toggleRow(idx)}
                                            style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff5f5' }}
                                        >
                                            <div style={{ fontWeight: 'bold', color: '#b91c1c' }}>
                                                لائن #{err.lineNumber} — {err.messageUrdu}
                                            </div>
                                            <div style={{ color: '#ef4444', transform: expandedRows[idx] ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}>▼</div>
                                        </div>
                                        {expandedRows[idx] && (
                                            <div style={{ padding: '1rem', borderTop: '1px solid #fca5a5', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div><strong style={{ color: 'var(--text-muted)' }}>خرابی کی قسم:</strong> <span style={{ fontFamily: 'monospace', color: '#b91c1c' }}>{err.errorCode}</span></div>
                                                <div><strong style={{ color: 'var(--text-muted)' }}>وجہ:</strong> {err.messageUrdu}</div>
                                                <div><strong style={{ color: 'var(--text-muted)' }}>متوقع فارمیٹ:</strong> {err.expectedFormat}</div>
                                                <div>
                                                    <strong style={{ color: 'var(--text-muted)' }}>اصل لائن:</strong>
                                                    <div style={{ backgroundColor: '#f3f4f6', padding: '0.5rem', borderRadius: '4px', fontFamily: 'monospace', direction: 'ltr', textAlign: 'left', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{err.rawLine}</div>
                                                </div>
                                                {err.extractedColumns && (
                                                    <div><strong style={{ color: 'var(--text-muted)' }}>نکالے گئے کالمز:</strong> <span style={{ direction: 'ltr', display: 'inline-block' }}>{JSON.stringify(err.extractedColumns)}</span></div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button className="btn-action" style={{ width: 'auto', backgroundColor: 'transparent', color: '#4b5563', borderColor: '#d1d5db' }} onClick={copyErrorReport}>
                                ایرر رپورٹ کاپی کریں
                            </button>
                            <button className="btn-action" style={{ width: 'auto', backgroundColor: 'transparent', color: '#4b5563', borderColor: '#d1d5db' }} onClick={downloadErrorReport}>
                                ایرر رپورٹ ڈاؤن لوڈ کریں (JSON)
                            </button>
                            {resultData.successCount > 0 && (
                                <>
                                    <button className="btn-submit" style={{ width: 'auto', backgroundColor: '#10b981' }} onClick={handleSaveValidAndContinue} disabled={isSubmitting}>
                                        صرف درست لائنیں محفوظ کریں
                                    </button>
                                    <button className="btn-cancel" style={{ width: 'auto', margin: 0 }} onClick={handleSkipInvalid} disabled={isSubmitting}>
                                        غلط لائنیں چھوڑ دیں
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold' }}>یہاں ڈیٹا چسپاں (Paste) کریں:</label>
                    <textarea
                        className="form-input"
                        rows={15}
                        placeholder={`مثال کے طور پر:\n\nکس مد میں خرچ ہوا | اضافی اخراجات | خریداری | سیل | دن | تاریخ\nViza  100  20  17  جمعرات  1 January 2026\n0   18  ہفتہ  2 January 2026\nTickets  50  20  38  اتوار  3 January 2026`}
                        value={pastedText}
                        onChange={(e) => {
                            setPastedText(e.target.value);
                            setResultData(null); // Clear errors on typing
                        }}
                        style={{ fontFamily: 'monospace', fontSize: '14px', direction: 'ltr', textAlign: 'left' }}
                    />
                    <small className="form-feedback" style={{ display: 'block', marginTop: '10px' }}>
                        نوٹ: کالمز کے درمیان فاصلہ (Space) یا ٹیب (Tab) ہونا ضروری ہے۔
                    </small>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <button
                        className="btn-submit"
                        onClick={handleParseAndValidate}
                        disabled={isSubmitting || !pastedText.trim() || resultData !== null}
                        style={{ opacity: (isSubmitting || !pastedText.trim() || resultData !== null) ? 0.7 : 1 }}
                    >
                        {isSubmitting ? "پارس کیا جا رہا ہے..." : "پارس کریں (Validate)"}
                    </button>
                </div>
            </div>
        </div>
    );
}
