
@echo off
cd /d "D:\Final year project\Backend"
call ".venv\Scripts\activate.bat"
python manage.py aggregate_live_intervals >> logs\live_aggregation.log 2>&1
