# Setup: Verifikasi Krunker Otomatis via GitHub Actions

Sistemnya: user klik "Verify Account" → Supabase Edge Function `verify-krunker-account`
nge-trigger 1x run GitHub Actions → Actions buka profil Krunker user itu pakai
headless Chrome beneran → cek apakah kodenya ada → lapor balik ke Supabase lewat
function baru `krunker-verification-callback` → status jadi "verified" otomatis
kalau ketemu.

## Bagian A — Database

1. Buka Supabase Dashboard → SQL Editor.
2. Copy-paste isi `sql/add_krunker_automated_check.sql` → Run.

## Bagian B — Generate 1 secret rahasia (buat "password" antara GitHub ↔ Supabase)

Bikin string acak panjang, misal lewat browser console: `crypto.randomUUID() + crypto.randomUUID()`,
atau situs generator password. Simpan — ini dipakai di DUA tempat di bawah (harus SAMA PERSIS).
Sebut aja ini `<CALLBACK_SECRET>`.

## Bagian C — Bikin GitHub Personal Access Token

1. GitHub → foto profil kamu (kanan atas) → **Settings** → scroll ke bawah kiri →
   **Developer settings** → **Personal access tokens** → **Fine-grained tokens** →
   **Generate new token**.
2. **Repository access**: pilih "Only select repositories" → pilih repo situs kamu
   (yang isinya `.github/workflows/` nanti).
3. **Permissions** → **Repository permissions** → cari **Actions** → set ke
   **Read and write**.
4. Generate → **copy tokennya sekarang juga** (cuma keliatan sekali). Sebut ini `<GH_TOKEN>`.

## Bagian D — Supabase Edge Function Secrets (tambahan, di Edge Functions → Secrets)

Tambahin 3 secret baru (selain yang udah ada dari setup sebelumnya):

| Name | Value |
|---|---|
| `KRUNKER_GH_TOKEN` | `<GH_TOKEN>` dari Bagian C |
| `KRUNKER_GH_REPO` | `namaakun/namarepo` — contoh: `krunkerresourcehub/krh-main` |
| `KRUNKER_CALLBACK_SECRET` | `<CALLBACK_SECRET>` dari Bagian B |

## Bagian E — GitHub Repo Secrets

Di repo GitHub yang sama (yang di-Bagian C tadi) → **Settings** → **Secrets and
variables** → **Actions** → **New repository secret**, tambahin 2:

| Name | Value |
|---|---|
| `KRUNKER_CALLBACK_URL` | `https://yqvtlbrwhjkyfogokwqd.supabase.co/functions/v1/krunker-verification-callback` |
| `KRUNKER_CALLBACK_SECRET` | `<CALLBACK_SECRET>` — SAMA PERSIS kayak Bagian D |

## Bagian F — Commit file ke repo

Upload/commit 2 file ini ke repo (posisi foldernya harus persis, karena workflow
manggil `scripts/verify-krunker-check.mjs`):

```
.github/workflows/verify-krunker.yml
scripts/verify-krunker-check.mjs
```

Paling gampang: buka repo di github.com → **Add file** → **Create new file** →
ketik path lengkapnya (misal `.github/workflows/verify-krunker.yml`) di kotak nama
file → paste isinya → Commit. Ulangi buat file ke-2.

## Bagian G — Deploy 2 Edge Function

1. **Update `verify-krunker-account`**: buka function yang udah ada di Supabase
   dashboard → replace semua isinya dengan `supabase_functions/verify-krunker-account.ts`
   yang baru → Deploy.
2. **Bikin function baru `krunker-verification-callback`**: "Deploy a new function" →
   nama persis `krunker-verification-callback` → paste isi
   `supabase_functions/krunker-verification-callback.ts` → **PENTING**: sebelum
   Deploy, cari opsi **"Enforce JWT Verification" / "Verify JWT"** dan **matikan**
   (uncheck) — function ini dipanggil GitHub Actions, bukan user login, jadi gak
   ada token Supabase sama sekali. Kalau opsi ini nyala, request dari GitHub bakal
   ditolak duluan sebelum sempat masuk ke kode.

## Bagian H — Tes

1. Di situs kamu, Connect Krunker Account → post kode di Social Feed → klik
   **Verify Account**.
2. Harusnya muncul pesan "Checking your Krunker Social Feed now...".
3. Buka repo GitHub → tab **Actions** → harusnya ada 1 run baru "Verify Krunker
   Account" lagi jalan (~30-60 detik).
4. Kalau run-nya **sukses** dan kode ketemu → refresh halaman Account Settings →
   status harusnya udah **Verified**.
5. Kalau run-nya **gagal / gak ketemu padahal kode udah di-post** → buka run itu
   di tab Actions → scroll ke bawah → ada **artifact** `krunker-debug-...` (screenshot
   halaman yang beneran ke-load). Dari situ kita bisa tau apa URL-nya salah, atau
   feed-nya butuh cara lain buat dibuka (misal harus klik tab tertentu dulu) —
   kirim ke gw screenshot-nya, gw bantu sesuaikan `PROFILE_URL_TEMPLATE` di
   `scripts/verify-krunker-check.mjs`.

## Catatan

- Kalau secret di Bagian D belum di-set (males dulu / mau nunda), function lama
  tetep jalan normal — otomatis fallback ke pesan "pending" seperti sebelumnya,
  gak error.
- Biaya: $0. GitHub Actions gratis buat repo public (dan 2.000 menit/bulan gratis
  kalau repo private), Supabase Edge Functions yang dipakai juga masih dalam free tier.
