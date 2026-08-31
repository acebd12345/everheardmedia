# 有所耳聞官網 — 視覺改版實作規格（藍白配・電影感）

> 前提：本資料夾已有一版完整可用的靜態網站（見 SPEC.md，五頁、Google Sheet 後台、lite YouTube embed 都已完成）。
> 本次任務是**純視覺改版**：把定稿設計套到現有五頁上。
> 功能、檔案結構、路徑、sheet.js 行為、SEO meta 全部保留，只動樣式與版面。
> 定稿設計的精確參照：`design-ref/homepage-mockup.html`（首頁 1440px 設計稿原始碼，所有顏色、字級、間距以它為準）。

## 0. 鐵則

1. **文案零改動**：所有中文正文一律沿用現有 HTML 內的文字（即原站文案），禁止改寫、增刪任何一句。裝飾用英文小字（見 §4）是唯一允許新增的文字。
2. **零漸層**：全站不得出現任何 `gradient`。所有色塊、遮罩都是純色平塗。
3. **零 WordPress 殘留**（既有原則，維持）。

## 1. 設計 tokens（全站取代現有 :root）

```css
:root {
  /* 品牌藍系（取自 logo：書法字墨藍 + 筆畫鋼青藍） */
  --c-ink:        #14304a;  /* 白底上的標題、主文字、深色按鈕 */
  --c-body:       #46617a;  /* 白底上的內文 */
  --c-faint:      #7b91a5;  /* 白底上的次要小字 */
  --c-accent:     #3d6b8e;  /* 白底上的品牌藍：連結、分類標籤、編號 */
  --c-accent-lt:  #9cc4e4;  /* 深藍底上的亮藍點綴 */
  --c-deep:       #0c1622;  /* hero 深藍底 */
  --c-deep-cta:   #14304a;  /* CTA 區深藍底 */
  --c-deep-line:  #2c4a66;  /* 深藍底上的分隔線 */
  --c-deep-text:  #c3d2e0;  /* 深藍底上的內文 */
  --c-deep-faint: #8fa5b8;  /* 深藍底上的小字 */
  --c-bg:         #ffffff;
  --c-bg-tint:    #f2f6f9;  /* 淺藍灰區塊底 */
  --c-line:       #e6ebf0;  /* 白底上的分隔線 */
  --c-line-2:     #dde5ec;  /* 淺藍灰底上的分隔線 */
}
```

- 字體維持 Noto Sans TC（300/400/500/700/900）。標題全面加重到 900、字距微縮（letter-spacing -.01em）。
- 深色模式：**不做**（維持上一輪決定，網站固定單一主題）。`theme-color` meta 改為 `#14304a`。

## 2. 首頁（照 design-ref/homepage-mockup.html 逐區實作）

由上到下：

1. **Header（白）**：白底、底部 1px `--c-line`。左側放原色 logo 圖（`logo-original.png`，不反白）。右側導覽維持現有中文項目，最後一項「聯繫我們」做成深藍實心按鈕（`--c-ink` 底白字，radius 2px）。
2. **Hero（深藍 `--c-deep`，高約 700px，影片 banner）**：
   - 背景為**影片**：`<video autoplay muted loop playsinline preload="metadata" poster="/assets/img/home-hero-bg.jpg" src="/assets/video/hero.mp4">`，`object-fit: cover` 滿版。
   - 影片檔尚未提供：HTML 照寫，`assets/video/` 建好資料夾並放 `README.txt`（寫明：放入 hero.mp4，建議 10–20 秒、H.264、1080p、3–5MB，無聲）。`onerror` 或影片不存在時自然顯示 poster 圖，版面不得壞。
   - 手機（<768px）：不載影片，直接顯示 poster 圖（用 `matchMedia` 判斷後才設定 video src，避免流量浪費）。
   - 影片上蓋單色遮罩 `rgba(12,22,34,.68)`（一層、平塗、無漸層）。
   - 內容靠下：眉標「影像製作｜活動紀錄｜品牌影片｜現場轉播」（字距 .4em，`--c-accent-lt`）→ 特大標「用影像，讓品牌被看見」（900、clamp 到桌機約 112px，「被看見」三字 `--c-accent-lt`）→ 原文副標（`--c-deep-text`）→ 右下白色圓形播放鍵＋「SHOWREEL」小字（點擊捲動到精選作品區即可）。
