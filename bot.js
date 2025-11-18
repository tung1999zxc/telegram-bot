// bot.js
require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Cấu hình tag → danh sách chat_id group
const TAG_GROUPS = {
  "#st": ["5045620043"],            // sáng trưa
  "#t": ["5071830714"],             // sáng trưa
  "#nhi": ["-5041062787"],          // hành chính pvd
  "#danh": ["-5050272045"],         // hành chính đông anh

  // Gửi đồng thời cả 2 nhóm
  "#hanh": ["-5041062787", "-5050272045"], 
};

// Command để kiểm tra chat_id
bot.command("getid", (ctx) => {
  ctx.reply(`chat_id của bạn là: ${ctx.chat.id}`);
});

// Hàm gửi tin nhắn ẩn danh
async function sendAnonymously(ctx, groupId, tag, content) {
  try {
    await ctx.telegram.sendMessage(
      groupId,
      `[${tag}] ${content}`
    );
    console.log(`➡️ Forward ẩn danh: ${content} → group ${groupId}`);
  } catch (err) {
    console.error("❌ Lỗi khi gửi:", err);
  }
}

// Lắng nghe tất cả tin nhắn
bot.on("message", async (ctx) => {
  const msg = ctx.message;

  const text = msg.text || msg.caption || "";
  const tag = Object.keys(TAG_GROUPS).find(t => text.toLowerCase().includes(t.toLowerCase()));

  if (!tag) {
    ctx.reply("⚠️ Bạn cần thêm tag, ví dụ: #st, #t, #nhi, #hanh...");
    return;
  }

  const targetGroups = TAG_GROUPS[tag]; // luôn là mảng

  // ======= GỬI TEXT =======
  if (msg.text) {
    const content = msg.text.replace(tag, "").trim();
    for (const group of targetGroups) {
      await sendAnonymously(ctx, group, tag, content);
    }
    ctx.reply("✅ Tin nhắn đã gửi ẩn danh.");
    return;
  }

  // ======= GỬI ẢNH =======
  if (msg.photo) {
    const photoId = msg.photo[msg.photo.length - 1].file_id;
    for (const group of targetGroups) {
      await ctx.telegram.sendPhoto(group, photoId, { caption: `[${tag}] ${msg.caption || ''}` });
      console.log(`➡️ Forward ảnh → ${group}`);
    }
    ctx.reply("✅ Ảnh đã gửi ẩn danh.");
    return;
  }

  // ======= GỬI FILE =======
  if (msg.document) {
    for (const group of targetGroups) {
      await ctx.telegram.sendDocument(group, msg.document.file_id, { caption: `[${tag}] ${msg.caption || ''}` });
      console.log(`➡️ Forward file → ${group}`);
    }
    ctx.reply("✅ File đã gửi ẩn danh.");
    return;
  }

  // ======= GỬI STICKER =======
  if (msg.sticker) {
    for (const group of targetGroups) {
      await ctx.telegram.sendSticker(group, msg.sticker.file_id);
      console.log(`➡️ Forward sticker → ${group}`);
    }
    ctx.reply("✅ Sticker đã gửi ẩn danh.");
    return;
  }

  // ======= GỬI VOICE =======
  if (msg.voice) {
    for (const group of targetGroups) {
      await ctx.telegram.sendVoice(group, msg.voice.file_id, { caption: `[${tag}] ${msg.caption || ''}` });
      console.log(`➡️ Forward voice → ${group}`);
    }
    ctx.reply("✅ Voice đã gửi ẩn danh.");
    return;
  }

  // Nếu loại tin nhắn chưa hỗ trợ
  ctx.reply("⚠️ Loại tin nhắn này chưa được hỗ trợ.");
});

// Start bot
bot.launch().then(() => console.log("🤖 Bot đang chạy..."));
