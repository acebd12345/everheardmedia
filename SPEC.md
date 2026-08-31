# 有所耳聞有限公司 — 靜態網站重建規格

> 目標：將 https://everheardmedia.com/ （WordPress + Elementor）整個重刻為純靜態網站。
> 文案固定寫死在 HTML；「作品集」與「合作客戶」由 Google Sheet 當後台動態載入。
> 本文件自成一體，所有文案與素材資訊都在下方，不需要再爬原站。

---

## 1. 技術選型

- **純 HTML + CSS + Vanilla JS**，不用框架、不用打包工具（npm/vite 都不要）。
  理由：全站僅 5 頁，內容固定，零建置流程 = 零維護成本。
- 共用樣式放 `assets/css/style.css`，共用 JS 放 `assets/js/`。
- Header / Footer 每頁重複寫即可（僅 5 頁，不值得引入模板引擎）；或用一個小的 JS include，二選一，以簡單為準。
- RWD 必須：手機（375px）、平板（768px）、桌機（1280px+）三檔都要正常。
- 語言：`lang="zh-Hant"`，全站繁體中文。
- 部署目標：Cloudflare Pages（或 Netlify / GitHub Pages，擇一，靜態檔案直接丟上去即可）。

## 2. 檔案結構

```
/
├── index.html          # 首頁
├── works/index.html    # 影像作品
├── services/index.html # 服務項目
├── about/index.html    # 關於我們
├── contact/index.html  # 聯繫我們
├── assets/
│   ├── css/style.css
│   ├── js/sheet.js     # Google Sheet 抓取與渲染
│   └── img/            # logo、hero 圖等
├── SPEC.md
└── README.md           # 給網站主人看的維護說明（如何改 Sheet、如何改文案）
```

保留與原站相同的路徑（`/works/`、`/services/`、`/about/`、`/contact/`），換站後舊連結與 SEO 不會斷。

## 3. Google Sheet 後台（核心需求）

### 運作方式
1. 建一份 Google Sheet，內含兩個工作表（tab）：`works` 與 `clients`。
2. Sheet 透過「檔案 → 共用 → 發布到網路」發布為 CSV。每個 tab 有獨立的發布網址，格式：
   `https://docs.google.com/spreadsheets/d/e/<PUB_ID>/pub?gid=<GID>&single=true&output=csv`
3. 網頁載入時由 `assets/js/sheet.js` fetch 該 CSV、解析、渲染進頁面。
   - CSV 解析要能處理含逗號的欄位（引號包裹），自己寫個 30 行內的 parser 即可，不用引入函式庫。
   - 發布網址以常數放在 `sheet.js` 開頭，附註解說明如何替換。
4. **Fallback**：fetch 失敗（斷網、Google 掛掉、尚未設定網址）時，頁面顯示 HTML 內建的預設內容（把目前已知的作品清單直接寫在 HTML 裡當 fallback，JS 成功抓到資料才覆蓋）。絕不能出現空白區塊或壞版面。

### `works` 工作表欄位
| 欄位 | 說明 | 範例 |
|---|---|---|
| category | 分類名稱 | 活動紀錄｜精華影片 |
| title | 作品標題 | 2025 品牌發表會精華 |
| youtube | YouTube 網址或影片 ID | https://youtu.be/dMENKQu6ULI |
| order | 排序（數字小的在前，可空） | 1 |
| show | TRUE / FALSE，FALSE 則不顯示 | TRUE |

- 作品頁依 `category` 分組渲染，同分類聚成一個區塊，分類順序依 Sheet 中首次出現的順序。
- YouTube 欄位要能接受完整網址（youtu.be / youtube.com/watch）或純 ID，JS 自行解析出 ID。
- 影片一律用 **點擊才載入** 的 lite embed（先顯示縮圖 `https://i.ytimg.com/vi/<ID>/hqdefault.jpg` + 播放鍵，點擊後才換成 iframe）。原站一次載入 20 個 YouTube iframe，非常慢，這是重建的主要效能改善點。

