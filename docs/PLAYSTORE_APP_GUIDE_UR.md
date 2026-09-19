# Malik Sajawal Refreshment Play Store Guide

Website ab PWA-ready hai, aur `mobile-app` folder Android app wrapper ke liye ready kiya gaya hai.

Live website:

```text
https://msr-liart.vercel.app
```

## Recommended Flow

1. Website ko Vercel par deploy rakhein
2. Mobile wrapper ko live URL par sync karein
3. Android Studio se signed `AAB` build karein
4. Google Play Console testing track par upload karein
5. Testing ke baad production release submit karein

## Important

Website updates automatically app ke andar reflect hoti rahengi, kyunki app live website load karti hai. Play Store update sirf native Android changes ke liye chahiye hota hai.

## Mobile App Commands

```bash
cd mobile-app
npm install
npm run sync
npm run android
```

## Build Signed AAB

Android Studio mein:

```text
Build > Generate Signed Bundle / APK > Android App Bundle
```

Required tools:

- Java JDK 17
- Android Studio
- Android SDK
- Play Console account

## Current Android Details

```text
App name: MSR Accounting
Package ID: com.maliksajawal.refreshment
URL: https://msr-liart.vercel.app
Target SDK: 35
```

## Play Store Ke Liye Zaroori Cheezen

- signed `AAB` file
- app name
- short description
- full description
- app icon
- feature graphic
- screenshots
- privacy policy URL
- contact email
- data safety form

## TWA Note

Google ka recommended PWA-to-Play approach Trusted Web Activity/Bubblewrap hai. Is computer par Java JDK missing hai, isliye Bubblewrap build yahan complete nahi hua. Agar JDK 17 install ho jaye, TWA version bhi generate ki ja sakti hai.

References:

- https://developers.google.com/codelabs/pwa-in-play
- https://developers.google.com/web/updates/2019/08/twas-quickstart

## Final Test Before Upload

- App install karke login test karein
- Dashboard open karein
- Daily entry save karein
- Purchase import test karein
- Reports/monthly pages check karein
- Logout/login check karein
