"use client";
import { useState, useEffect } from "react";
import { Settings, Type, Globe, Monitor } from "lucide-react";

export default function SettingsPage() {
    const [language, setLanguage] = useState('ur');
    const [font, setFont] = useState('jameel');
    const [fontSize, setFontSize] = useState('medium');

    const [isClient, setIsClient] = useState(false);

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
                                <span style={{ color: 'var(--danger)', fontSize: '1.5em', fontWeight: 'bold' }}>1,450 OMR</span>
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p style={{ fontSize: '1.25em', fontWeight: 'bold' }}>This is sample text to help you preview the font style.</p>
                            <p>Malik Sajawal Refreshment's modern accounting and purchasing system is built for your convenience.</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                                <strong>Total Purchase:</strong>
                                <span style={{ color: 'var(--danger)', fontSize: '1.5em', fontWeight: 'bold' }}>1,450 OMR</span>
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