3. **精選作品（白）**：標題「精選作品」＋右側小字「SELECTED WORKS 2022—2023」。三欄 lite-yt 卡片（沿用現有前 3 支、現有點擊播放機制），縮圖 radius 2px，標題 `--c-ink`，分類標籤小字 `--c-accent` 字距 .22em。底下一條 `--c-line` 細線＋置中「VIEW ALL — 10 WORKS」連到 /works/。
4. **服務（淺藍灰 `--c-bg-tint`）**：左欄大標「我們能為你做什麼？」＋原文副標；右欄六列「編號（--c-accent）＋服務名（700, 24px）＋原文描述」列表，列間 1px `--c-line-2`。六項文案照現有 HTML。
5. **合作客戶（白）**：小字標題＋現有 Sheet 驅動邏輯不變；fallback 佔位樣式改成虛線框（`--c-line` dashed）。
6. **CTA（深藍 `--c-deep-cta` 色塊）**：特大白標「準備開始你的影像專案了嗎？」（「影像專案」四字 `--c-accent-lt`），左側原文說明（含「免費諮詢｜快速回覆」），右側白底深藍字按鈕「聯繫我們」。footer 資訊列（公司名／統編／地址／Email）併入此色塊底部，上方 1px `--c-deep-line`。

## 3. 內頁（works / services / about / contact）

套同一套語言，不需要逐頁出新設計，規則：

- Header／Footer 與首頁完全一致（Footer = 深藍色塊資訊列的精簡版）。
- 各頁 page-head 改成**深藍色塊版**：`--c-deep` 底、白色特大標（900）、眉標小字 `--c-accent-lt`（沿用現有 PORTFOLIO / SERVICES / ABOUT / CONTACT 英文眉標）、原文副標 `--c-deep-text`。不放影片，純色塊即可。
- works：篩選按鈕改藍系（未選＝白底 `--c-line` 框 `--c-body` 字；選中＝`--c-ink` 底白字）；分組標題 `--c-ink`＋數量小字 `--c-faint`；卡片同首頁樣式。
- services：六項服務改成首頁同款編號列表（白底版），底部合作客戶區同首頁。
- contact：資訊卡白底 `--c-line` 框、icon 用 `--c-accent`；地圖嵌入維持。
- about：沿用現有文案（含 TODO 佔位），樣式套新 tokens。

## 4. 裝飾英文小字（唯一允許的新增文字）

僅限這些、且只作為視覺點綴（不可取代中文導覽）：
`SHOWREEL`、`SELECTED WORKS 2022—2023`、`VIEW ALL — 10 WORKS`、各頁眉標（PORTFOLIO / SERVICES / ABOUT / CONTACT）。
導覽列維持中文（首頁／影像作品／服務項目／關於我們／聯繫我們）。

## 5. RWD

- 桌機基準 1440；≥1024 照設計稿比例；768–1023 服務列表改上下堆疊；<768 單欄、hero 高度降為約 80vh、特大標 clamp 縮至 40–48px、hero 影片停用（見 §2-2）。
- 三檔（375 / 768 / 1280）都不得出現橫向捲動。

## 6. 驗收清單

- [ ] 全站 CSS `grep -i gradient` 結果為 0
- [ ] 中文正文與改版前 HTML 逐字一致（可 diff 純文字驗證）
- [ ] 首頁六個區塊順序、配色與 design-ref/homepage-mockup.html 一致
- [ ] hero：無 hero.mp4 時顯示 poster 圖不壞版；補上 mp4 後自動循環播放；手機不載影片
- [ ] logo 為原色圖檔（白底上深藍），不再有反白 filter
- [ ] Sheet 驅動（works/clients）、lite-yt 點擊播放、分類篩選功能全部照舊可用
- [ ] sitemap / robots / 各頁 meta 不變，theme-color 更新為 #14304a
- [ ] Lighthouse 四項維持 90+（影片有 preload="metadata"、poster，不拖分）

## 7. 不在本次範圍

- Google Sheet 網址填入（等網站主人提供）
- hero.mp4 素材（等網站主人提供，先走 poster fallback）
- 關於我們正式文案（維持現有 TODO 佔位）
