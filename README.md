# NookShop

一個功能完整的全端電商平台，涵蓋消費者購物流程與管理者後台系統。

> [Live Demo](https://nookshop.vercel.app)
> [GitHub Repository](https://github.com/Bruce-159/nextjs-ecommerce-platform)

## 專案簡介

NookShop 是一個以 Next.js 為核心的電商網站作品集專案，從零建構完整的購物體驗：商品瀏覽、會員系統、購物車、金流串接、訂單管理，以及管理者後台儀表板。

### 為什麼做這個專案

- 展示從前端到後端、資料庫到金流的全端開發能力
- 實踐業界常用的技術棧與架構模式
- 作為求職作品集，呈現可投入生產環境的程式碼品質

## 功能一覽

### 消費者端
- 商品瀏覽（列表、分類篩選、詳情頁）
- 會員系統（帳號密碼註冊/登入 + Google OAuth）
- 購物車（即時增刪改、數量調整、Header 數量同步）
- 結帳付款（綠界 ECPay 測試環境信用卡付款）
- 訂單查詢（付款狀態、出貨狀態追蹤）

### 管理者後台
- 銷售儀表板（總營收、訂單數、待處理訂單、近 7 天營收圖表）
- 商品管理（新增 / 編輯 / 刪除）
- 訂單管理（篩選、查看明細、標記出貨）
- 角色權限控制（僅 admin 可存取後台）

## 技術棧

| 類別 | 技術 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 語言 | TypeScript |
| 樣式 | Tailwind CSS |
| 資料庫 | PostgreSQL (Docker) |
| ORM | Prisma |
| 認證 | Auth.js (NextAuth v5) |
| 金流 | 綠界 ECPay (測試環境) |
| 圖表 | Recharts |

## 快速開始

### 前置需求
- Node.js 20.9+
- Docker Desktop

### 安裝步驟

```bash
git clone https://github.com/Bruce-159/nextjs-ecommerce-platform.git
cd nextjs-ecommerce-platform/my-shop
npm install
cp .env.example .env
# 填入 DATABASE_URL、AUTH_SECRET、Google OAuth、ECPay 等金鑰
docker compose up -d
npx prisma migrate dev
npx prisma db seed
npm run dev
```

開啟 http://localhost:3000

### 測試帳號

| 角色 | 操作方式 |
|------|----------|
| 一般使用者 | 在 /register 註冊新帳號 |
| 管理員 | 註冊後執行 `npx tsx prisma/set-admin.ts your-email@example.com` |

### 綠界測試信用卡

| 欄位 | 值 |
|------|-----|
| 卡號 | 4311-9522-2222-2222 |
| 有效期限 | 任意未過期日期 |
| CVV | 222 |

## License

MIT
