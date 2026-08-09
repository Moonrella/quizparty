@echo off
chcp 65001 >nul
echo 正在启动 QuizParty 网页版...

:: Check if port 4173 is already in use
node -e "const net=require('net');const s=net.createServer();s.listen(4173,()=>{s.close();process.exit(0)}).on('error',()=>{console.error('端口 4173 已被占用，可能是 QuizParty 已经在运行。');process.exit(1)})"
if errorlevel 1 (
  echo.
  echo 如果浏览器没有自动打开，请手动访问 http://localhost:4173
  pause >nul
  exit /b 1
)

:: Start the server in the background
start /b node server.cjs

:: Wait for the server to be ready (up to 10 seconds)
set /a tries=0
:wait_loop
node -e "const http=require('http');http.get('http://localhost:4173/',(r)=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>{process.exit(1)})"
if %errorlevel% == 0 goto server_ready
set /a tries+=1
if %tries% geq 20 (
  echo 服务启动超时，请检查是否有报错。
  pause >nul
  exit /b 1
)
timeout /t 1 /nobreak >nul
goto wait_loop

:server_ready
:: Open the browser
start http://localhost:4173

echo.
echo 网页已在浏览器中打开。关闭此窗口即可停止服务。
pause >nul
