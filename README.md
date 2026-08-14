# 私人健身教練網站

專業簡約風格的健身教練訓練管理系統。使用 Next.js 14（App Router）+ Supabase 打造，可直接部署在 Vercel。

## 功能

- 帳號登入 / 註冊（Supabase Auth，Email + 密碼）
- 年 / 月 / 週目標設定，含量化指標追蹤（例如「槓鈴臥推達 45KG」）與非量化檢核目標（例如「熟悉肌肉位置」）
- 訓練項目資料庫（動作、肌群、分類、預設組數/次數）
- 訓練行事曆：點選日期填寫當天訓練項目（器材或動作）與內容（重量或次數）
- 身體指標紀錄：體重、體脂、內臟脂肪、肌肉量，含趨勢折線圖
- Dashboard 總覽：統計卡片 + 身體指標趨勢圖 + 訓練頻率長條圖 + 目標進度條
- 一鍵匯入附件 Excel 中萃取好的初始訓練庫與目標範本

所有資料表皆啟用 Row Level Security，使用者只能存取自己的資料，未來也可以讓多位學員共用同一個部署。

---

## 一、建立 Supabase 專案

1. 前往 [supabase.com](https://supabase.com) 建立新專案，記下 **Project URL** 與 **anon public key**（Settings > API）。
2. 進入 **SQL Editor**，貼上並執行 `supabase/schema.sql` 的完整內容，建立資料表、觸發器與 RLS 政策。
3. （建議）前往 **Authentication > Providers > Email**，若不想要求信箱驗證，可將 "Confirm email" 關閉，方便測試時直接登入。
4. （選用）若要修改網域或增加 OAuth 登入方式，可在 Authentication > URL Configuration 設定 Redirect URLs。

## 二、本機開發

```bash
npm install
cp .env.example .env.local
# 編輯 .env.local，填入 Supabase Project URL 與 anon key
npm run dev
```

開啟 http://localhost:3000，會自動導向登入頁。第一次使用請先「建立帳號」註冊，登入後在 Dashboard 頁面點擊「匯入 Excel 範例資料」，即可帶入教練規劃好的訓練庫與目標。

## 三、部署到 Vercel

1. 將整個專案推送到 GitHub / GitLab 儲存庫。
2. 到 [vercel.com](https://vercel.com) 選擇 **Add New Project**，匯入該儲存庫。
3. 在 Environment Variables 設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 點擊 Deploy，完成後即可用網址存取。
5. 若 Supabase 有設定 Auth Redirect URL 限制，記得把 Vercel 網域加入允許清單（Authentication > URL Configuration > Site URL / Redirect URLs）。

## 四、資料表結構總覽

| 資料表 | 說明 |
| --- | --- |
| `profiles` | 使用者暱稱，註冊時自動建立 |
| `goals` | 年 / 月 / 週目標，`is_checklist=false` 時為量化目標（含 target/current/unit），`true` 時為檢核型目標 |
| `exercises` | 訓練項目庫（動作、肌群、分類、預設組數次數） |
| `training_logs` | 每日訓練紀錄，對應行事曆上的一筆輸入 |
| `body_metrics` | 每日身體指標（體重/體脂/內臟脂肪/肌肉量），同一天重複輸入會覆蓋 |

## 五、專案結構

```
src/
  app/
    login/               登入註冊頁
    (app)/               需登入才能瀏覽的頁面（共用側邊欄/頂部列 layout）
      dashboard/         總覽儀表板
      goals/             目標設定
      exercises/         訓練項目
      calendar/          訓練行事曆
      metrics/           身體指標
  components/            UI 元件（含 charts/ 圖表元件）
  lib/
    supabase/            Supabase client（browser / server / middleware）
    actions/             Server Actions（登入、目標、訓練項目、行事曆、指標、匯入範例資料 CRUD）
    seedData.ts          從附件 Excel 萃取的初始資料
  types/database.types.ts  資料表型別定義
supabase/schema.sql       資料庫建置 SQL（資料表 + RLS）
```

## 六、後續可擴充方向

- 教練端多學員管理（新增 `role` 欄位並開放教練檢視多位學員資料）
- 訓練組數細節（目前 sets/reps 為單一欄位，可拆成逐組紀錄的子表）
- 圖片/影片動作示範上傳（Supabase Storage）
- 提醒通知（Email / LINE Notify）
