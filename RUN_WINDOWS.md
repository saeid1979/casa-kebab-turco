
# اجرای پروژه در ویندوز

## 1. اجرای Backend

```powershell
cd D:\Python_project\casa_kebab_turco_fullstack\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data
python manage.py createsuperuser
python manage.py runserver
```

## 2. اجرای Frontend

یک PowerShell جدید باز کن:

```powershell
cd D:\Python_project\casa_kebab_turco_fullstack\frontend
npm install
npm run dev
```

## آدرس‌ها

Frontend:
```text
http://127.0.0.1:5173/
```

Backend Admin:
```text
http://127.0.0.1:8000/admin/
```

API:
```text
http://127.0.0.1:8000/api/
```
