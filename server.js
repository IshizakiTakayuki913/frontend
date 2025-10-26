// HTTPモジュール（HTTP通信機能）
let http = new require('http');

// URL,pathモジュール（URLの解析分解機能）
let url = new require('url');
let path = new require('path');

// ファイルシステムモジュール（ファイルの読み込み機能）
let fs = new require('fs');

const os = new require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // IPv4、ループバック除外、内部IPじゃないやつを取得
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'IPアドレスが見つかりませんでした';
}

let server = http.createServer(handleRequest);
const ip = getLocalIP();
server.listen(3000, ip);  // 待ち受けポート番号を 8080 に指定

console.log(`アドレス: http://${ip}:${3000}`);


function handleRequest(req, res) {
  let pathname = req.url;
  
  if (pathname == '/') {
    pathname = '/index.html';
  }
  
  // 指定されたパス名（pathname）の拡張子を取り出しファイルタイプを確認
  let ext = path.extname(pathname);

  // 拡張子とコンテンツのMIMEタイプを対応づける（とりあず３種類だけ記述）
  let typeExt = {
    '.html': 'text/html',        // HTMLテキストファイル
    '.js':   'text/javascript',  // Javascriptプログラムソース（テキスト）
    '.css':  'text/css',          // CSSテキストファイル
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.json': 'application/json'
  };

  let contentType = typeExt[ext] || 'text/plain';

  fs.readFile(__dirname + pathname,
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      res.writeHead(200,{ 'Content-Type': contentType });
      res.end(data);
    }
  );
}