### `clients` 工作表欄位
| 欄位 | 說明 |
|---|---|
| name | 客戶／品牌名稱 |
| logo | logo 圖片網址（可空，空則只顯示文字） |
| show | TRUE / FALSE |

- 渲染在首頁「合作客戶」區與服務頁底部。

### 交付時
- 附上一份 `sheet-template.csv`（或在 README 寫清楚欄位），讓網站主人照格式建 Sheet。
- README 要有一步一步的圖文說明：如何發布 CSV、如何把網址填進 `sheet.js`、加一列作品後多久生效（重新整理即生效）。

## 4. 頁面內容（文案固定，照抄以下）

全站共用資訊：
- 公司名稱：有所耳聞有限公司
- 英文網域名：everheardmedia.com
- 統編：93548882
- 電話：+886(0)978221878
- Email：everheard.info@gmail.com
- 地址：高雄市新興區民生一路56號22樓之3
- Footer 文案：「我們專注於影像創作與品牌內容製作，提供活動紀錄、商業廣告、婚禮紀錄與現場轉播服務，讓影像成為品牌最有力的溝通工具。」
- Copyright © 2026 有所耳聞有限公司

導覽列（全頁共用）：首頁｜影像作品｜服務項目｜關於我們｜聯繫我們

### 4.1 首頁 `/`
1. **Hero 區**
   - 眉標：影像製作｜活動紀錄｜品牌影片｜現場轉播
   - 主標：用影像，讓品牌被看見
   - 副標：專注於活動紀錄、品牌影片與商業拍攝，從企劃到後製，打造具影響力的影像內容。
   - CTA 按鈕：連到 /contact/
2. **服務簡介區**
   - 標題：我們能為你做什麼？
   - 副文：從企劃到拍攝與後製，提供完整影像製作服務，協助品牌有效傳達訊息與提升曝光。
   - 六張服務卡（見 4.3 服務項目文案），每卡連到 /services/
3. **作品集預覽區**
   - 標題：作品集
   - 副文：精選影像作品，涵蓋活動紀錄、品牌影片與商業拍攝，呈現我們對畫面與細節的專業。
   - 從 Sheet 取前 3–6 支作品展示，按鈕「查看更多作品」連到 /works/
4. **合作客戶區**（Sheet 驅動）
   - 標題：合作客戶
   - 副文：感謝各品牌與單位的信任與合作，共同完成多項影像製作與活動紀錄。歡迎成為我們下一個合作夥伴。
5. **CTA 區**
   - 標題：準備開始你的影像專案了嗎？
   - 副文：告訴我們你的需求，我們將提供合適的拍攝方案與報價。
   - 強調語：免費諮詢｜快速回覆
   - 按鈕連到 /contact/

### 4.2 影像作品 `/works/`（Sheet 驅動）
- 已知分類（作為 fallback 與 Sheet 初始資料）：
  - 活動紀錄｜精華影片
  - 商業廣告｜形象影片
  - 幕後花絮｜側拍紀錄
  - 活動紀錄｜平面攝影
  - 節目製作｜開箱影片
- 原站已確認的真實影片 ID（可放進 fallback / sheet 範本；原站另有大量重複的佔位影片 `XHOmBV4js_E`，**不要**帶過來）：
  `dMENKQu6ULI, ou5ptAIDbtE, m8h8rqpJ28Q, VvTkXhi_m-E, JHBkHTiIDLQ, 4UgpgbEPfh0, NAoqdrumFTY, lBK8xAOb_j4, qPK2P9W1kuY, n97OT6ePyVU`
  （原站未標各影片所屬分類與標題，先均分或全放「精選作品」，等網站主人在 Sheet 補正。）
- 可加簡單的分類篩選（全部／各分類 tab），純 JS 顯示切換即可。

### 4.3 服務項目 `/services/`
六項服務（也用於首頁卡片）：
1. **活動紀錄** — 專業記錄企業活動、講座、發表會等重要時刻，完整保留現場氛圍與關鍵內容。
2. **商業廣告** — 打造品牌形象影片與廣告內容，提升品牌質感與市場競爭力。
3. **形象影片** — 透過故事與畫面設計，建立品牌專業與信任感。
4. **婚禮紀錄** — 以影像記錄每個重要瞬間，保留最真實動人的回憶。
5. **現場轉播** — 提供多機拍攝與即時切換，適用於大型活動與會議直播。
6. **線上直播** — 支援各大平台直播，讓活動不受地點限制，觸及更多觀眾。

