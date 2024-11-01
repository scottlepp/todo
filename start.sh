npm install
work_dir=$(pwd)
osascript -e 'tell app "Terminal"
    do script "cd '$work_dir'/server && npm run dev"
end tell'

npm run start