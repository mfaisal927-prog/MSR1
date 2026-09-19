# MSR Accounting Mobile App

یہ folder Malik Sajawal Refreshment Accounting website کو Android app میں package کرنے کے لیے ہے۔

Current production URL:

```text
https://msr-liart.vercel.app
```

## How Updates Work

App live website کو load کرتی ہے، اس لیے website پر push/deploy ہونے والی changes Android app میں بھی آتی رہیں گی۔ Play Store update صرف تب چاہیے ہوگا جب native Android settings, icon, package name, permissions, یا version change کیا جائے۔

## Quick Start

```bash
cd mobile-app
npm install
copy .env.example .env
npm run sync
npm run android
```

اگر `.env` نہ بھی ہو تو app default live URL استعمال کرے گی:

```env
APP_URL=https://msr-liart.vercel.app
```

## Build AAB for Play Store

Android Studio install کریں، project کھولیں:

```bash
cd mobile-app
npm run android
```

Android Studio میں:

```text
Build > Generate Signed Bundle / APK > Android App Bundle
```

Release upload کے لیے signed `.aab` file بنائیں۔

## Required Local Tools

- Java JDK 17
- Android Studio
- Android SDK / platform tools
- Play Console developer account

## Package ID

```text
com.maliksajawal.refreshment
```

Package ID publish ہونے کے بعد change نہ کریں، warna Play Store اسے نئی app samjhega.

## Before Play Store Release

- Play Console app name: `MSR Accounting`
- App category: Business / Finance
- Privacy policy URL add کریں
- App icon and screenshots upload کریں
- Data safety form fill کریں
- Test track میں app install کرکے login/dashboard/purchases verify کریں
