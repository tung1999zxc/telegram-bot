// bot.js
require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// =========================================================
// ==============  CẤU HÌNH TAG → DANH SÁCH GROUP  =========
// =========================================================

const TAG_GROUPS = {
  "#st": ["-1003132769814"],    // sáng trưa
  "#t": ["-1003316340895"],     // sáng trưa
  "#nhi": ["-1003469624013"],   // hành chính pvd
  "#danh": ["-1003450550142"],  // HC Đông Anh
  "#phong": ["-1003026738578"],
  "#cn": ["-1003223915676"],
  // "#han": ["-1003374674088"],
  // "#dai": ["-5025654332"],

  // gửi nhiều group cùng lúc
  "#hanh": ["-1003469624013", "-1003450550142"],
  "#hanh21": ["-504106278", "-505027204"]
};

// =========================================================
// ======================   ADMIN LIST   ====================
// =========================================================
const ADMINS = [
  1696923084,6280099511 // chủ phòng (tung0099)
];

// =========================================================
// ======= MEMORY: Lưu groupMessageId → originalUserId ======
// =========================================================
const GROUP_REPLY_MAP = {};

// =========================================================
// =============== LỆNH KIỂM TRA CHAT_ID ====================
// =========================================================
bot.command("getid", (ctx) => {
  ctx.reply(`📌 Chat ID của bạn: ${ctx.chat.id}`);
});

// =========================================================
// ===================== DEBUG (ĐỂ TEST) ====================
// =========================================================
bot.use((ctx, next) => {
  // console.log("🔥 UPDATE:", JSON.stringify(ctx.update, null, 2));
  return next();
});

// =========================================================
// =========== HÀM GỬI ẨN DANH + GỬI ADMIN ==================
// =========================================================

async function sendToGroups(ctx, tag, content, fileType, fileId) {
  const sender = ctx.from;

  const senderInfo =
    `👤 Người gửi:\n` +
    `• Họ tên: ${sender.first_name || ""} ${sender.last_name || ""}\n` +
    `• Username: @${sender.username || "không có"}\n` +
    `• Chat ID: ${sender.id}`;

  // Gửi ẩn danh vào group
  for (const groupId of TAG_GROUPS[tag] || []) {
    try {
      let m;

      switch (fileType) {
        case "text":
          m = await ctx.telegram.sendMessage(groupId, `${content}`);
          break;
        case "photo":
          m = await ctx.telegram.sendPhoto(groupId, fileId, { caption: content || "" });
          break;
        case "document":
          m = await ctx.telegram.sendDocument(groupId, fileId, { caption: content || "" });
          break;
        case "voice":
          m = await ctx.telegram.sendVoice(groupId, fileId, { caption: content || "" });
          break;
        case "sticker":
          m = await ctx.telegram.sendSticker(groupId, fileId);
          break;
        case "video":
          m = await ctx.telegram.sendVideo(groupId, fileId, { caption: content || "" });
          break;
        case "audio":
          m = await ctx.telegram.sendAudio(groupId, fileId, { caption: content || "" });
          break;
      }

      // LƯU MAPPING ĐỂ GỬI REPLY + REACTION
      if (m?.message_id) {
        GROUP_REPLY_MAP[m.message_id] = sender.id;
        console.log(`💾 Lưu map: GroupMsg ${m.message_id} → User ${sender.id}`);
      }
    } catch (err) {
      console.error(`❌ Lỗi gửi group ${groupId}:`, err);
    }
  }

  // ------------------ Gửi thông tin thật cho admin ------------------
  for (const adminId of ADMINS) {
    try {
      switch (fileType) {
        case "text":
          await ctx.telegram.sendMessage(adminId, `🔍 [${tag}] Tin nhắn gốc:\n${content}\n\n${senderInfo}`);
          break;
        case "photo":
          await ctx.telegram.sendPhoto(adminId, fileId, { caption: `🔍 [${tag}] Ảnh gốc\n\n${senderInfo}` });
          break;
        case "document":
          await ctx.telegram.sendDocument(adminId, fileId, { caption: `🔍 [${tag}] File gốc\n\n${senderInfo}` });
          break;
        case "voice":
          await ctx.telegram.sendVoice(adminId, fileId, { caption: `🔍 [${tag}] Voice gốc\n\n${senderInfo}` });
          break;
        case "sticker":
          await ctx.telegram.sendMessage(adminId, `🔍 [${tag}] Sticker\n\n${senderInfo}`);
          await ctx.telegram.sendSticker(adminId, fileId);
          break;
        case "video":
          await ctx.telegram.sendVideo(adminId, fileId, { caption: `🔍 [${tag}] Video gốc\n\n${senderInfo}` });
          break;
        case "audio":
          await ctx.telegram.sendAudio(adminId, fileId, { caption: `🔍 [${tag}] Audio gốc\n\n${senderInfo}` });
          break;
      }
    } catch (err) {
      console.error(`❌ Lỗi gửi admin ${adminId}:`, err);
    }
  }
}

// =========================================================
// ====================== XỬ LÝ TIN NHẮN ====================
// =========================================================

