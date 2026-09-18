"use client";
import { useState, useEffect, useRef } from "react";
import { Database, Download, KeyRound, Settings, Type, Globe, Monitor, Upload } from "lucide-react";
import { changeAdminPassword, exportBackupData, restoreBackupData } from "../actions";

export default function SettingsPage() {
    const [language, setLanguage] = useState('ur');
    const [font, setFont] = useState('jameel');
    const [fontSize, setFontSize] = useState('medium');

    const [isClient, setIsClient] = useState(false);
    const [backupStatus, setBackupStatus] = useState(null);
    const [passwordStatus, setPasswordStatus] = useState(null);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const restoreInputRef = useRef(null);

    useEffect(() => {
        setIsClient(true);
        const savedLang = localStorage.getItem('app_lang') || 'ur';
        setLanguage(savedLang);

        const defaultFont = savedLang === 'en' ? 'inter' : 'jameel';
        setFont(localStorage.getItem('app_font') || defaultFont);

        setFontSize(localStorage.getItem('app_font_size') || 'medium');
    }, []);

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        localStorage.setItem('app_lang', newLang);
        document.documentElement.setAttribute('lang', newLang);
        document.documentElement.setAttribute('dir', newLang === 'en' ? 'ltr' : 'rtl');

        // Auto-switch font based on language
        const fallbackFont = newLang === 'en' ? 'inter' : 'jameel';
        handleFontChange(fallbackFont);
    };

    const handleFontChange = (newFont) => {
        setFont(newFont);
        localStorage.setItem('app_font', newFont);
        document.documentElement.setAttribute('data-font', newFont);
    };

    const handleFontSizeChange = (size) => {
        setFontSize(size);
        localStorage.setItem('app_font_size', size);
        document.documentElement.setAttribute('data-font-size', size);
    };

    const formatBackupFileName = () => {
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        return `malik-sajawal-backup-${stamp}.json`;
    };

    const handleBackupDownload = async () => {
        setIsBackingUp(true);
        setBackupStatus(null);

        try {
            const response = await exportBackupData();

            if (!response.success) {
                setBackupStatus({ type: "error", text: response.error || "Backup نہیں بن سکا۔" });
                return;
            }

            const json = JSON.stringify(response.backup, null, 2);
            const blob = new Blob([json], { type: "application/json;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = formatBackupFileName();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setBackupStatus({ type: "success", text: "Backup file download ہو گئی۔ اسے محفوظ جگہ رکھیں۔" });
        } catch (error) {
            console.error(error);
            setBackupStatus({ type: "error", text: "Backup download کرتے وقت خرابی پیدا ہو گئی۔" });
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleRestoreFile = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsRestoring(true);
        setBackupStatus(null);

        try {
            const text = await file.text();
            const backup = JSON.parse(text);

            const exportedAt = backup.exportedAt ? new Date(backup.exportedAt).toLocaleString() : "نامعلوم وقت";
            const confirmed = window.confirm(
                `یہ restore موجودہ تمام data کو backup file کے data سے replace کر دے گا۔\n\nBackup time: ${exportedAt}\n\nکیا آپ واقعی restore کرنا چاہتے ہیں؟`
            );

            if (!confirmed) {
                setBackupStatus({ type: "error", text: "Restore منسوخ کر دیا گیا۔" });
                return;
            }

            const response = await restoreBackupData(backup);

            if (!response.success) {
                setBackupStatus({ type: "error", text: response.error || "Restore نہیں ہو سکا۔" });
                return;
            }

            setBackupStatus({ type: "success", text: "Backup کامیابی سے restore ہو گیا۔ Page refresh ہو رہا ہے..." });
            setTimeout(() => window.location.reload(), 1200);
        } catch (error) {
            console.error(error);
            setBackupStatus({ type: "error", text: "File درست backup JSON نہیں ہے۔" });
        } finally {
            setIsRestoring(false);
            if (restoreInputRef.current) restoreInputRef.current.value = "";
        }
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();
        setPasswordStatus(null);
        setIsChangingPassword(true);

        try {
            const response = await changeAdminPassword(new FormData(event.currentTarget));

            if (!response.success) {
                setPasswordStatus({ type: "error", text: response.error || "Password تبدیل نہیں ہو سکا۔" });
                return;
            }

            event.currentTarget.reset();
            setPasswordStatus({ type: "success", text: response.message || "Password تبدیل ہو گیا۔" });
        } catch (error) {
            console.error(error);
            setPasswordStatus({ type: "error", text: "Password تبدیل کرتے وقت خرابی پیدا ہو گئی۔" });
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (!isClient) {
        return <div className="container" style={{ paddingBottom: '100px' }}>لوڈ ہو رہا ہے...</div>;
    }

    const isUrdu = language === 'ur';

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <div className="dashboard-header animate-slide-up">
                <h1 className="dashboard-title">
                    <Settings style={{ verticalAlign: 'middle', marginInlineEnd: '10px' }} />
                    {isUrdu ? "فونٹ سیٹنگز" : "Font Settings"}
                </h1>
                <p className="dashboard-subtitle">
                    {isUrdu ? "زبان، تحریر اور سائز کا انتخاب کریں" : "Select language, font family, and size"}
                </p>
            </div>

            <div className="card custom-form animate-slide-up" style={{ animationDelay: '0.1s', maxWidth: '800px', margin: '0 auto' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={20} className="text-primary" /> {isUrdu ? "زبان (Language Mode)" : "Language Mode"}
                </h2>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                    <button
                        onClick={() => handleLanguageChange('ur')}
                        className="btn-action"
                        style={{ flex: 1, justifyContent: 'center', borderColor: language === 'ur' ? 'var(--primary)' : 'var(--border)', backgroundColor: language === 'ur' ? 'rgba(16, 185, 129, 0.05)' : 'var(--card-bg)' }}
                    >
                        اردو (RTL)
                    </button>
                    <button
                        onClick={() => handleLanguageChange('en')}
                        className="btn-action"
                        style={{ flex: 1, justifyContent: 'center', borderColor: language === 'en' ? 'var(--primary)' : 'var(--border)', backgroundColor: language === 'en' ? 'rgba(16, 185, 129, 0.05)' : 'var(--card-bg)' }}
                    >
                        English (LTR)
                    </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginBottom: '30px' }}>

                    {/* FONT SELECTOR */}
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Type size={20} className="text-primary" />
                            {isUrdu ? "اسٹائل کتبہ (Font Family)" : "Font Family"}
                        </h2>
                        {isUrdu ? (
                            <select className="form-select" value={font} onChange={(e) => handleFontChange(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '1.1rem' }}>
                                <option value="jameel">Jameel Noori Nastaleeq (جميل نوری نستعلیق)</option>
                                <option value="noto-nastaliq">Noto Nastaliq Urdu (نوٹو نستعلیق)</option>
                            </select>
                        ) : (
                            <select className="form-select" value={font} onChange={(e) => handleFontChange(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '1.1rem' }}>
                                <option value="inter">Inter (Professional Sans)</option>
                                <option value="poppins">Poppins (Modern Geometric)</option>
                                <option value="roboto">Roboto (Clean Sans)</option>
                            </select>
                        )}
                    </div>

                    {/* FONT SIZE */}
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Monitor size={20} className="text-primary" />
                            {isUrdu ? "سائز (Font Size)" : "Font Size"}
                        </h2>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: language === 'ur' ? 'row-reverse' : 'row', gap: '10px' }}>
                            <button
                                onClick={() => handleFontSizeChange('small')}
                                style={{ flex: 1, padding: '10px', border: `1px solid ${fontSize === 'small' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: fontSize === 'small' ? 'rgba(16,185,129,0.05)' : 'transparent', color: 'var(--text-main)', fontSize: '0.9rem' }}
                            >
                                {isUrdu ? "چھوٹا (Small)" : "Small"}
                            </button>
                            <button
                                onClick={() => handleFontSizeChange('medium')}
                                style={{ flex: 1, padding: '10px', border: `1px solid ${fontSize === 'medium' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: fontSize === 'medium' ? 'rgba(16,185,129,0.05)' : 'transparent', color: 'var(--text-main)', fontSize: '1rem' }}
                            >
                                {isUrdu ? "درمیانہ (Medium)" : "Medium"}
                            </button>
                            <button
                                onClick={() => handleFontSizeChange('large')}
                                style={{ flex: 1, padding: '10px', border: `1px solid ${fontSize === 'large' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: fontSize === 'large' ? 'rgba(16,185,129,0.05)' : 'transparent', color: 'var(--text-main)', fontSize: '1.1rem' }}
                            >
                                {isUrdu ? "بڑا (Large)" : "Large"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* PREVIEW BOX */}
                <div style={{ marginTop: '20px', padding: '30px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px dashed var(--border)', textAlign: language === 'ur' ? 'right' : 'left' }}>
                    <h3 style={{ marginBottom: '15px', color: 'var(--text-muted)', fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                        {isUrdu ? "فونٹ کا نمونہ (Preview)" : "Font Preview"}
                    </h3>

                    {isUrdu ? (
                        <div>
                            <p style={{ fontSize: '1.25em', fontWeight: 'bold' }}>یہ ایک نمونہ متن ہے تاکہ آپ فونٹ کا اندازہ لگا سکیں۔</p>
                            <p>ملک سجاول ریفریشمنٹ کا اکاؤنٹنگ اور خریداری کا جدید نظام آپ کی سہولت کے لیے بنایا گیا ہے۔</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                                <strong>کل خریداری:</strong>
                                <span style={{ color: 'var(--danger)', fontSize: '1.5em', fontWeight: 'bold' }}>1.450 OMR</span>
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p style={{ fontSize: '1.25em', fontWeight: 'bold' }}>This is sample text to help you preview the font style.</p>
                            <p>Malik Sajawal Refreshment's modern accounting and purchasing system is built for your convenience.</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                                <strong>Total Purchase:</strong>
                                <span style={{ color: 'var(--danger)', fontSize: '1.5em', fontWeight: 'bold' }}>1.450 OMR</span>
                            </p>
                        </div>
                    )}
                </div>

            </div>

            <div className="card custom-form animate-slide-up" style={{ animationDelay: '0.13s', maxWidth: '800px', margin: '1.5rem auto 0' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <KeyRound size={20} className="text-primary" /> {isUrdu ? "Login Password" : "Login Password"}
                </h2>

                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {isUrdu
                        ? "Admin login کا password یہاں سے تبدیل کریں۔"
                        : "Change the admin login password here."}
                </p>

                {passwordStatus && (
                    <div
                        className={passwordStatus.type === "success" ? "success-message" : "error-message"}
                        style={{ padding: '0.85rem', marginBottom: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontWeight: 'bold' }}
                    >
                        {passwordStatus.text}
                    </div>
                )}

                <form onSubmit={handlePasswordChange}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="currentPassword">
                            {isUrdu ? "موجودہ پاس ورڈ" : "Current Password"}
                        </label>
                        <input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            className="form-input"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="newPassword">
                            {isUrdu ? "نیا پاس ورڈ" : "New Password"}
                        </label>
                        <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            className="form-input"
                            autoComplete="new-password"
                            minLength={6}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">
                            {isUrdu ? "نیا پاس ورڈ دوبارہ" : "Confirm New Password"}
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            className="form-input"
                            autoComplete="new-password"
                            minLength={6}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={isChangingPassword}>
                        {isChangingPassword ? (isUrdu ? "محفوظ ہو رہا ہے..." : "Saving...") : (isUrdu ? "Password تبدیل کریں" : "Change Password")}
                    </button>
                </form>
            </div>

            <div className="card custom-form animate-slide-up" style={{ animationDelay: '0.15s', maxWidth: '800px', margin: '1.5rem auto 0' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database size={20} className="text-primary" /> {isUrdu ? "Backup / Restore" : "Backup / Restore"}
                </h2>

                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {isUrdu
                        ? "اپنے تمام records، purchases، stores، items، monthly settings اور monthly expenses کا backup محفوظ کریں۔"
                        : "Save a backup of all records, purchases, stores, items, monthly settings, and monthly expenses."}
                </p>

                {backupStatus && (
                    <div
                        className={backupStatus.type === "success" ? "success-message" : "profit-negative"}
                        style={{
                            padding: '0.85rem',
                            marginBottom: '1rem',
                            backgroundColor: backupStatus.type === "success" ? undefined : '#fee2e2',
                            borderRadius: 'var(--radius-sm)',
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}
                    >
                        {backupStatus.text}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <button
                        type="button"
                        className="btn-action"
                        style={{ justifyContent: 'center', minHeight: '56px', borderColor: 'var(--primary)' }}
                        onClick={handleBackupDownload}
                        disabled={isBackingUp || isRestoring}
                    >
                        <Download size={20} />
                        <span>{isBackingUp ? "Backup بن رہا ہے..." : "Backup Download کریں"}</span>
                    </button>

                    <button
                        type="button"
                        className="btn-action"
                        style={{ justifyContent: 'center', minHeight: '56px', borderColor: '#f59e0b' }}
                        onClick={() => restoreInputRef.current?.click()}
                        disabled={isBackingUp || isRestoring}
                    >
                        <Upload size={20} />
                        <span>{isRestoring ? "Restore ہو رہا ہے..." : "Backup Restore کریں"}</span>
                    </button>
                </div>

                <input
                    ref={restoreInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleRestoreFile}
                    style={{ display: 'none' }}
                />

                <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #fbbf24', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#92400e' }}>
                    {isUrdu
                        ? "احتیاط: Restore کرنے سے موجودہ data replace ہو جائے گا۔ Restore سے پہلے نیا backup ضرور download کر لیں۔"
                        : "Warning: Restoring replaces current data. Download a fresh backup before restoring."}
                </div>
            </div>
        </div>
    );
}
