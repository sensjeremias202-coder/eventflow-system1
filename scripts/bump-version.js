const fs = require('fs');
const path = require('path');

function pad(n){return n.toString().padStart(2,'0');}
function timestamp(){
  const d = new Date();
  const y = d.getFullYear();
  const m = pad(d.getMonth()+1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${y}${m}${day}${h}${min}${s}`;
}

const file = path.resolve(__dirname, '..', 'index.html');
let html = fs.readFileSync(file, 'utf8');
const ts = timestamp();

// Replace window.APP_VERSION
const beforeAppVersion = html;
html = html.replace(/window\.APP_VERSION\s*=\s*'\d{14}'/g, `window.APP_VERSION = '${ts}'`);

// Replace all ?v=YYYYMMDDHHMMSS
const re = /([?&]v=)\d{14}/g;
html = html.replace(re, `$1${ts}`);

// Report changes
if (beforeAppVersion === html) {
  console.log(`[bump] Updated query params and APP_VERSION to ${ts}`);
} else {
  console.log(`[bump] Updated APP_VERSION and query params to ${ts}`);
}

fs.writeFileSync(file, html, 'utf8');

console.log(`[bump] Done: ${file}`);
