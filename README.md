
# Casa Kebab Turco v6 - Optional Food Images

این نسخه امکان آپلود عکس غذا را به پنل Admin اضافه می‌کند.

## امکانات جدید

- در بخش Admin هنگام اضافه کردن غذا، عکس غذا هم می‌توان انتخاب کرد.
- عکس کاملاً اختیاری است.
- اگر عکس انتخاب نشود، غذا بدون عکس ثبت می‌شود.
- عکس غذا در صفحه مشتری نمایش داده می‌شود.
- عکس غذا در جدول مدیریت غذاها داخل Admin نمایش داده می‌شود.
- فایل‌های عکس داخل مسیر media ذخیره می‌شوند.

---

## فایل‌های تغییر کرده

```text
backend/restaurant/models.py
backend/restaurant/serializers.py
backend/restaurant/views.py
backend/restaurant_project/urls.py
backend/restaurant/migrations/0002_menuitem_image.py
frontend/src/main.jsx
frontend/src/styles.css
```

---

## روش جایگزینی

این فایل‌ها و پوشه‌ها را از ZIP جدید روی پروژه اصلی جایگزین کن:

```text
backend/restaurant/models.py
backend/restaurant/serializers.py
backend/restaurant/views.py
backend/restaurant_project/urls.py
backend/restaurant/migrations
frontend/src
```

---

## بعد از جایگزینی Backend

در ترمینال backend:

```powershell
cd D:\Python_project\Site_resturante\backend
venv\Scripts\activate
python manage.py migrate
python manage.py runserver
```

اگر migration خطا داد، این دستور را بزن:

```powershell
python manage.py makemigrations restaurant
python manage.py migrate
```

---

## اجرای Frontend

```powershell
cd D:\Python_project\Site_resturante\frontend
npm run dev
```

---

## ورود مدیر

```text
http://127.0.0.1:5173/#admin
```

بعد در بخش Admin می‌توانی غذا را با عکس یا بدون عکس اضافه کنی.
