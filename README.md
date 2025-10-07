# Star Academy — To'lov Jurnali

Statik (HTML/CSS/JS) web-ilova. GitHub Pages orqali joylash uchun tayyor.

## Tarkib
- `index.html` — asosiy portfolio sahifa (To'lov Jurnaliga havola bor)
- `payments.html` — to'lov jurnali (IELTS/CEFR/B1-B2/A1-A2 bo'limlari)
- `payments.css`, `payments.js` — stil va mantiq
- `404.html` — GitHub Pages refresh 404 muammosi uchun fallback
- `.nojekyll` — Jekyll buildni o‘chiradi (Pages statik fayllarni to'g'ridan-to'g'ri beradi)
- `.gitignore` — keraksiz fayllarni repo'ga kiritmaslik
- `CNAME` — (ixtiyoriy) custom domen. Agar domen yo'q bo'lsa, bu faylni o'chiring

## GitHub Pages sozlash
1. Repo → Settings → Pages
2. Build and deployment:
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`
3. Save qiling, 1–3 daqiqa kuting. So'ng URL'ni oching:
   - Project Pages: `https://<username>.github.io/<reponame>/`
   - User/Org Pages (repo nomi `<username>.github.io` bo'lsa): `https://<username>.github.io/`

## Nima uchun 404.html?
- Sahifa ichida link/refresh bo'lganda GitHub Pages 404 qaytarishi mumkin. `404.html` foydalanuvchini `index.html`ga qaytaradi.

## Custom domen (CNAME)
- Agar o'zingizning domeningiz bo'lsa, `CNAME` faylida aynan domen nomini yozing (masalan, `school.example.uz`).
- Agar custom domen ishlatmasangiz — `CNAME` faylini o'chiring, aks holda 404 bo'lishi mumkin.

## Lokal ishga tushirish
Fayllarni bevosita brauzerda ochishingiz mumkin (`index.html`). Ba'zi brauzerlarda `localStorage/sessionStorage` ishlashi uchun faylni `http` orqali ochish tavsiya:
- VS Code Live Server yoki oddiy `python -m http.server` (Python o‘rnatilgan bo‘lsa).

## Muammo bormi?
- Pages 404: Settings → Pages sozlamalarini tekshiring, `index.html` root'da borligini aniqlang, CNAME to‘g‘ri ekanini tekshiring, Ctrl+F5 qiling.
- To'lov jurnali ochilmayapti: `payments.html`, `payments.js`, `payments.css` fayllarining ismlari va joylashuvi to‘g‘ri ekanini tekshiring.
