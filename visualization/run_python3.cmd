@echo off
ECHO "Uruchamianie serwera... (localhost:8000)"

ECHO Aby zatrzyma� serwer, nale�y u�y� kombinacji klawiszy ctrl + c

dir /ad /b ".\songs" >".\songs\list"
python3 -m http.server
PAUSE