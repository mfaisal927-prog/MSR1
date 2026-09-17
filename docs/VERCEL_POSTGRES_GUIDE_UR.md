# Vercel / PostgreSQL Deployment Guide

یہ app local development میں SQLite استعمال کرتی ہے، اور Vercel production کے لیے PostgreSQL schema تیار کیا گیا ہے۔

## 1. Local data کا backup

Vercel پر جانے سے پہلے app میں:

1. `Settings` کھولیں۔
2. `Backup Download کریں` پر click کریں۔
3. JSON backup file محفوظ رکھیں۔

## 2. PostgreSQL database بنائیں

Vercel Storage, Neon, Supabase یا کسی بھی PostgreSQL provider میں database بنائیں، پھر connection string لیں۔

Connection string عموماً ایسی ہو گی:

```bash
postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

## 3. Vercel environment variables

Vercel project settings میں یہ variables add کریں:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
AUTH_SECRET="long-random-secret"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-strong-first-password"
```

`AUTH_SECRET` لمبا random text رکھیں۔ `ADMIN_PASSWORD` default نہ رکھیں۔

## 4. Vercel build command

Vercel میں Build Command یہ رکھیں:

```bash
npm run build:vercel
```

یہ command PostgreSQL Prisma schema سے client generate کرے گی اور پھر Next.js build چلائے گی۔

## 5. PostgreSQL tables create کرنا

Vercel deploy سے پہلے یا Vercel CLI/terminal سے یہ command چلائیں:

```bash
npm run db:push:postgres
```

یہ command `prisma/schema.postgres.prisma` کے مطابق PostgreSQL database میں tables بنا دے گی۔

## 6. Production میں data restore

Deploy کے بعد:

1. Production site کھولیں۔
2. `ADMIN_USERNAME` اور `ADMIN_PASSWORD` سے login کریں۔
3. `Settings` میں جائیں۔
4. `Backup Restore کریں` سے local backup JSON restore کر دیں۔

نوٹ: Backup/Restore app data restore کرے گا، login admin user کو replace نہیں کرے گا۔

## Local commands

Local SQLite کے لیے:

```bash
npm run db:push
npm run db:generate
npm run dev
```

PostgreSQL کے لیے:

```bash
npm run db:push:postgres
npm run build:vercel
```