頁尾加合作客戶區（Sheet 驅動）：
- 標題：合作客戶
- 副文：感謝各品牌與單位的信任與合作，共同完成多項影像製作與活動紀錄。歷年合作品牌持續增加中，歡迎成為我們下一個合作夥伴。

### 4.4 關於我們 `/about/`
> 原站此頁實際上是空的（只有 footer），需要新寫。先用以下佔位文案，標註 TODO 待網站主人補：

- 標題：關於有所耳聞
- 內文（佔位）：有所耳聞有限公司是位於高雄的影像製作團隊，專注於活動紀錄、品牌影片與商業拍攝。我們相信每個品牌都有值得被聽見、被看見的故事——從企劃、拍攝到後製，我們以專業與細節，讓影像成為品牌最有力的溝通工具。
- 可加：服務理念三點（專業設備／完整流程／快速交件 之類），標 TODO。

### 4.5 聯繫我們 `/contact/`
- 標題：聯絡我們
- 聯絡方式：地址／Email／電話（見全站共用資訊），每項配 icon。
- Email 用 `mailto:`、電話用 `tel:+886978221878` 連結。
- 加一顆「加 LINE / 來信諮詢」風格的 CTA（實際只放 mailto，LINE 標 TODO 待提供）。
- 可嵌 Google Maps（用免 API key 的 iframe embed 指向地址），lazy load。
- **不做表單**（原站也沒有；未來要表單再接 Formspree）。

## 5. 設計方向

- 延續原站調性：極簡、大量留白、黑白灰為主色，中文無襯線（system font stack：`"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif`，可用 Google Fonts 載 Noto Sans TC）。
- Hero 大標粗體、眉標用「｜」分隔的細字，比照原站。
- 作品卡：16:9 縮圖、圓角、hover 微浮起。
- 深色模式可做可不做；若做，用 `prefers-color-scheme`，做完整不要做半套。
- 圖片素材：原站圖在 `wp-content/uploads/`，可下載沿用；hero 圖若不便取得，用純色/漸層背景替代並標 TODO。

## 6. SEO 與品質要求

- 每頁獨立 `<title>` 與 `<meta name="description">`（title 比照原站格式：`頁名 – 有所耳聞有限公司`）。
- Open Graph 標籤（og:title / og:description / og:image）。
- `sitemap.xml` 與 `robots.txt`。
- 結構化資料：首頁加 `LocalBusiness` JSON-LD（名稱、地址、電話、Email）。
- Lighthouse 目標：Performance / SEO / Best Practices / Accessibility 皆 90+（作品頁靠 lite YouTube embed 達成）。
- 所有圖片要有 `alt`、`loading="lazy"`（hero 除外）。

## 7. 驗收清單

- [ ] 5 頁齊全，路徑與原站一致，導覽列每頁可互通
- [ ] 手機/平板/桌機三檔版面正常
- [ ] Google Sheet 改一列 → 重新整理網頁即反映（works 與 clients 皆是）
- [ ] Sheet 網址未設定或 fetch 失敗時，頁面顯示 fallback 內容、無壞版
- [ ] YouTube 影片點擊才載入 iframe
- [ ] 無任何 WordPress / Elementor / LatePoint 殘留資源
- [ ] sitemap.xml、robots.txt、各頁 meta 齊全
- [ ] README.md 寫清楚：Sheet 維護方式、發布 CSV 步驟、改文案要動哪個檔、部署方式

## 8. 後續（不在本次範圍，README 提一下即可）

- 網域 DNS 從原主機切到 Cloudflare Pages
- 若未來需要線上預約：嵌 Calendly／SimplyBook 之類服務
- 若未來需要聯絡表單：接 Formspree（免費額度夠用）
