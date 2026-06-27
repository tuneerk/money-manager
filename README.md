# Money Manager

A zero-build offline-first PWA for tracking personal expenses. All data stays on your device (IndexedDB). No account, no server.

## Running locally

You need any static file server — the app is plain HTML/JS with no build step.

**Option 1 — Python (built-in, no install needed)**
```bash
cd money-manager
python3 -m http.server 3000
```
Then open `http://localhost:3000` in your browser.

**Option 2 — Node.js `serve`**
```bash
npx serve .
```

**Option 3 — Node.js one-liner**
```bash
node -e "
const http=require('http'),fs=require('fs'),path=require('path');
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.png':'image/png'};
http.createServer((req,res)=>{
  const fp=path.join(__dirname,req.url==='/'?'index.html':req.url.split('?')[0]);
  try{const d=fs.readFileSync(fp);res.writeHead(200,{'Content-Type':mime[path.extname(fp)]||'text/plain'});res.end(d);}
  catch{res.writeHead(404);res.end();}
}).listen(3000,()=>console.log('http://localhost:3000'));
"
```

**Option 4 — VS Code Live Server**
Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, right-click `index.html` → Open with Live Server.

> **Note:** The app must be served over HTTP (not opened as a `file://` URL) for IndexedDB and the Service Worker to work correctly.

## Installing as a PWA

Once open in Chrome/Edge/Safari, look for the **Install** prompt in the address bar (or browser menu → "Add to Home Screen" on mobile). After installing it works fully offline.

## Files

| File | Purpose |
|---|---|
| `index.html` | UI shell + all CSS |
| `app.js` | Business logic, voice NLP, Claude AI integration |
| `database.js` | Dexie/IndexedDB schema + seed data |
| `sw.js` | Service Worker (cache-first offline strategy) |
| `dexie.min.js` | Dexie v3.2.4 bundled locally (no CDN needed) |
| `manifest.json` | PWA manifest |
| `icons/` | App icons (192px + 512px) |

## Features

- Add expenses / income / transfers manually, by voice, or by scanning a receipt
- Day-grouped transaction list with daily totals
- Stats screen with donut pie chart and category breakdown
- Monthly budgets with progress bars
- Accounts with grouped view (Cash, Banks, Cards, Investments)
- Month navigation — browse any past month
- Claude AI fallback for ambiguous voice input (optional, requires API key)
- JSON export; all data stored locally, never leaves the device
