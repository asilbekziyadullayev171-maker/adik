# QishloqMed AI

QishloqMed AI — bu O'zbekistonning chekka hududlarida tibbiy xizmat sifatini oshirish va raqamlashtirish uchun mo'ljallangan sun'iy intellektga asoslangan raqamli tibbiy triaj platformasi.

## Loyiha Haqida

Platforma hamshiralar, shifokorlar va bemorlar uchun yagona ekotizim yaratadi. AI yordamida kasallik xavflarini oldindan aniqlash (Red Flag) va bemorlarni to'g'ri mutaxassislarga yo'naltirish orqali tibbiy xizmat tezligi va sifatini yaxshilaydi. Offline-first yondashuvi yordamida internet bo'lmagan sharoitlarda ham ishlashni ta'minlaydi.

## Texnologik Stek

- **Backend:** FastAPI (Python 3.11+), SQLAlchemy 2.0 (async), Pydantic v2
- **Ma'lumotlar Bazasi:** PostgreSQL 16
- **Kesh va Navbatlar:** Redis 7
- **Infratuzilma:** Docker, Docker Compose, Nginx
- **Mobile (Hamshira):** Flutter (Offline-first)
- **Web (Shifokor/Admin):** Next.js (React)

## Tez Boshlash (Quick Start)

Loyihani lokal muhitda ishga tushirish uchun quyidagi qadamlarni bajaring:

1. `.env` faylini yarating:
   ```bash
   cp .env.example .env
   ```

2. Docker Compose yordamida loyihani ishga tushiring:
   ```bash
   make up
   # yoki
   docker-compose up -d
   ```

3. API Hujjatlariga (Swagger UI) tashrif buyuring:
   - [http://localhost:8000/docs](http://localhost:8000/docs)
   - API Nginx orqali [http://localhost/api/v1](http://localhost/api/v1) manzilida ham mavjud.

## Loyiha Tuzilmasi

- `database/` - Ma'lumotlar bazasi skriptlari va urug' (seed) ma'lumotlari.
  - `schema.sql` - Barcha jadvallar tuzilmasi.
  - `seeds/` - Boshlang'ich ma'lumotlar.
- `docker/` - Docker konfiguratsiyalari.
  - `docker-compose.yml` - Xizmatlarni sozlash.
  - `nginx/` - Nginx proxy sozlamalari.
- `Makefile` - Tezkor buyruqlar uchun yordamchi fayl.

## Hujjatlar

To'liq texnik arxitektura bilan tanishish uchun hujjatlarga murojaat qiling.
