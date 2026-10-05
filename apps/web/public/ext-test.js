// File JS RỜI — dùng để kiểm tra trình duyệt có tải/chạy script ngoài được không.
window.__EXT_OK = true;
var el = document.getElementById("extjs");
if (el) {
  el.textContent = "✅ CHẠY ĐƯỢC — script rời tải và thực thi bình thường";
  el.className = "ok";
}
