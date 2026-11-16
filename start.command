#!/bin/zsh
# Double-click this file to preview the portfolio on your Mac.
# It starts a small local web server (needed so the page can read data.json) and opens your browser.
cd "$(dirname "$0")" || exit 1

PORT=8080
while lsof -i :"$PORT" >/dev/null 2>&1; do PORT=$((PORT + 1)); done

echo "Portfolio running at http://localhost:$PORT"
echo "Edit data.json, save, then refresh the browser to see changes."
echo "Close this window (or press Ctrl+C) to stop."
(sleep 1 && open "http://localhost:$PORT") &
python3 -m http.server "$PORT" --bind 127.0.0.1
