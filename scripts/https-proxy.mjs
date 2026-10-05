// Proxy TLS tối giản (chỉ dùng Node builtins) đứng trước `next start`.
// Lý do: `next start` chỉ phục vụ HTTP, mà Safari iOS tự nâng http:// → https://
// nên phải có TLS. Dùng lại cert đã được iPad tin cậy.
//
//   node scripts/https-proxy.mjs [httpsPort] [targetPort]

import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const HTTPS_PORT = Number(process.argv[2] ?? 3003);
const TARGET_PORT = Number(process.argv[3] ?? 3002);

const options = {
  key: fs.readFileSync(path.join(root, "certs/key.pem")),
  cert: fs.readFileSync(path.join(root, "certs/cert.pem")),
};

const server = https.createServer(options, (req, res) => {
  const proxyReq = http.request(
    {
      host: "127.0.0.1",
      port: TARGET_PORT,
      method: req.method,
      path: req.url,
      headers: { ...req.headers, host: `127.0.0.1:${TARGET_PORT}` },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );
  proxyReq.on("error", (err) => {
    res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    res.end("Proxy lỗi: " + err.message);
  });
  req.pipe(proxyReq);
});

server.listen(HTTPS_PORT, "0.0.0.0", () => {
  console.log(`TLS proxy: https://0.0.0.0:${HTTPS_PORT}  →  http://127.0.0.1:${TARGET_PORT}`);
});
