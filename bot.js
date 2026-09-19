require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// =========================================================
// TAG → GROUP
// =========================================================
const TAG_GROUPS = {
  "#st": ["-1003132769814"],
  "#t": ["-1003316340895"],
  "#hanh": ["-1003469624013", "-1003450550142"],
  "#cn": ["-1003223915676"],
  "#xinnghi": ["-4985569408"],
  "#baocao": ["-5060706783"],
  "#giahq": ["-5250242593"],
  "#giavn": ["-5250242593"],
  "#hoihq": ["-1003788218121"],
  "#hoisp": ["-1003855173449", "-5287372938"],
  "#xinAds": ["-1004461793681"],
};

const ADMINS = [1696923084, 6280099511];

const ALBUM_CACHE = new Map();
const GROUP_REPLY_MAP = {};
const GROUP_REPLY_INFO = {};
const PENDING_TAG_MAP = {}; // Lưu tag đang chờ xử lý theo user
// =========================================================
// PARSE INPUT
// =========================================================
bot.use(async (ctx, next) => {
  if (ctx.message && ctx.message.media_group_id) {
    const mgId = ctx.message.media_group_id;
    if (!ALBUM_CACHE.has(mgId)) {
      ALBUM_CACHE.set(mgId, { messages: [], timer: null });
    }
    const album = ALBUM_CACHE.get(mgId);
    album.messages.push(ctx.message);

    if (album.timer) clearTimeout(album.timer);
    album.timer = setTimeout(async () => {
      ctx.album = album.messages; // Đưa toàn bộ album vào ctx để xử lý ở bot.on
      ALBUM_CACHE.delete(mgId);
      await next();
    }, 800); // Đợi 0.8s để đảm bảo nhận đủ ảnh
  } else {
    return next();
  }
});

function parseInput(text) {
  const weightMatch = text.match(/(\d+)\s*g/i);
  const priceMatch = text.match(/(\d+(\.\d+)?)\s*t/i); // 👈 FIX
  const linkMatch = text.match(/https:\/\/detail\.1688\.com\/\S+/);

  if (!weightMatch || !priceMatch || !linkMatch) return null;

  return {
    weight: parseFloat(weightMatch[1]),
    x: parseFloat(priceMatch[1]),
    link: linkMatch[0],
  };
}

// =========================================================
// CÔNG THỨC
// =========================================================

// Trả về kết quả cuối cùng

