@echo off
echo Starting MongoDB on NEW PORT 27019...
if exist "c:\Users\eshaa\OneDrive\Desktop\FoodFusion\backend\data_debug\mongod.lock" del "c:\Users\eshaa\OneDrive\Desktop\FoodFusion\backend\data_debug\mongod.lock"
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "c:\Users\eshaa\OneDrive\Desktop\FoodFusion\backend\data_debug" --port 27019 --bind_ip 127.0.0.1
echo MONGODB CRASHED OR STOPPED.
pause
