SetX VAMP_PATH "%appdata%/vamp_plugins" /m
mkdir "%appdata%\vamp_plugins"
COPY .\lib\pyin\pyin.dll %appdata%\vamp_plugins\pyin.dll
COPY .\lib\pyin\pyin.cat %appdata%\vamp_plugins\pyin.cat
COPY .\lib\pyin\pyin.n3 %appdata%\vamp_plugins\pyin.n3