function isSpecialCase(weight, x) {
  return (x < 8 && weight < 100) || (x < 7 && weight >= 100 && weight <= 200);
}
function getConstantHqtt(weightKg) {
  // Nhóm 1 (0,02 → 0,52 kg, bước 0,05)
  if (weightKg <= 0.02) return 490;
  if (weightKg <= 0.07) return 505;
  if (weightKg <= 0.12) return 520;
  if (weightKg <= 0.17) return 535;
  if (weightKg <= 0.22) return 550;
  if (weightKg <= 0.27) return 565;
  if (weightKg <= 0.32) return 580;
  if (weightKg <= 0.37) return 595;
  if (weightKg <= 0.42) return 610;
  if (weightKg <= 0.47) return 625;
  if (weightKg <= 0.52) return 640;

  // Nhóm 2 (0,57 → 1,02 kg, bước 0,05)
  if (weightKg <= 0.57) return 644;
  if (weightKg <= 0.62) return 648;
  if (weightKg <= 0.67) return 652;
  if (weightKg <= 0.72) return 656;
  if (weightKg <= 0.77) return 660;
  if (weightKg <= 0.82) return 664;
  if (weightKg <= 0.87) return 668;
  if (weightKg <= 0.92) return 672;
  if (weightKg <= 0.97) return 676;
  if (weightKg <= 1.02) return 680;

  // Nhóm 3 (1,07 → 2,02 kg, bước 0,05)
  if (weightKg <= 1.07) return 700;
  if (weightKg <= 1.12) return 720;
  if (weightKg <= 1.17) return 740;
  if (weightKg <= 1.22) return 760;
  if (weightKg <= 1.27) return 780;
  if (weightKg <= 1.32) return 800;
  if (weightKg <= 1.37) return 820;
  if (weightKg <= 1.42) return 840;
  if (weightKg <= 1.47) return 860;
  if (weightKg <= 1.52) return 880;
  if (weightKg <= 1.57) return 900;
  if (weightKg <= 1.62) return 920;
  if (weightKg <= 1.67) return 940;
  if (weightKg <= 1.72) return 960;
  if (weightKg <= 1.77) return 980;
  if (weightKg <= 1.82) return 1000;
  if (weightKg <= 1.87) return 1020;
  if (weightKg <= 1.92) return 1040;
  if (weightKg <= 1.97) return 1060;
  if (weightKg <= 2.02) return 1080;

  // Nhóm 4 (2,07 → 3,02 kg, bước 0,05)
  if (weightKg <= 2.07) return 1100;
  if (weightKg <= 2.12) return 1120;
  if (weightKg <= 2.17) return 1140;
  if (weightKg <= 2.22) return 1160;
  if (weightKg <= 2.27) return 1180;
  if (weightKg <= 2.32) return 1200;
  if (weightKg <= 2.37) return 1220;
  if (weightKg <= 2.42) return 1240;
  if (weightKg <= 2.47) return 1260;
  if (weightKg <= 2.52) return 1280;
  if (weightKg <= 2.57) return 1300;
  if (weightKg <= 2.62) return 1320;
  if (weightKg <= 2.67) return 1340;
  if (weightKg <= 2.72) return 1360;
  if (weightKg <= 2.77) return 1380;
  if (weightKg <= 2.82) return 1400;
  if (weightKg <= 2.87) return 1420;
  if (weightKg <= 2.92) return 1440;
  if (weightKg <= 2.97) return 1460;

  // Nhóm 5 (3,02 → 3,47 kg, bước 0,05)
  if (weightKg <= 3.02) return 1240;
  if (weightKg <= 3.07) return 1260;
  if (weightKg <= 3.12) return 1280;
  if (weightKg <= 3.17) return 1300;
  if (weightKg <= 3.22) return 1320;
  if (weightKg <= 3.27) return 1340;
  if (weightKg <= 3.32) return 1360;
  if (weightKg <= 3.37) return 1380;
  if (weightKg <= 3.42) return 1400;
  if (weightKg <= 3.47) return 1420;

  return null; // Quá 3,47 kg
}
function calculateCombos(weightPerUnit, x, isSpecial, isHqtt = false) {
  const results = [];

  for (let i = 1; i <= (isHqtt ? 3 : 5); i++) {
    // n là tổng số lượng sản phẩm (Ví dụ combo 2+2 thì n = 4)
    const n = isSpecial ? i * 2 : i;

    // Logic cộng phí đóng gói: 2 combo đầu +50g, còn lại +100g
    const packagingFee = i <= 2 ? 50 : 100;
    const totalWeightGram = weightPerUnit * n + packagingFee;

    let price;
    if (isHqtt) {
      const constant = getConstantHqtt(totalWeightGram / 1000);
      // Công thức: (25 * x * n + constant) / 17
      price = constant ? Math.round((25 * x * n + constant) / 17) : null;
    } else {
      // Đối với hàm cũ, ta cần truyền n vào để tính theo công thức mới
      // Nên tôi sẽ tính trực tiếp hằng số ở đây hoặc bạn cập nhật hàm getPriceByWeight
      const constant = getConstantOld(totalWeightGram / 1000);
      price = constant ? Math.round((25 * x * n + constant) / 17) : null;
    }

    if (!price) continue;

    results.push({
      label: isSpecial ? `${i}+${i}` : `${i}`,
      totalWeight: totalWeightGram,
      price: price,
    });
  }
  return results;
}

