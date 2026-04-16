# BlockChat Frontend - Landing Page

> Modern landing page untuk BlockChat - aplikasi chat terdesentralisasi dengan blockchain

## 🎨 Fitur Landing Page

✅ **Hero Section** - Heading yang menarik dengan CTA buttons  
✅ **Features Section** - 6 fitur unggulan dengan icon dan deskripsi  
✅ **CTA Section** - Call-to-action dengan trust badges  
✅ **Dark/Light Theme** - Toggle tema dengan penyimpanan ke localStorage  
✅ **Responsive Design** - Mobile-first, tampil sempurna di semua device  
✅ **Modern UI** - Tailwind CSS dengan green & teal color scheme  

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Server akan otomatis membuka di http://localhost:3000

### 3. Build untuk Production
```bash
npm run build
npm run preview
```

## 📁 Struktur Project

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navigation.jsx       # Navbar dengan logo & theme toggle
│   │   ├── Hero.jsx             # Bagian hero utama
│   │   ├── Features.jsx         # Daftar fitur BlockChat
│   │   ├── CTA.jsx              # Call-to-action section
│   │   └── ThemeToggle.jsx      # Dark/light mode toggle
│   ├── App.jsx                  # Main component
│   ├── main.jsx                 # Entry point React
│   └── index.css                # Global styles & Tailwind
├── index.html                   # HTML utama
├── package.json                 # Dependencies
├── vite.config.js               # Konfigurasi Vite
├── tailwind.config.js           # Konfigurasi Tailwind CSS
└── postcss.config.js            # PostCSS config

```

## 🎨 Color Palette

**Primary Colors (Green):**
- Primary-500: `#22c55e` - Main green
- Primary-600: `#16a34a` - Darker green

**Secondary Colors (Teal):**
- Secondary-500: `#14b8a6` - Main teal
- Secondary-600: `#0d9488` - Darker teal

## 🔧 Technical Stack

- **React 18** - UI Library
- **Vite** - Build tool (super cepat!)
- **Tailwind CSS** - Utility-first CSS
- **JavaScript ES6+**

## 📝 Customization

### Mengubah Warna
Edit `tailwind.config.js` untuk mengubah color palette

### Menambah Section Baru
1. Buat component baru di `src/components/`
2. Import di `App.jsx`
3. Tambahkan ke dalam JSX

### Mengubah Content
Semua text berada di component masing-masing, mudah untuk di-customize

## ✨ Tips untuk Development

- **Hot Reload** - Vite otomatis refresh saat file berubah
- **ESLint** - Gunakan untuk best practices (bisa ditambahkan nanti)
- **Mobile First** - Test di mobile view terlebih dahulu

## 🚀 Next Steps

1. ✅ Landing page selesai
2. 📱 Siap untuk connect dengan backend
3. 🔐 Tambah authentication flow nanti
4. 💬 Build chat interface

## 📚 Resources

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)

---

**Created with ❤️ for learning & development**
