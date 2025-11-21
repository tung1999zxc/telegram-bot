// start.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// === Endpoint dummy để Render thấy port mở ===
app.get("/", (req, res) => res.send("🤖 Bot Telegram đang chạy"));

// === Start server ===
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// === Start bot ===
try {
  require("./bot.js");
  console.log("🤖 Bot Telegram đã khởi chạy thành công");
} catch (err) {
  console.error("❌ Lỗi khi khởi chạy bot:", err);
}