bot.on("message", async (ctx) => {
  const msg = ctx.message;

  // 1️⃣ PHẢN HỒI TỪ GROUP → GỬI LẠI USER GỐC
  if (msg.reply_to_message) {
    const repliedId = msg.reply_to_message.message_id;

    if (GROUP_REPLY_MAP[repliedId]) {
      const originalUserId = GROUP_REPLY_MAP[repliedId];

      try {
        if (msg.text)
          await ctx.telegram.sendMessage(originalUserId, `✉️ Phản hồi từ nhóm:\n${msg.text}`);
        else if (msg.photo)
          await ctx.telegram.sendPhoto(originalUserId, msg.photo.at(-1).file_id, { caption: msg.caption || "" });
        else if (msg.document)
          await ctx.telegram.sendDocument(originalUserId, msg.document.file_id, { caption: msg.caption || "" });
        else if (msg.voice)
          await ctx.telegram.sendVoice(originalUserId, msg.voice.file_id, { caption: msg.caption || "" });
        else if (msg.video)
          await ctx.telegram.sendVideo(originalUserId, msg.video.file_id, { caption: msg.caption || "" });
        else if (msg.sticker)
          await ctx.telegram.sendSticker(originalUserId, msg.sticker.file_id);
        else
          await ctx.telegram.sendMessage(originalUserId, "✉️ Nhóm phản hồi (loại khác)");

        console.log(`↩ Gửi reply về user ${originalUserId}`);
        return;
      } catch (err) {
        console.error("❌ Lỗi reply user:", err);
      }
    }
  }

  // 2️⃣ XỬ LÝ GỬI ẨN DANH THEO TAG
  const text = msg.text || msg.caption || "";
  const tag = Object.keys(TAG_GROUPS).find((t) => text.toLowerCase().includes(t));

  if (!tag) return;

  const cleaned = text.replace(tag, "").trim();

  if (msg.text) {
    await sendToGroups(ctx, tag, cleaned, "text");
    return ctx.reply("✅ Tin nhắn đã được gửi ẩn danh.");
  }

  if (msg.photo) {
    await sendToGroups(ctx, tag, msg.caption, "photo", msg.photo.at(-1).file_id);
    return ctx.reply("✅ Ảnh đã gửi ẩn danh.");
  }

  if (msg.document) {
    await sendToGroups(ctx, tag, msg.caption, "document", msg.document.file_id);
    return ctx.reply("✅ File đã gửi ẩn danh.");
  }

  if (msg.voice) {
    await sendToGroups(ctx, tag, msg.caption, "voice", msg.voice.file_id);
    return ctx.reply("✅ Voice đã gửi ẩn danh.");
  }

  if (msg.video) {
    await sendToGroups(ctx, tag, msg.caption, "video", msg.video.file_id);
    return ctx.reply("✅ Video đã gửi ẩn danh.");
  }

  if (msg.sticker) {
    await sendToGroups(ctx, tag, null, "sticker", msg.sticker.file_id);
    return ctx.reply("✅ Sticker đã gửi ẩn danh.");
  }

  if (msg.audio) {
    await sendToGroups(ctx, tag, msg.caption, "audio", msg.audio.file_id);
    return ctx.reply("✅ Audio đã gửi ẩn danh.");
  }
});

// =========================================================
// ================ XỬ LÝ REACTION TIN NHẮN =================
// =========================================================

// 🟢 Khi người khác thả hoặc gỡ reaction
bot.on("message_reaction", async (ctx) => {
  const data = ctx.update.message_reaction;

  const msgId = data.message_id;
  const originalUserId = GROUP_REPLY_MAP[msgId];
  if (!originalUserId) return;

  const emojis = data.new_reaction.map((r) => r.emoji).join(", ");

  try {
    await ctx.telegram.sendMessage(
      originalUserId,
      `❤️ Tin nhắn của bạn vừa nhận reaction: ${emojis}`
    );
  } catch (err) {
    console.error("❌ Lỗi gửi reaction:", err);
  }
});

// 🟢 Khi tổng số reaction thay đổi
bot.on("message_reaction_count", async (ctx) => {
  const data = ctx.update.message_reaction_count;

  const msgId = data.message_id;
  const originalUserId = GROUP_REPLY_MAP[msgId];
  if (!originalUserId) return;

  const summary = data.reactions
    .map((r) => `${r.emoji} (${r.count})`)
    .join(", ");

  try {
    await ctx.telegram.sendMessage(
      originalUserId,
      `💬 Tin nhắn bạn gửi có reaction: ${summary}`
    );
  } catch (err) {
    console.error("❌ Lỗi gửi reaction count:", err);
  }
});

// =========================================================
// ======================= KHỞI ĐỘNG BOT ====================
// =========================================================

bot.launch({
  allowedUpdates: [
    "message",
    "edited_message",
    "message_reaction",
    "message_reaction_count",
    "callback_query",
    "chat_member"
  ]
});

console.log("🤖 Bot đang chạy...");

// =========================================================
// ============== ĐỂ BOT KHÔNG TẮT KHI SERVER TẮT ==========
// =========================================================

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
