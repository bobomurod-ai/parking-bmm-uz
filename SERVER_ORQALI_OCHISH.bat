@echo off
title Parking BMM_UZ - Local Web Server
echo ========================================================
echo        PARKING BMM_UZ - LOCAL WEB SERVER
echo ========================================================
echo Server ishga tushirilmoqda: http://localhost:8080 ...
start http://localhost:8080
python -m http.server 8080
pause
