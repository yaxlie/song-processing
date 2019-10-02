@echo off
ECHO "Uruchamianie serwera... (localhost:8000)"

ECHO Aby zatrzymaæ serwer, nale¿y u¿yæ kombinacji klawiszy ctrl + c

dir /ad /b ".\songs" >".\songs\list"
python3 -m http.server
PAUSE