@echo off
cd /d "%~dp0"
set "REPO=%~dp0"
set "REPO=%REPO:~0,-1%"
set "REPO=%REPO:\=/%"

echo Preparando Git para esta carpeta...
git config --global --get-all safe.directory | findstr /x /i /c:"%REPO%" >nul 2>&1
if errorlevel 1 git config --global --add safe.directory "%REPO%"

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto sin_repo

set "GITUSER="
for /f "delims=" %%a in ('git config user.name') do set "GITUSER=%%a"
if not defined GITUSER goto sin_usuario

echo Subiendo los cambios de tu pagina a GitHub...
git add -A
git commit -m "Actualizacion de la web"
git push
if errorlevel 1 goto error_push

echo.
echo LISTO. Tu pagina se actualiza en 1 o 2 minutos. Abrela con Ctrl+F5.
goto fin

:sin_repo
echo.
echo ERROR: Git sigue sin reconocer esta carpeta.
echo Copia todo el texto de esta ventana y enviaselo a Claude.
goto fin

:sin_usuario
echo.
echo Falta decirle a Git quien eres. Abre el Simbolo del sistema y ejecuta estas dos lineas,
echo cambiando el correo por el de tu cuenta de GitHub:
echo.
echo    git config --global user.name "juancho9089"
echo    git config --global user.email "TU-CORREO-DE-GITHUB"
echo.
echo Despues vuelve a hacer doble clic en Subir_Web.bat
goto fin

:error_push
echo.
echo ERROR: no se pudo subir. Copia todo el texto de esta ventana y enviaselo a Claude.

:fin
echo.
pause
