// bot.js
require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Cấu hình tag → chat_id group
const TAG_GROUPS = {
  "#sale": "-4728594152",  // chat_id group Sale
  "#tech": "-4841136203",  // chat_id group Tech
  "#nv": "-4841136205",    // chat_id group NV
  "#boss": "-4841136206"   // chat_id group Boss
};

// Command để kiểm tra chat_id
bot.command("getid", (ctx) => {
  ctx.reply(`chat_id của bạn là: ${ctx.chat.id}`);
});

// Hàm gửi tin nhắn ẩn danh
async function sendAnonymously(ctx, targetGroup, tag, content) {
  try {
    await ctx.telegram.sendMessage(
      targetGroup,
      `[${tag}] ${content}`
    );
    ctx.reply("✅ Tin nhắn đã gửi ẩn danh vào group tương ứng.");
    console.log(`Forward ẩn danh thành công: ${content} → group ${targetGroup}`);
  } catch (err) {
    console.error("Forward lỗi:", err);
    ctx.reply("❌ Lỗi khi gửi tin nhắn. Liên hệ admin!");
  }
}

// Lắng nghe tất cả tin nhắn
bot.on("message", async (ctx) => {
  const msg = ctx.message;

  // Kiểm tra tag
  const text = msg.text || msg.caption || "";
  const tag = Object.keys(TAG_GROUPS).find(tag => text.toLowerCase().includes(tag.toLowerCase()));

  if (!tag) {
    // Nếu không có tag, nhắc nhở
    ctx.reply("⚠️ Bạn cần thêm tag để xác định group, ví dụ: #sale, #tech, #nv, #boss");
    return;
  }

  const targetGroup = TAG_GROUPS[tag];

  // Xử lý các loại tin nhắn
  if (msg.text) {
    // Text
    await sendAnonymously(ctx, targetGroup, tag, msg.text.replace(tag, '').trim());
  } else if (msg.photo) {
    // Ảnh
    const photoId = msg.photo[msg.photo.length - 1].file_id; // ảnh chất lượng cao nhất
    await ctx.telegram.sendPhoto(targetGroup, photoId, { caption: `[${tag}] ${msg.caption || ''}` });
    ctx.reply("✅ Ảnh đã gửi ẩn danh vào group.");
    console.log(`Forward ảnh ẩn danh → group ${targetGroup}`);
  } else if (msg.document) {
    // File
    await ctx.telegram.sendDocument(targetGroup, msg.document.file_id, { caption: `[${tag}] ${msg.caption || ''}` });
    ctx.reply("✅ File đã gửi ẩn danh vào group.");
    console.log(`Forward file ẩn danh → group ${targetGroup}`);
  } else if (msg.sticker) {
    // Sticker
    await ctx.telegram.sendSticker(targetGroup, msg.sticker.file_id);
    ctx.reply("✅ Sticker đã gửi ẩn danh vào group.");
    console.log(`Forward sticker ẩn danh → group ${targetGroup}`);
  } else if (msg.voice) {
    // Voice
    await ctx.telegram.sendVoice(targetGroup, msg.voice.file_id, { caption: `[${tag}] ${msg.caption || ''}` });
    ctx.reply("✅ Voice đã gửi ẩn danh vào group.");
    console.log(`Forward voice ẩn danh → group ${targetGroup}`);
  } else {
    ctx.reply("⚠️ Loại tin nhắn này chưa được hỗ trợ.");
  }
});

// Start bot
bot.launch().then(() => console.log("🤖 Bot đang chạy..."));