function getConstantOld(weightKg) {
  if (weightKg <= 0) return null;
  // Bảng giá mới: bước 0.05kg, phủ từ 0.10kg đến 3.00kg.
  // Dưới 0.10kg hoặc trên 3.00kg: trả về null.
  // --- NHÓM 0.10kg - 1.00kg ---
  if (weightKg <= 0.10) return 875;
  if (weightKg <= 0.15) return 880;
  if (weightKg <= 0.20) return 885;
  if (weightKg <= 0.25) return 890;
  if (weightKg <= 0.30) return 895;
  if (weightKg <= 0.35) return 900;
  if (weightKg <= 0.40) return 905;
  if (weightKg <= 0.45) return 910;
  if (weightKg <= 0.50) return 915;
  if (weightKg <= 0.55) return 920;
  if (weightKg <= 0.60) return 925;
  if (weightKg <= 0.65) return 930;
  if (weightKg <= 0.70) return 935;
  if (weightKg <= 0.75) return 940;
  if (weightKg <= 0.80) return 945;
  if (weightKg <= 0.85) return 950;
  if (weightKg <= 0.90) return 955;
  if (weightKg <= 0.95) return 960;
  if (weightKg <= 1.00) return 965;

  // --- NHÓM 1.00kg - 2.00kg ---
  if (weightKg <= 1.05) return 970;
  if (weightKg <= 1.10) return 975;
  if (weightKg <= 1.15) return 1020;
  if (weightKg <= 1.20) return 1065;
  if (weightKg <= 1.25) return 1110;
  if (weightKg <= 1.30) return 1150;
  if (weightKg <= 1.35) return 1200;
  if (weightKg <= 1.40) return 1250;
  if (weightKg <= 1.45) return 1290;
  if (weightKg <= 1.50) return 1325;
  if (weightKg <= 1.55) return 1375;
  if (weightKg <= 1.60) return 1425;
  if (weightKg <= 1.65) return 1465;
  if (weightKg <= 1.70) return 1500;
  if (weightKg <= 1.75) return 1550;
  if (weightKg <= 1.80) return 1600;
  if (weightKg <= 1.85) return 1640;
  if (weightKg <= 1.90) return 1675;
  if (weightKg <= 1.95) return 1725;
  if (weightKg <= 2.00) return 1775;

  // --- NHÓM 2.00kg - 3.00kg ---
  if (weightKg <= 2.05) return 1810;
  if (weightKg <= 2.10) return 1850;
  if (weightKg <= 2.15) return 1900;
  if (weightKg <= 2.20) return 1950;
  if (weightKg <= 2.25) return 1990;
  if (weightKg <= 2.30) return 2025;
  if (weightKg <= 2.35) return 2075;
  if (weightKg <= 2.40) return 2125;
  if (weightKg <= 2.45) return 2165;
  if (weightKg <= 2.50) return 2200;
  if (weightKg <= 2.55) return 2250;
  if (weightKg <= 2.60) return 2300;
  if (weightKg <= 2.65) return 2340;
  if (weightKg <= 2.70) return 2375;
  if (weightKg <= 2.75) return 2438;
  if (weightKg <= 2.80) return 2500;
  if (weightKg <= 2.85) return 2525;
  if (weightKg <= 2.90) return 2550;
  if (weightKg <= 2.95) return 2650;
  if (weightKg <= 3.00) return 2750;
  return null;
}

// =========================================================
// FORMAT BẢNG
// =========================================================
function centerText(text, width) {
  text = String(text);
  const totalPadding = width - text.length;
  const left = Math.floor(totalPadding / 2);
  const right = totalPadding - left;
  return " ".repeat(left) + text + " ".repeat(right);
}
function formatTable(combos) {
  const col1 = 10; // Combo
  const col2 = 12; // Giá
  const col3 = 14; // Cân nặng

  let table = "📊 BẢNG GIÁ\n";
  table += "-".repeat(col1 + col2 + col3) + "\n";

  table +=
    centerText("Combo", col1) +
    "|" +
    centerText("Giá", col2) +
    "|" +
    centerText("Cân nặng", col3) +
    "\n";

  table += "-".repeat(col1 + col2 + col3) + "\n";

  combos.forEach((c) => {
    table +=
      centerText(c.label, col1) +
      "|" +
      centerText(c.price, col2) +
      "|" +
      centerText(c.totalWeight + "g", col3) +
      "\n";
  });

  table += "-".repeat(col1 + col2 + col3);

  return table;
}

// =========================================================
// GỬI GIÁ (HIỆN TÊN + LINK CLICK)
// =========================================================
async function sendPriceToGroup(ctx, data, combos, photoId, tag) {
  const sender = ctx.from;
  const senderName =
    `${sender.first_name || ""} ${sender.last_name || ""}`.trim();

  const form =
    `🏷 Tag: ${tag.toUpperCase()}\n` +
    `👤 Người gửi: ${senderName} (@${sender.username || "no_user"})\n` +
    `🔗 Link: ${data.link}\n` +
    `⚖️ Cân nặng: ${data.weight}g\n` +
    `💰 Giá nhập: ${data.x} tệ\n\n`;

  const table = formatTable(combos);
  const fullMessage = form + table;

  let sentMessageInfo = [];
  // gửi group #gia
  for (const groupId of TAG_GROUPS["#giahq"]) {
    const m = await ctx.telegram.sendPhoto(groupId, photoId, {
      caption: fullMessage,
    });
    sentMessageInfo.push({ chatId: String(m.chat.id), messageId: m.message_id });
  }

  // gửi lại cho user
  await ctx.telegram.sendPhoto(ctx.chat.id, photoId, {
    caption: fullMessage,
  });
  await sendToAdmins(ctx, tag, fullMessage, "photo", photoId);
  return sentMessageInfo;
}

