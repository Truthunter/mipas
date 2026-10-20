# Website MIPAS

Website pembelajaran untuk **MIPAS Channel** (youtube.com/@mipaschannel). Responsif untuk desktop dan HP.

## Isi folder
| File | Fungsi |
|---|---|
| `index.html` | Halaman utama |
| `styles.css` | Tampilan |
| `app.js` | Logika (filter, pencarian, pemutar video) |
| `config.js` | **Pengaturan yang bisa diedit**: nama guru, teks tentang, WhatsApp, mata pelajaran |
| `api/videos.js` | Mengambil video terbaru dari YouTube secara otomatis (jalan di Vercel) |
| `data/videos.json` | Daftar video tambahan manual (opsional) |

## Cara upload ke Vercel
**Opsi A — lewat GitHub (disarankan, gampang update):**
1. Buat repository baru di GitHub, upload semua isi folder ini.
2. Buka vercel.com → *Add New… → Project* → pilih repository tadi.
3. Framework Preset: **Other**. Tidak perlu build command. Klik **Deploy**.
4. Setiap ada perubahan file di GitHub, Vercel otomatis update.

**Opsi B — lewat terminal:**
```
npm i -g vercel
cd mipas-web
vercel --prod
```

## Cara kerja video
- Video **terbaru (±15 video)** diambil otomatis dari YouTube lewat `/api/videos`, diperbarui tiap 1 jam. Upload video baru di YouTube = otomatis muncul di website.
- Video dikelompokkan otomatis ke IPA / Matematika / IPS / PKn dan kelas berdasarkan **judul video** (mis. "Kelajuan dan Kecepatan | IPA Kelas 8"). Jadi sebaiknya judul video selalu menyebut mapel dan kelas.
- Tombol **Putar semua video** memutar seluruh isi channel (termasuk video lama).
- Ingin video lama tetap tampil di grid? Tambahkan ke `data/videos.json`:
```json
{
  "videos": [
    { "id": "KODE_VIDEO", "title": "Judul video | IPA Kelas 8", "published": "2025-08-01" }
  ]
}
```
`KODE_VIDEO` = kode setelah `watch?v=` di link YouTube.

## Catatan
Kalau `index.html` dibuka langsung dari komputer (tanpa Vercel), daftar video otomatis belum muncul karena `/api/videos` hanya berjalan di Vercel. Untuk mencoba lokal: `vercel dev`.
