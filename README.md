# Server Untuk Sistem Login

## Tech Stack
- **Node.js** - Runtime JavaScript untuk server-side.
- **Express.js** - Framework backend untuk Node.js.
- **Prisma** - ORM untuk mengelola database dengan mudah.
- **PostgreSQL** - Database relasional yang digunakan.
- **JSON Web Token (JWT)** - Digunakan untuk autentikasi berbasis token.
- **Upstash Redis** - Digunakan untuk menyimpan token autentikasi agar lebih aman.

## Alur Sistem
1. **User Login**
   - User mengirimkan email dan password melalui form login di frontend.
   - Data dikirimkan ke endpoint API untuk diproses.
2. **Validasi di Server**
   - Server menerima request dan memverifikasi kredensial user di database menggunakan Prisma ORM.
   - Jika kredensial valid, server akan membuat **accessToken** dan **refreshToken** menggunakan JWT.
   - **RefreshToken** disimpan di **Upstash Redis** untuk keamanan tambahan.
3. **Respon ke Frontend**
   - Server mengembalikan **accessToken**, **refreshToken**, dan informasi user ke frontend.
   - Frontend menyimpan token untuk autentikasi sesi user.
4. **Akses Endpoint Terproteksi**
   - User yang ingin mengakses endpoint yang membutuhkan autentikasi harus menyertakan **accessToken** dalam header Authorization.
   - Server memverifikasi token sebelum mengizinkan akses.
5. **Refresh Token**
   - Jika **accessToken** kedaluwarsa, frontend dapat menggunakan **refreshToken** untuk mendapatkan token baru.
   - Server mengecek **refreshToken** di **Redis** sebelum mengeluarkan **accessToken** yang baru.
6. **Logout User**
   - Saat logout, **refreshToken** akan dihapus dari **Redis**.
   - Frontend menghapus token dari penyimpanan lokal.

## Setup & Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/RioAldie/auth-server
cd server-auth
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment
Buat file **.env** dan tambahkan konfigurasi berikut:
```env
DATABASE_URL=postgresql://distro_db_owner:qSuXUFmG8hr9@ep-green-bird-a197k4c2-pooler.ap-southeast-1.aws.neon.tech/eagle_db?sslmode=require
SECRET_KEY=$2a$12$7po/d.2K0UTLmIXtEVBCGOR5ylT.tMXimU2OQ.6iWXC9.0QKqylTq
UPSTASH_REDIS_REST_URL=https://joint-lionfish-57961.upstash.io
UPSTASH_REDIS_REST_TOKEN=AeJpAAIjcDEyYTAwZjRlZGRmYWQ0M2IyOTE5NWM0ODQ1NjcyNGI1ZHAxMA
REFRESH_SECRET=$2a$12$7po/d.2K0UTLmIXtEVBCGOR5ylT.tMXimU2OQ.6iWXC9.0QKqylTq
```

### 4. Migrasi Database
```bash
npx prisma migrate dev 
```

### 5. Menjalankan Server
```bash
npm run dev
```
Server akan berjalan di `http://localhost:9000`

## Endpoint API
### 1. **User Login**
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "test@gmail.com",
    "password": "rahasia"
  }
  ```
- **Response:**
  ```json
  {
    "accessToken": "xxx",
    "refreshToken": "yyy",
    "user": {
      "email": "user@example.com"
    }
  }
  ```

### 2. **Refresh Token**
- **Endpoint:** `POST /api/auth/refresh`
- **Headers:** `{ "Authorization": "Bearer refreshToken" }`
- **Response:**
  ```json
  {
    "accessToken": "new_access_token"
  }
  ```

### 3. **Logout User**
- **Endpoint:** `POST /api/auth/logout`
- **Headers:** `{ "Authorization": "Bearer refreshToken" }`
- **Response:**
  ```json
  {
    "message": "Logout berhasil"
  }
  ```