// =========================================================
// HÀM GỬI MENU TAGS
// =========================================================
async function sendTagsMenu(ctx) {
  const tags = Object.keys(TAG_GROUPS);

  // Chia tags thành các hàng, mỗi hàng tối đa 3 button
  const rows = [];
  for (let i = 0; i < tags.length; i += 3) {
    const row = tags.slice(i, i + 3).map((tag) => ({
      text: tag,
      callback_data: `tag_${tag}`,
    }));
    rows.push(row);
  }

  const keyboard = {
    inline_keyboard: rows,
  };

  await ctx.reply(
    "🏷️ <b>CHỌN TAG</b>\n\nNhấn vào tag bên dưới để chèn vào tin nhắn:",
    {
      parse_mode: "HTML",
      reply_markup: keyboard,
    },
  );
}

// =========================================================
// MENU TAG - HIỂN THỊ BUTTON CHỌN TAG
// =========================================================
bot.command(["tags", "tag", "menu"], async (ctx) => {
  await sendTagsMenu(ctx);
});

// =========================================================
// START - MENU CHÍNH
// =========================================================
bot.command("start", async (ctx) => {
  await ctx.reply(
    "🤖 <b>Chào bạn!</b>\n\n" +
      "Bot hỗ trợ chuyển tin nhắn ẩn danh vào các nhóm với tag.\n\n" +
      "📌 <b>Hướng dẫn:</b>\n" +
      "1️⃣ Nhấn nút <b>🏷️ Chọn Tag</b> bên dưới\n" +
      "2️⃣ Chọn tag cần dùng\n" +
      "3️⃣ Gửi ảnh/tin nhắn - bot sẽ tự thêm tag\n\n" +
      "⚡ Hoặc gõ trực tiếp: <code>#st</code> kèm tin nhắn",
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🏷️ Chọn Tag", callback_data: "show_tags" }],
        ],
      },
    },
  );
});

// Xử lý khi nhấn nút "Chọn Tag" trong menu
bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data;

  // Nút hiện menu tags
  if (data === "show_tags") {
    try {
      await ctx.answerCallbackQuery();
    } catch (e) {}

    await ctx.deleteMessage().catch(() => {});
    await sendTagsMenu(ctx);
    return;
  }

  // Xử lý khi nhấn button tag
  if (data && data.startsWith("tag_")) {
    const tag = data.replace("tag_", "");
    const tagUpper = tag.toUpperCase();
    const userId = ctx.from.id;

    // Lưu tag đang chờ xử lý cho user này (có thời hạn 5 phút)
    PENDING_TAG_MAP[userId] = {
      tag: tag,
      time: Date.now(),
    };

    // Trả về tag đã chọn cho người dùng (bỏ alert để tránh lỗi)
    try {
      await ctx.answerCallbackQuery(`Đã chọn: ${tagUpper}`);
    } catch (e) {
      // Bỏ qua lỗi answer callback
    }

    // Xóa message menu tags
    try {
      await ctx.deleteMessage();
    } catch (e) {
      // Không xóa được thì thôi
    }

    // Gửi thông báo hướng dẫn
    await ctx.reply(
      `🏷️ <b>${tagUpper}</b> - Đã chọn!\n\n` +
        `Bây giờ gửi ảnh/tin nhắn muốn chuyển, tôi sẽ tự thêm tag "${tag}" vào.`,
      { parse_mode: "HTML" },
    );

    return;
  }

  // Trả lời callback query khác (nếu có)
  await ctx.answerCallbackQuery();
});

// =========================================================
// GET ID
// =========================================================
bot.command("getid", (ctx) => {
  ctx.reply(`Chat ID: ${ctx.chat.id}`);
});

// =========================================================
// MAIN
// =========================================================

