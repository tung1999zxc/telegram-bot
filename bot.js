// bot.js
require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// ========= CẤU HÌNH =========

// Danh sách tag → danh sách chat_id group
const TAG_GROUPS = {
  "#st": ["-5045620043"],                 // sáng trưa
  "#t": ["-5071830714"],                  // sáng trưa
  "#nhi": ["-5041062787"],                // hành chính pvd
  "#danh": ["-5050272045"],               // hành chính đông anh
"#phong": ["-5068573088"] ,
  // gửi đồng thời
  "#hanh": ["-5041062787", "-5050272045"],
  "#hanh21": ["-504106278", "-505027204"],
};

// CHAT ID ADMIN (chỉ admin nhìn thấy thông tin thật)
const ADMIN_ID = 1696923084;

// Lệnh kiểm tra chat_id
bot.command("getid", (ctx) => {
  ctx.reply(`📌 Chat ID của bạn là: ${ctx.chat.id}`);
});

// ========= HÀM GỬI ẨN DANH + GỬI RIÊNG ADMIN =========

async function sendToGroups(ctx, tag, content, fileType, fileId) {
  const sender = ctx.from;
  const senderInfo =
    `👤 Người gửi:\n` +
    `• Name: ${sender.first_name || ""} ${sender.last_name || ""}\n` +
    `• Username: @${sender.username || "không có"}\n` +
    `• Chat ID: ${sender.id}`;

  // gửi cho tất cả group
  for (const groupId of TAG_GROUPS[tag]) {
    try {
      // ========== GỬI ẨN DANH CHO GROUP ==========
      if (fileType === "text") {
        await ctx.telegram.sendMessage(groupId, `[${tag}] ${content}`);
      } else if (fileType === "photo") {
        await ctx.telegram.sendPhoto(groupId, fileId, { caption: `[${tag}] ${content || ""}` });
      } else if (fileType === "document") {
        await ctx.telegram.sendDocument(groupId, fileId, { caption: `[${tag}] ${content || ""}` });
      } else if (fileType === "voice") {
        await ctx.telegram.sendVoice(groupId, fileId, { caption: `[${tag}] ${content || ""}` });
      } else if (fileType === "sticker") {
        await ctx.telegram.sendSticker(groupId, fileId);
      }

      console.log(`➡️ Gửi ẩn danh vào group ${groupId}`);
    } catch (err) {
      console.error(`❌ Lỗi gửi vào group ${groupId}:`, err);
    }
  }

  // ========== GỬI THÔNG TIN THẬT CHO ADMIN ==========
  try {
    if (fileType === "text") {
      await ctx.telegram.sendMessage(ADMIN_ID, `🔍 [${tag}] Tin nhắn gốc:\n${content}\n\n${senderInfo}`);
    } else if (fileType === "photo") {
      await ctx.telegram.sendPhoto(ADMIN_ID, fileId, { caption: `🔍 [${tag}] Ảnh gốc\n\n${senderInfo}` });
    } else if (fileType === "document") {
      await ctx.telegram.sendDocument(ADMIN_ID, fileId, { caption: `🔍 [${tag}] File gốc\n\n${senderInfo}` });
    } else if (fileType === "voice") {
      await ctx.telegram.sendVoice(ADMIN_ID, fileId, { caption: `🔍 [${tag}] Voice gốc\n\n${senderInfo}` });
    } else if (fileType === "sticker") {
      await ctx.telegram.sendMessage(ADMIN_ID, `🔍 [${tag}] Sticker từ người gửi\n\n${senderInfo}`);
      await ctx.telegram.sendSticker(ADMIN_ID, fileId);
    }

    console.log(`➡️ Gửi thông tin thật cho admin`);
  } catch (err) {
    console.error("❌ Lỗi gửi cho admin:", err);
  }
}

// ========= LẮNG NGHE TIN NHẮN =========

bot.on("message", async (ctx) => {
  const msg = ctx.message;
  const text = msg.text || msg.caption || "";
  const tag = Object.keys(TAG_GROUPS).find(t => text.toLowerCase().includes(t.toLowerCase()));

  if (!tag) {
    ctx.reply("⚠️ Bạn cần thêm tag: #st, #t, #nhi, #danh, #hanh...");
    return;
  }

  // ====== TEXT ======
  if (msg.text) {
    const content = msg.text.replace(tag, "").trim();
    await sendToGroups(ctx, tag, content, "text");
    ctx.reply("✅ Tin nhắn đã gửi ẩn danh.");
    return;
  }

  // ====== ẢNH ======
  if (msg.photo) {
    const photoId = msg.photo[msg.photo.length - 1].file_id;
    await sendToGroups(ctx, tag, msg.caption, "photo", photoId);
    ctx.reply("✅ Ảnh đã gửi ẩn danh.");
    return;
  }

  // ====== FILE ======
  if (msg.document) {
    await sendToGroups(ctx, tag, msg.caption, "document", msg.document.file_id);
    ctx.reply("✅ File đã gửi ẩn danh.");
    return;
  }

  // ====== VOICE ======
  if (msg.voice) {
    await sendToGroups(ctx, tag, msg.caption, "voice", msg.voice.file_id);
    ctx.reply("✅ Voice đã gửi ẩn danh.");
    return;
  }

  // ====== STICKER ======
  if (msg.sticker) {
    await sendToGroups(ctx, tag, null, "sticker", msg.sticker.file_id);
    ctx.reply("✅ Sticker đã gửi ẩn danh.");
    return;
  }

  ctx.reply("⚠️ Loại tin nhắn này chưa được hỗ trợ.");
});

// ========= START BOT =========

bot.launch().then(() => console.log("🤖 Bot đang chạy..."));

