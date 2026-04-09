# 🚀 ChatApp-SpringBoot

## 🛠️ Tech Stack
* **Framework:** Spring Boot (Java)
* **Database:** PostgreSQL
* **Containerization:** Docker & Docker Compose
* **Build Tool:** Maven
* **API Testing Tools:** Bruno / Postman

## ⚙️ Persiapan & Instalasi
Ikuti langkah-langkah di bawah ini untuk menjalankan environment.

### 1. Kloning Repositori
```bash
git clone https://github.com/hrry6/ChatApp-SpringBoot.git
cd ChatApp-SpringBoot
```

### 2. Konfigurasi Database (Docker)
*PASTIKAN* Docker sudah berjalan sebelum memulai Spring Boot. Jalankan container database dengan perintah:
```bash
docker compose up -d 
```
Note: Jika ingin mereset database atau menghapus seluruh data (volume), gunakan:
`docker compose down -v`

### 3. Menjalankan Aplikasi
Penggunaan Eclipse IDE direkomendasikan karena fitur auto-complete dan error. Namun, jika menggunakan VS Code, jalankan perintah berikut:
```bash
./mvnw spring-boot:run
```
## 📑 Dokumentasi & Testing
* **API Documentation:** Dokumentasi lengkap dapat dibuka pada file `APIDocs.html`
* **Testing:** Gunakan `Postman` atau `Bruno` untuk mencoba endpoint yang tersedia.

## 🚧 Roadmap & Tugas
* **Migrasi ke WebSocket:** Ubah API pesan menjadi WebSocket agar chat lebih responsif dan real-time.

## ℹ️ Note
Feel free buat bertanya. Ga perlu panik semua fitur sudah tersedia, tinggal rapih-rapih dikit dan nyambungin WebScoket kelar deh. Happy Code :)

