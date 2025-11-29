# Peta Titik Evakuasi Bengkulu Utara dan Muko-Muko

Aplikasi web interaktif untuk menampilkan dan mencari titik-titik evakuasi di wilayah sekitaran Bengkulu Utara dan Muko-Muko. Titik evakuasi yang ada di web ini sebanyak 27 titik yang tersebar di daerah Bengkulu Utara dan Muko Muko. Dilengkapi dengan fitur pencarian, penentuan lokasi terdekat, dan informasi detail untuk setiap titik evakuasi.

## 🌍 Deskripsi

Peta Titik Evakuasi Bengkulu adalah platform yang membantu masyarakat menemukan lokasi evakuasi terdekat dengan cepat dan mudah. Aplikasi ini mengintegrasikan peta interaktif dengan daftar titik evakuasi yang dapat dicari dan difilter sesuai kebutuhan.

## ✨ Fitur Utama

### 📍 Peta Interaktif
- **Visualisasi Titik Evakuasi**: Setiap titik ditampilkan sebagai marker kecil pada peta
- **Marker Terpilih**: Marker berubah warna hijau saat dipilih untuk memberikan umpan balik visual
- **Lokasi Pengguna**: Saat menggunakan fitur "Temukan Titik Terdekat", lokasi Anda ditampilkan dengan marker biru dan lingkaran akurasi
- **Layer Peta Berganda**: 
  - Peta Jalan (OpenStreetMap) - default
  - Satellite (Esri)
  - Topografi (OpenTopoMap)
  - Carto (Light)

### 🔍 Pencarian & Filter
- **Search Bar**: Cari titik evakuasi berdasarkan nama desa atau nama lokasi
- **Daftar Titik**: Tampilkan semua titik dalam sidebar dengan koordinat
- **Interaksi Dua Arah**: 
  - Klik item di daftar → peta memusatkan ke titik tersebut, info card muncul
  - Klik marker di peta → info card muncul di atas marker

### 📍 Lokasi Terdekat
- Tombol **"Temukan Titik Terdekat"** menggunakan GPS/Geolocation browser
- Menampilkan:
  - Lokasi pengguna saat ini (marker biru)
  - Lingkaran akurasi GPS
  - Titik evakuasi terdekat (marker hijau terpilih)
  - Info detail di atas marker

### 📋 Info Card Lengkap
Setiap titik evakuasi menampilkan:
- **Nama**: Nama titik evakuasi
- **Alamat**: Alamat lengkap (jika tersedia atau ditelusuri via reverse geocoding)
- **Desa/Kelurahan**: Nama desa/kelurahan
- **Kecamatan**: Nama kecamatan
- **Telepon**: Nomor kontak darurat (clickable untuk panggilan langsung)
- **Koordinat**: Lintang dan bujur (6 desimal)
- **Tombol Google Maps**: Buka petunjuk arah di Google Maps

### 🔄 Reverse Geocoding
- Jika data alamat tidak lengkap di GeoJSON, aplikasi otomatis memanggil Nominatim (OpenStreetMap) untuk mendapatkan:
  - Alamat terdekat
  - Nama desa/kelurahan
  - Kecamatan
- Hasil di-cache sehingga tidak ada permintaan berulang untuk titik yang sama

### 📊 Legenda
Legenda menunjukkan:
- Marker default (titik abu-abu) = Titik evakuasi
- Marker terpilih (titik hijau) = Titik yang sedang dipilih
- Marker pengguna (titik biru) = Lokasi Anda (saat menggunakan fitur terdekat)
- Info untuk mengganti jenis peta

## 🚀 Cara Menggunakan

### 1. Membuka Aplikasi
- Buka file `index.html` di browser web modern (Chrome, Firefox, Edge, Safari)
- Atau serve melalui HTTP server lokal

### 2. Mencari Titik Evakuasi
**Opsi A - Melalui Search Bar:**
- Ketik nama desa atau lokasi di kotak pencarian
- Daftar akan otomatis ter-filter
- Klik item untuk melihat detail di info card

**Opsi B - Melalui Daftar:**
- Gulir daftar di sidebar kiri
- Klik salah satu item → peta memusatkan ke titik tersebut
- Info card muncul di atas marker

**Opsi C - Langsung Klik di Peta:**
- Klik marker manapun di peta
- Info card langsung muncul di atas marker

### 3. Mengganti Jenis Peta
- Lihat kontrol layer di pojok kanan atas
- Pilih salah satu:
  - **Peta Jalan**: Tampilan standard OpenStreetMap
  - **Satellite**: Citra satelit Esri
  - **Topografi**: Peta kontur dan elevation
  - **Carto (Positron)**: Design minimalis CartoDB

### 4. Menemukan Titik Terdekat
- Klik tombol **"Temukan Titik Terdekat"** (hijau)
- Izinkan browser mengakses lokasi Anda
- Aplikasi akan:
  - Menampilkan lokasi Anda (marker biru + lingkaran akurasi)
  - Menemukan titik evakuasi paling dekat
  - Memfokuskan peta ke titik tersebut
  - Menampilkan info card dengan detail

### 5. Melihat Detail Lengkap
- Pada info card, informasi seperti:
  - Nama, alamat, desa, kecamatan, telepon
  - Tombol **"Buka di Google Maps"** untuk petunjuk arah detail

## 📁 Struktur File