// ================= TAG KHÁC =================
async function sendToAdmins(ctx, tag, content, fileType, fileId) {
  const sender = ctx.from;

  const senderInfo =
    `👤 Người gửi:\n` +
    `• Họ tên: ${sender.first_name || ""} ${sender.last_name || ""}\n` +
    `• Username: @${sender.username || "không có"}\n` +
    `• Chat ID: ${sender.id}`;

  for (const adminId of ADMINS) {
    try {
      switch (fileType) {
        case "text":
          await ctx.telegram.sendMessage(
            adminId,
            `🔍 [${tag}] Tin nhắn gốc:\n${content}\n\n${senderInfo}`,
          );
          break;

        case "photo":
          await ctx.telegram.sendPhoto(adminId, fileId, {
            caption: `🔍 [${tag}] Ảnh gốc\n\n${senderInfo}`,
          });
          break;

        case "document":
          await ctx.telegram.sendDocument(adminId, fileId, {
            caption: `🔍 [${tag}] File gốc\n\n${senderInfo}`,
          });
          break;

        case "voice":
          await ctx.telegram.sendVoice(adminId, fileId, {
            caption: `🔍 [${tag}] Voice gốc\n\n${senderInfo}`,
          });
          break;

        case "sticker":
          await ctx.telegram.sendMessage(
            adminId,
            `🔍 [${tag}] Sticker\n\n${senderInfo}`,
          );
          await ctx.telegram.sendSticker(adminId, fileId);
          break;

        case "video":
          await ctx.telegram.sendVideo(adminId, fileId, {
            caption: `🔍 [${tag}] Video gốc\n\n${senderInfo}`,
          });
          break;

        case "audio":
          await ctx.telegram.sendAudio(adminId, fileId, {
            caption: `🔍 [${tag}] Audio gốc\n\n${senderInfo}`,
          });
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
  const userId = ctx.from.id;

  // Lấy nội dung chữ từ Album hoặc tin nhắn đơn
  let captionText = ctx.album
    ? ctx.album[0].caption || ""
    : msg.text || msg.caption || "";

  // Kiểm tra nếu user đã chọn tag trước đó
  const pendingData = PENDING_TAG_MAP[userId];

  // Nếu có pending tag và còn hạn (5 phút) và tin nhắn KHÔNG chứa tag nào
  if (pendingData && Date.now() - pendingData.time < 5 * 60 * 1000) {
    const lowerText = captionText.toLowerCase();
    const hasAnyTag = Object.keys(TAG_GROUPS).some((t) =>
      lowerText.includes(t.toLowerCase()),
    );

    if (!hasAnyTag) {
      const pendingTag = pendingData.tag;

      // Xóa tag đang chờ
      delete PENDING_TAG_MAP[userId];

      // Thêm tag vào đầu caption
      captionText = `${pendingTag} ${captionText}`;

      // Cập nhật lại caption cho album nếu có
      if (ctx.album && ctx.album[0]) {
        ctx.album[0].caption = captionText;
      }

      console.log(
        `[TAG] Đã thêm tag ${pendingTag} vào tin nhắn của user ${userId}`,
      );
    }
  }

  const lowerText = captionText.toLowerCase();

  // Kiểm tra xem có phải là tin nhắn chỉ có ảnh không (không có text/caption)
  const isMediaOnly =
    !captionText.trim() &&
    (msg.photo ||
      msg.document ||
      msg.video ||
      msg.audio ||
      msg.voice ||
      msg.sticker);

  // Nếu không có tag trong tin nhắn VÀ có pending tag thì đã xử lý ở trên
  // Nếu không có tag và không phải media thì có thể là tin nhắn thường không cần tag

  // --- A. PHẢN HỒI TỪ GROUP VỀ USER (Kèm Trích Dẫn) ---
  if (msg.reply_to_message) {
    // ⭐ Check 1: chỉ xử lý nếu tin nhắn được reply là do BOT gửi
    const repliedFrom = msg.reply_to_message.from;
    if (!repliedFrom || repliedFrom.id !== bot.botInfo.id) {
      // Không phải tin bot gửi (thành viên gõ trực tiếp) → bỏ qua
      return;
    }

    const repliedChatId = String(msg.reply_to_message.chat.id);
    const repliedId = msg.reply_to_message.message_id;
    const replyKey = `${repliedChatId}:${repliedId}`;
    const data = GROUP_REPLY_MAP[replyKey];
    const info = GROUP_REPLY_INFO[replyKey];
    if (data) {
      // Lấy ID người dùng
      const originalUserId = data.userId || data;

      // Lấy thông tin người nhận nếu data là object
      const receiverName =
        data.name || data.fullName || data.username || "Không rõ tên";
      const receiverInfo =
        data.label || `${receiverName} - ID: ${originalUserId}`;

      // Escape HTML để tránh lỗi email/link/ký tự đặc biệt
      const escapeHtml = (text = "") =>
        String(text)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

      // Lấy nội dung tin nhắn cũ để trích dẫn
      const originalContent =
        msg.reply_to_message.text ||
        msg.reply_to_message.caption ||
        "Hình ảnh/Tệp";

      const quote =
        `💬 <b>Tin Nhắn:</b> <i>"${escapeHtml(originalContent.slice(0, 200))}..."</i>\n\n` +
        `─── <b>PHẢN HỒI</b> ───\n`;

      try {
        // 1. TRƯỜNG HỢP PHẢN HỒI BẰNG ALBUM (NHIỀU ẢNH)
        if (ctx.album) {
          const media = ctx.album
            .filter((m) => m.photo)
            .map((m, i) => ({
              type: "photo",
              media: m.photo.at(-1).file_id,
              // Chỉ ảnh đầu tiên mới mang caption trích dẫn
              caption: i === 0 ? quote + escapeHtml(m.caption || "") : "",
              parse_mode: "HTML",
            }));

          if (media.length > 0) {
            await ctx.telegram.sendMediaGroup(originalUserId, media);
          }
        }
        // 2. TRƯỜNG HỢP PHẢN HỒI BẰNG VĂN BẢN (TEXT)
        else if (msg.text) {
          await ctx.telegram.sendMessage(
            originalUserId,
            quote + escapeHtml(msg.text),
            {
              parse_mode: "HTML",
              disable_web_page_preview: true,
            },
          );
        }
        // 3. TRƯỜNG HỢP PHẢN HỒI BẰNG 1 ẢNH ĐƠN
        else if (msg.photo) {
          await ctx.telegram.sendPhoto(
            originalUserId,
            msg.photo.at(-1).file_id,
            {
              caption: quote + escapeHtml(msg.caption || ""),
              parse_mode: "HTML",
            },
          );
        }
        // 4. TRƯỜNG HỢP PHẢN HỒI BẰNG FILE/DOCUMENT
        else if (msg.document) {
          await ctx.telegram.sendDocument(
            originalUserId,
            msg.document.file_id,
            {
              caption: quote + escapeHtml(msg.caption || ""),
              parse_mode: "HTML",
            },
          );
        }
        // 5. TRƯỜNG HỢP PHẢN HỒI BẰNG VOICE
        else if (msg.voice) {
          await ctx.telegram.sendVoice(originalUserId, msg.voice.file_id, {
            caption: quote + escapeHtml(msg.caption || ""),
            parse_mode: "HTML",
          });
        }
        // 6. TRƯỜNG HỢP PHẢN HỒI BẰNG VIDEO
        else if (msg.video) {
          await ctx.telegram.sendVideo(originalUserId, msg.video.file_id, {
            caption: quote + escapeHtml(msg.caption || ""),
            parse_mode: "HTML",
          });
        }
        // 7. TRƯỜNG HỢP PHẢN HỒI BẰNG STICKER
        else if (msg.sticker) {
          await ctx.telegram.sendMessage(originalUserId, quote, {
            parse_mode: "HTML",
          });
          await ctx.telegram.sendSticker(originalUserId, msg.sticker.file_id);
        }
        // 8. CÁC TRƯỜNG HỢP KHÁC
        else {
          await ctx.telegram.copyMessage(
            originalUserId,
            ctx.chat.id,
            msg.message_id,
          );
        }

        await ctx.reply(`✅ Đã gửi phản hồi đến người dùng`, {
          reply_to_message_id: msg.message_id,
        });

        console.log(`↩️ Đã reply user ${originalUserId}`);
        return;
      } catch (err) {
        console.error("❌ Lỗi reply từ Group về User:", err);
        const receiver = info
          ? `${info.name} (${info.username})`
          : `ID: ${originalUserId}`;
        await ctx.reply(
          `❌ Lỗi! Chưa gửi được tin nhắn cho người dùng này.\n👤 Người nhận: ${receiver}`,
          {
            reply_to_message_id: msg.message_id,
          },
        );

        return;
      }
    }
  }

  // --- B. XỬ LÝ TÍNH GIÁ (#giahq, #giahqtt) ---
  const isGiaNormal = lowerText.includes("#giahq");
  const isGiaHqtt = lowerText.includes("#giavn");

  if (isGiaNormal || isGiaHqtt) {
    const currentTag = isGiaHqtt ? "#giavn" : "#giahq";

    let photoId = null;

    if (ctx.album && ctx.album.length > 0) {
      // Nếu là Album, chỉ lấy ảnh của tin nhắn đầu tiên (index 0)
      const firstMsg = ctx.album[0];
      if (firstMsg.photo && firstMsg.photo.length > 0) {
        photoId = firstMsg.photo.at(-1).file_id;
      }
    } else if (msg.photo && msg.photo.length > 0) {
      // Nếu là tin nhắn đơn
      photoId = msg.photo.at(-1).file_id;
    }

    // Kiểm tra nếu cuối cùng vẫn không có ảnh
    if (!photoId) {
      return ctx.reply(
        "❌ Thiếu ảnh sản phẩm hoặc định dạng ảnh không hỗ trợ.",
      );
    }

    const data = parseInput(captionText);

    // Kiểm tra data hợp lệ
    if (!data) {
      console.error("❌ parseInput trả về null cho caption:", captionText);
      return ctx.reply(
        "❌ Không đọc được thông tin từ caption. Vui lòng kiểm tra định dạng: #giahq <cân nặng>g <giá>t <link 1688>",
      );
    }

    const special =
      typeof isSpecialCase === "function"
        ? isSpecialCase(data.weight, data.x)
        : false;
    const combos =
      typeof calculateCombos === "function"
        ? calculateCombos(data.weight, data.x, special, isGiaHqtt)
        : [];

    if (combos.length === 0) return ctx.reply("❌ Không tính được giá.");

    // const photoId = ctx.album ? ctx.album[0].photo.at(-1).file_id : msg.photo.at(-1).file_id;

    const sentIds = await sendPriceToGroup(
      ctx,
      data,
      combos,
      photoId,
      currentTag,
    );
    sentIds.forEach((info) => {
      const key = `${info.chatId}:${info.messageId}`;
      GROUP_REPLY_MAP[key] = ctx.from.id;

      GROUP_REPLY_INFO[key] = {
        name: `${ctx.from.first_name || ""} ${ctx.from.last_name || ""}`.trim(),
        username: ctx.from.username
          ? `@${ctx.from.username}`
          : "không có username",
        id: ctx.from.id,
      };
    });
    return ctx.reply(`✅ Làm giá ${isGiaHqtt ? "HQ" : "SP"} thành công.`);
  }

  // --- C. XỬ LÝ GỬI ẨN DANH (Hỗ trợ Album & Mọi loại file) ---
  // Tìm tag trong tin nhắn
  const foundTag = Object.keys(TAG_GROUPS).find((t) =>
    lowerText.includes(t.toLowerCase()),
  );
  if (!foundTag) {
    // Không có tag, không làm gì
    return;
  }

  const tag = foundTag;
  const targetGroups = TAG_GROUPS[tag];
  const cleanedText = captionText.replace(new RegExp(tag, "gi"), "").trim();

  // Xác định header: #xinAds thì hiện tên người gửi, nhóm khác thì ẩn danh
  const isXinAds = tag.toLowerCase() === "#xinads";
  const senderName = `${ctx.from.first_name || ""} ${ctx.from.last_name || ""}`.trim();
  const senderUsername = ctx.from.username ? `@${ctx.from.username}` : "không có username";

  let header;
  if (isXinAds) {
    header = `📦 [${tag.toUpperCase()}]\n👤 ${senderName} (${senderUsername})\n\n${cleanedText}`;
  } else {
    header = `📦 [${tag.toUpperCase()}]\n${cleanedText}`;
  }

  for (const groupId of targetGroups) {
    try {
      if (ctx.album) {
        const media = ctx.album.map((m, i) => ({
          type: "photo",
          media: m.photo.at(-1).file_id,
          caption: i === 0 ? header : "",
        }));
        const sentAlbum = await ctx.telegram.sendMediaGroup(groupId, media);
        sentAlbum.forEach((m) => {
          const key = `${String(m.chat.id)}:${m.message_id}`;
          GROUP_REPLY_MAP[key] = ctx.from.id;
          GROUP_REPLY_INFO[key] = {
            name: `${ctx.from.first_name || ""} ${ctx.from.last_name || ""}`.trim(),
            username: ctx.from.username
              ? `@${ctx.from.username}`
              : "không có username",
            id: ctx.from.id,
          };
        });
      } else {
        let s;
        if (msg.photo)
          s = await ctx.telegram.sendPhoto(groupId, msg.photo.at(-1).file_id, {
            caption: header,
          });
        else if (msg.document)
          s = await ctx.telegram.sendDocument(groupId, msg.document.file_id, {
            caption: header,
          });
        else if (msg.voice)
          s = await ctx.telegram.sendVoice(groupId, msg.voice.file_id, {
            caption: header,
          });
        else if (msg.video)
          s = await ctx.telegram.sendVideo(groupId, msg.video.file_id, {
            caption: header,
          });
        else if (msg.audio)
          s = await ctx.telegram.sendAudio(groupId, msg.audio.file_id, {
            caption: header,
          });
        else if (msg.sticker) {
          const stickerHeader = isXinAds
            ? `✨ [${tag.toUpperCase()}] ${senderName} (${senderUsername}) gửi sticker:`
            : `✨ [${tag.toUpperCase()}] gửi sticker:`;
          await ctx.telegram.sendMessage(groupId, stickerHeader);
          s = await ctx.telegram.sendSticker(groupId, msg.sticker.file_id);
        } else if (msg.text)
          s = await ctx.telegram.sendMessage(groupId, header);

        if (s) {
          const key = `${String(s.chat.id)}:${s.message_id}`;
          GROUP_REPLY_MAP[key] = ctx.from.id;

          GROUP_REPLY_INFO[key] = {
            name: `${ctx.from.first_name || ""} ${ctx.from.last_name || ""}`.trim(),
            username: ctx.from.username
              ? `@${ctx.from.username}`
              : "không có username",
            id: ctx.from.id,
          };
        }
      }
    } catch (err) {
      console.error(`Lỗi gửi group ${groupId}:`, err);
    }
  }
  let fileType = null;
  let fileId = null;

  if (msg.photo) {
    fileType = "photo";
    fileId = msg.photo.at(-1).file_id;
  } else if (msg.document) {
    fileType = "document";
    fileId = msg.document.file_id;
  } else if (msg.video) {
    fileType = "video";
    fileId = msg.video.file_id;
  } else if (msg.audio) {
    fileType = "audio";
    fileId = msg.audio.file_id;
  } else if (msg.voice) {
    fileType = "voice";
    fileId = msg.voice.file_id;
  } else if (msg.sticker) {
    fileType = "sticker";
    fileId = msg.sticker.file_id;
  } else if (msg.text) {
    fileType = "text";
  }

  await sendToAdmins(ctx, tag, cleanedText, fileType, fileId);

  return ctx
    .reply("✅ Đã chuyển tin nhắn vào nhóm.")
    .then(() => sendTagsMenu(ctx));
});

// =========================================================
// ================ XỬ LÝ REACTION TIN NHẮN =================
// =========================================================

// 🟢 Khi người khác thả hoặc gỡ reaction
bot.on("message_reaction", async (ctx) => {
  const data = ctx.update.message_reaction;

  const chatId = String(data.chat.id);
  const msgId = data.message_id;
  const key = `${chatId}:${msgId}`;
  const originalUserId = GROUP_REPLY_MAP[key];
  if (!originalUserId) return;

  const emojis = data.new_reaction.map((r) => r.emoji).join(", ");

  try {
    await ctx.telegram.sendMessage(
      originalUserId,
      `❤️ Tin nhắn của bạn vừa nhận reaction: ${emojis}`,
    );
  } catch (err) {
    console.error("❌ Lỗi gửi reaction:", err);
  }
});

// 🟢 Khi tổng số reaction thay đổi
bot.on("message_reaction_count", async (ctx) => {
  const data = ctx.update.message_reaction_count;

  const chatId = String(data.chat.id);
  const msgId = data.message_id;
  const key = `${chatId}:${msgId}`;
  const originalUserId = GROUP_REPLY_MAP[key];
  if (!originalUserId) return;

  const summary = data.reactions
    .map((r) => `${r.emoji} (${r.count})`)
    .join(", ");

  try {
    await ctx.telegram.sendMessage(
      originalUserId,
      `💬 Tin nhắn bạn gửi có reaction: ${summary}`,
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
    "chat_member",
  ],
});
// =========================================================
// START
// =========================================================

console.log("🤖 Bot running...");
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
