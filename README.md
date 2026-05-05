# Payment Sandbox App — Frontend

Aplikasi simulasi pembayaran (Payment Sandbox) berbasis React + TypeScript. Dibuat sebagai bagian dari Engineering Competency Assessment.

---

## Tech Stack

| Kategori | Library |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| State Management | Zustand |
| Routing | React Router v6 |
| Form & Validation | React Hook Form + Zod |
| HTTP Client | Axios |
| API Mock | MSW (Mock Service Worker) |
| Testing | Vitest + React Testing Library |

---

## Struktur Folder

```
src/
├── api/              # Axios instance + semua API call per domain
├── components/
│   ├── layout/       # MerchantLayout, AdminLayout, Sidebar, Topbar
│   ├── shared/       # LoadingSpinner, EmptyState, ErrorMessage
│   └── ui/           # Button, Input, Badge, Modal, ConfirmModal, IconButton, dll
├── constants/        # Routes, Roles
├── hooks/
│   ├── auth/         # useLogin, useRegister
│   ├── merchant/     # useInvoices, useWallet, useRefund, dll
│   └── admin/        # useAdminStats, usePaymentSimulation, dll
├── mocks/
│   ├── data/         # Dummy data (users, invoices, dll)
│   ├── handlers/     # MSW handlers per domain
│   └── browser.ts    # MSW browser setup
├── pages/
│   ├── auth/         # LoginPage, RegisterPage
│   ├── merchant/     # Dashboard, Invoice, Wallet, Refund, dll
│   ├── admin/        # Dashboard, PaymentSimulation, RefundManagement, dll
│   └── public/       # PaymentPage (/pay/:token)
├── router/           # AppRouter, ProtectedRoute, PublicOnlyRoute
├── store/            # Zustand stores (authStore, walletStore)
├── types/            # Global TypeScript interfaces
└── utils/            # formatCurrency, formatDate, validations, dll
```

---

## Cara Menjalankan

### Prerequisites

- Node.js >= 18
- npm >= 9

### Install dependencies

```bash
npm install
```

### Jalankan development server

```bash
npm run dev
```

Buka browser di `http://localhost:5173`

> MSW akan aktif otomatis di mode development. Semua API call diintersep oleh mock handler — tidak perlu backend berjalan.

### Build production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

---

## Menjalankan Unit Test

### Jalankan semua test

```bash
npm run test:run
```

### Watch mode (re-run saat file berubah)

```bash
npm run test
```

### Cek coverage

```bash
npm run test:coverage
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Merchant | merchant@test.com | password123 |
| Admin | admin@test.com | password123 |

---

## Fitur yang Diimplementasi

### Authentication
- Register sebagai merchant
- Login dengan email & password
- JWT-based auth disimpan di localStorage
- Role-based protected routes (Merchant / Admin)
- Auto redirect berdasarkan role setelah login

### Merchant Interface
- **Dashboard** — statistik saldo, revenue, invoice pending/expired, recent invoice
- **Invoice List** — list invoice dengan filter status, pagination
- **Create Invoice** — form buat invoice dengan validasi
- **Invoice Detail** — detail invoice + payment link (preview & copy)
- **Wallet** — lihat saldo, ajukan top-up, riwayat top-up
- **Transaction History** — riwayat pembayaran masuk, top-up, dan refund keluar
- **Refund** — ajukan refund untuk invoice PAID, lihat status refund

### Public Payment Page
- Halaman publik `/pay/:token` tanpa auth
- Tampilkan detail invoice
- Pilih metode pembayaran: Wallet / VA Dummy / E-Wallet Dummy
- Polling status payment intent setiap 3 detik

### Admin Interface
- **Dashboard** — statistik total invoice, paid, failed, expired, nominal transaksi & refund
- **Payment Simulation** — search payment intent, approve/reject dengan confirmation modal
- **Refund Management** — approve/reject pengajuan, proses success/failed dengan confirmation modal
- **Top-up Approval** — approve/reject top-up wallet merchant dengan confirmation modal

---

## State Management

Zustand digunakan untuk state global:

- **`authStore`** — menyimpan `user`, `token`, dan `role`. Persist ke `localStorage` untuk mempertahankan session saat refresh.

State lokal per halaman (loading, error, data list) dikelola dalam custom hook menggunakan `useState` dan `useEffect` — tidak perlu masuk ke store global karena hanya dipakai satu halaman.

---

## Testing Strategy

Setiap layer ditest secara terpisah:

| Layer | Apa yang ditest |
|---|---|
| Utils | Pure function (formatCurrency, validasi schema) |
| Custom Hooks | Logic: loading state, error handling, side effect, state update |
| UI Components | Render, interaksi user, kondisi (disabled, loading, empty) |
| Pages | Integrasi antara hook + komponen: loading/error/empty state, form submission, modal flow |

Hook di-mock di test page agar test page fokus ke UI behavior, bukan API call. API di-mock di test hook agar test hook fokus ke logic, bukan network.