```
Map Evakuasi/
├── index.html           # Halaman utama (struktur HTML)
├── style.css            # Styling dan layout
├── script.js            # Logic dan interaksi
├── README.md            # File dokumentasi ini
└── data/
    └── titik_evakuasi.geojson  # Data titik evakuasi (GeoJSON)
```

## 🔧 Teknologi yang Digunakan

- **Leaflet.js**: Library peta interaktif open-source
- **Leaflet Control Geocoder**: Plugin untuk geocoding (optional)
- **OpenStreetMap (OSM)**: Penyedia peta dasar gratis
- **Nominatim**: Reverse geocoding untuk pencarian alamat
- **GeoJSON**: Format data untuk titik evakuasi
- **HTML5 Geolocation API**: Untuk penentuan lokasi pengguna

## 📊 Format Data GeoJSON

Data titik evakuasi tersimpan di `data/titik_evakuasi.geojson` dengan struktur:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Nama Titik Evakuasi",
        "alamat": "Jalan ... No. ...",
        "desa": "Nama Desa",
        "kecamatan": "Nama Kecamatan",
        "telepon": "0821-xxxx-xxxx"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [102.0493, -3.5291]
      }
    }
  ]
}
```

**Properti yang Dikenali:**
- `name` / `nama` / `title`: Nama titik (wajib)
- `address` / `alamat` / `alamat_lengkap`: Alamat
- `desa` / `kelurahan` / `village`: Desa/Kelurahan
- `kecamatan` / `district`: Kecamatan
- `phone` / `telepon` / `telp` / `kontak`: Nomor telepon

## 💡 Tips & Trik

1. **Zoom untuk Detail Lebih**: Gunakan scroll mouse untuk zoom in/out pada area tertentu
2. **Drag Peta**: Klik dan drag peta untuk menggeser tampilan
3. **Mobile Friendly**: Aplikasi responsif dan dapat digunakan di smartphone
4. **Akurasi GPS**: Akurasi lokasi tergantung sinyal GPS perangkat (biasanya 5-50 meter)
5. **Cache Offline**: Setelah dimuat, peta akan di-cache browser sehingga loading lebih cepat

## ⚙️ Persyaratan Browser

- Chrome/Chromium v90+
- Firefox v88+
- Safari v14+
- Edge v90+

Gunakan browser modern dengan dukungan ES6+ dan Fetch API.

## 🌐 Koneksi Internet

Diperlukan koneksi internet untuk:
- Memuat peta tile dari OSM/Esri
- Reverse geocoding (jika ada alamat kosong)
- Layer peta alternatif

## 🐛 Troubleshooting

### Marker tidak muncul
- Pastikan file `data/titik_evakuasi.geojson` tersedia dan valid
- Periksa console browser (F12) untuk error

### Info card kosong
- Jika alamat kosong, aplikasi akan mencoba reverse geocoding (tunggu beberapa detik)
- Periksa koneksi internet

### "Temukan Titik Terdekat" tidak bekerja
- Izinkan browser mengakses lokasi (pastikan prompt permission muncul)
- Gunakan HTTPS (beberapa browser memerlukan HTTPS untuk Geolocation)
- Cek GPS/Location perangkat aktif

### Peta lambat
- Reduce zoom level atau gunakan layer "Carto (Positron)" yang lebih ringan
- Clear browser cache dan refresh halaman

## 📝 Catatan Pengembang

### Menambah Titik Evakuasi
Edit file `data/titik_evakuasi.geojson` dan tambahkan feature baru:

```json
{
  "type": "Feature",
  "properties": {
    "name": "Nama Baru",
    "alamat": "Alamat",
    "desa": "Desa",
    "kecamatan": "Kecamatan",
    "telepon": "0821-xxx"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  }
}
```

### Mengubah Tema Warna
Edit variabel CSS di `:root` dalam `style.css`:
```css
:root{
  --accent: #38A169;        /* Warna tema utama (hijau) */
  --accent-light: #9AE6B4;  /* Warna hover */
  --text: #12372A;          /* Warna teks */
  --bg: #e9f5ee;            /* Warna background */
}
```

### Menambah Layer Peta
Di `script.js`, tambahkan layer baru dalam blok "Base Tiles":
```javascript
const newLayer = L.tileLayer('url_tile_layer', {
  maxZoom: 19,
  attribution: 'Credit'
});

baseMaps['Label'] = newLayer;
```

## 📞 Support

Untuk pertanyaan atau masalah:
- Periksa console browser (F12) untuk error messages
- Pastikan semua file ada di folder yang benar
- Gunakan HTTP/HTTPS server (jangan buka file langsung dengan file://)

## 📄 Lisensi

- **Leaflet.js**: BSD 2-Clause (open-source)
- **OpenStreetMap**: ODbL (Open Data Commons)
- **Data Titik Evakuasi**: Sesuai kebijakan lokal

## 🎯 Roadmap Fitur Masa Depan

- [ ] Export data ke CSV/PDF
- [ ] Sidebar kategori titik (Masjid, Sekolah, Lapangan, dll)
- [ ] Rute navigasi step-by-step
- [ ] Offline map support
- [ ] Multi-bahasa (Indonesia/English)
- [ ] Share lokasi via QR code
- [ ] Filter by kapasitas/fasilitas
- [ ] Real-time update status evakuasi

---
**Last Updated**: November 2025  
**Made with ❤️ for Safety**

