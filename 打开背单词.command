#!/bin/bash
# 双击打开背单词网页。关掉这个窗口，网页就停止。
cd "$(dirname "$0")"
PORT=8000
while lsof -i :$PORT >/dev/null 2>&1; do PORT=$((PORT+1)); done
echo "背单词网页已启动：http://localhost:$PORT"
echo "用完后关掉这个窗口就行。"
(sleep 1; open "http://localhost:$PORT") &
python3 -m http.server $PORT --bind 127.0.0.1
