require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// =========================================================
// TAG → GROUP
// =========================================================
const TAG_GROUPS = {
  "#st": ["-1003132769814"],
  "#t": ["-1003316340895"],
  "#nhi": ["-1003469624013"],
  "#danh": ["-1003450550142"],
  "#phong": ["-1003026738578"],
  "#cn": ["-1003223915676"],
  "#hq": ["-1003374674088"],
  "#dl": ["-5025654332"],
  "#xinnghi": ["-4985569408"],
  "#baocao": ["-5060706783"],
  "#giahq": ["-5250242593"],
  "#hoihq": ["-1003788218121"],
  
  "#hanh": ["-1003469624013", "-1003450550142"],
  "#hanh21": ["-504106278", "-505027204"]
};

const ADMINS = [1696923084, 6280099511];
const GROUP_REPLY_MAP = {};

// =========================================================
// PARSE INPUT
// =========================================================
function parseInput(text) {
  const weightMatch = text.match(/(\d+)\s*g/i);
    const priceMatch = text.match(/(\d+(\.\d+)?)\s*t/i); // 👈 FIX
  const linkMatch = text.match(/https:\/\/detail\.1688\.com\/\S+/);

  if (!weightMatch || !priceMatch || !linkMatch) return null;

  return {
    weight: parseFloat(weightMatch[1]),
    x: parseFloat(priceMatch[1]),
    link: linkMatch[0]
  };
}

// =========================================================
// CÔNG THỨC
// =========================================================


  // Trả về kết quả cuối cùng


function isSpecialCase(weight, x) {
  return (
    (x < 8 && weight < 100) ||
    (x < 7 && weight >= 100 && weight <= 200)
  );
}
function getConstantHqtt(weightKg) {
  // Nhóm nhẹ
  if (weightKg <= 0.4) return 625;
  if (weightKg <= 1.0) return 650;
  
  // Nhóm trung bình (Dựa trên ảnh 2)
  if (weightKg <= 1.1) return 775;
  if (weightKg <= 1.2) return 800;
  if (weightKg <= 1.3) return 825;
  if (weightKg <= 1.4) return 850;
  if (weightKg <= 1.5) return 900;
  if (weightKg <= 1.6) return 950;
  if (weightKg <= 1.7) return 975;

  // Nhóm nặng (Dựa trên ảnh 1)
  if (weightKg <= 1.8) return 1000;
  if (weightKg <= 1.9) return 1050;
  if (weightKg <= 3.0) return 1150;
  if (weightKg <= 3.2) return 1200; // Mốc 3,1 - 3,2
  if (weightKg <= 3.3) return 1225;
  if (weightKg <= 3.4) return 1250;
  if (weightKg <= 3.5) return 1300;

  return null; // Quá 3.5kg
}
function calculateCombos(weightPerUnit, x, isSpecial, isHqtt = false) {
  const results = [];

  for (let i = 1; i <= 5; i++) {
    // n là tổng số lượng sản phẩm (Ví dụ combo 2+2 thì n = 4)
    const n = isSpecial ? i * 2 : i;
    
    // Logic cộng phí đóng gói: 2 combo đầu +50g, còn lại +100g
    const packagingFee = (i <= 2) ? 50 : 100;
    const totalWeightGram = (weightPerUnit * n) + packagingFee; 
    
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
      price: price
    });
  }
  return results;
}

function getConstantOld(weightKg) {
  if (weightKg <= 0) return null;
  // Copy toàn bộ logic "if (weightKg <= 0.03) constant = 590..." từ hàm getPriceByWeight cũ của bạn vào đây
  // Chỉ return về con số (ví dụ: return 590), không tính toán (25*x...)/17 ở đây.
  // ... (Phần logic if/else hằng số cũ của bạn) ...
 if (weightKg <= 0.03) return 590;
  if (weightKg <= 0.06) return 605;
  if (weightKg <= 0.09) return 620;
  if (weightKg <= 0.12) return 635;
  if (weightKg <= 0.15) return 650;
  if (weightKg <= 0.18) return 665;
  if (weightKg <= 0.21) return 680;
  if (weightKg <= 0.24) return 695;
  if (weightKg <= 0.27) return 710;
  if (weightKg <= 0.30) return 725;
  if (weightKg <= 0.33) return 740;
  if (weightKg <= 0.36) return 755;
  if (weightKg <= 0.39) return 770;
  if (weightKg <= 0.42) return 785;
  if (weightKg <= 0.45) return 800;
  if (weightKg <= 0.48) return 815;
  if (weightKg <= 0.51) return 830;
  if (weightKg <= 0.54) return 845;
  if (weightKg <= 0.57) return 860;
  if (weightKg <= 0.60) return 875;
  if (weightKg <= 0.63) return 890;
  if (weightKg <= 0.66) return 905;
  if (weightKg <= 0.69) return 920;
  if (weightKg <= 0.72) return 935;
  if (weightKg <= 0.75) return 950;
  if (weightKg <= 0.78) return 965;
  if (weightKg <= 0.81) return 980;
  if (weightKg <= 0.84) return 995;
  if (weightKg <= 0.87) return 1010;
  if (weightKg <= 0.90) return 1025;
  if (weightKg <= 0.93) return 1040;
  if (weightKg <= 0.96) return 1055;
  if (weightKg <= 1.00) return 1075;

  // --- NHÓM 1kg - 2kg ---
  if (weightKg <= 1.03) return 1090;
  if (weightKg <= 1.06) return 1105;
  if (weightKg <= 1.09) return 1120;
  if (weightKg <= 1.12) return 1135;
  if (weightKg <= 1.15) return 1150;
  if (weightKg <= 1.18) return 1165;
  if (weightKg <= 1.21) return 1180;
  if (weightKg <= 1.24) return 1195;
  if (weightKg <= 1.27) return 1210;
  if (weightKg <= 1.30) return 1225;
  if (weightKg <= 1.33) return 1240;
  if (weightKg <= 1.36) return 1255;
  if (weightKg <= 1.39) return 1270;
  if (weightKg <= 1.42) return 1285;
  if (weightKg <= 1.45) return 1300;
  if (weightKg <= 1.48) return 1315;
  if (weightKg <= 1.51) return 1330;
  if (weightKg <= 1.54) return 1345;
  if (weightKg <= 1.57) return 1360;
  if (weightKg <= 1.60) return 1375;
  if (weightKg <= 1.63) return 1390;
  if (weightKg <= 1.66) return 1405;
  if (weightKg <= 1.69) return 1420;
  if (weightKg <= 1.72) return 1435;
  if (weightKg <= 1.75) return 1450;
  if (weightKg <= 1.78) return 1465;
  if (weightKg <= 1.81) return 1480;
  if (weightKg <= 1.84) return 1495;
  if (weightKg <= 1.87) return 1510;
  if (weightKg <= 1.90) return 1525;
  if (weightKg <= 1.93) return 1540;
  if (weightKg <= 1.96) return 1555;
  if (weightKg <= 2.00) return 1575;

  // --- NHÓM 2kg - 3kg ---
  if (weightKg <= 2.03) return 1590;
  if (weightKg <= 2.06) return 1605;
  if (weightKg <= 2.09) return 1620;
  if (weightKg <= 2.12) return 1635;
  if (weightKg <= 2.15) return 1650;
  if (weightKg <= 2.18) return 1665;
  if (weightKg <= 2.21) return 1680;
  if (weightKg <= 2.24) return 1695;
  if (weightKg <= 2.27) return 1710;
  if (weightKg <= 2.30) return 1725;
  if (weightKg <= 2.33) return 1740;
  if (weightKg <= 2.36) return 1755;
  if (weightKg <= 2.39) return 1770;
  if (weightKg <= 2.42) return 1785;
  if (weightKg <= 2.45) return 1800;
  if (weightKg <= 2.48) return 1815;
  if (weightKg <= 2.51) return 1830;
  if (weightKg <= 2.54) return 1845;
  if (weightKg <= 2.57) return 1860;
  if (weightKg <= 2.60) return 1875;
  if (weightKg <= 2.63) return 1890;
  if (weightKg <= 2.66) return 1905;
  if (weightKg <= 2.69) return 1920;
  if (weightKg <= 2.72) return 1935;
  if (weightKg <= 2.75) return 1950;
  if (weightKg <= 2.78) return 1965;
  if (weightKg <= 2.81) return 1980;
  if (weightKg <= 2.84) return 1995;
  if (weightKg <= 2.87) return 2010;
  if (weightKg <= 2.90) return 2025;
  if (weightKg <= 2.93) return 2040;
  if (weightKg <= 2.96) return 2055;
  if (weightKg <= 3.00) return 2075;
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
  table += "-".repeat(col1 + col2 + col3 ) + "\n";

  table +=
    centerText("Combo", col1) + "|" +
    centerText("Giá", col2) + "|" +
    centerText("Cân nặng", col3) + "\n";

  table += "-".repeat(col1 + col2 + col3 ) + "\n";

  combos.forEach((c) => {
    table +=
      centerText(c.label, col1) + "|" +
      centerText(c.price, col2) + "|" +
      centerText(c.totalWeight + "g", col3) + "\n";
  });

  table += "-".repeat(col1 + col2 + col3 );

  return table;
}

// =========================================================
// GỬI GIÁ (HIỆN TÊN + LINK CLICK)
// =========================================================
async function sendPriceToGroup(ctx, data, combos, photoId,tag) {
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
      caption: fullMessage
    });
    sentMessageInfo.push(m.message_id);
  }

  // gửi lại cho user
  await ctx.telegram.sendPhoto(ctx.chat.id, photoId, {
    caption: fullMessage
  });
  return sentMessageInfo;
}

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
async function sendToGroups(ctx, tag, content, fileType, fileId) {
  const sender = ctx.from;
if (!tag || tag === "#giahq") return;
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
  const text = msg.text || msg.caption || "";
  const lowerText = text.toLowerCase();

  // 1️⃣ PHẢN HỒI TỪ GROUP → GỬI LẠI USER GỐC (Ưu tiên xử lý trước)
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
        return; // Xử lý xong thì thoát
      } catch (err) {
        console.error("❌ Lỗi reply user:", err);
      }
    }
  }

  // 2️⃣ XỬ LÝ TÍNH GIÁ (#giahq, #giahqtt)
  const isGiaNormal = lowerText.includes("#giahq");
  const isGiaHqtt = lowerText.includes("#giahqtt");

  if (isGiaNormal || isGiaHqtt) {
    const currentTag = isGiaHqtt ? "#giahqtt" : "#giahq";
    const data = parseInput(text);

    if (!msg.photo) return ctx.reply("❌ Thiếu ảnh");
    if (!data) return ctx.reply("❌ Sai cú pháp\nVí dụ: #giahq 150g 6t https://detail.1688");

    const special = isSpecialCase(data.weight, data.x);
    const combos = calculateCombos(data.weight, data.x, special, isGiaHqtt);

    if (combos.length === 0) return ctx.reply("❌ Không tính được giá (Vượt quá cân nặng cho phép)");

    const photoId = msg.photo.at(-1).file_id;
    
    // Gọi hàm gửi vào group giahq
    const sentIds = await sendPriceToGroup(ctx, data, combos, photoId,currentTag);
    
    // Lưu vào map để nhận reply
    if (sentIds && Array.isArray(sentIds)) {
      sentIds.forEach(id => {
        GROUP_REPLY_MAP[id] = ctx.from.id;
      });
    }

    return ctx.reply(`✅ Làm giá ${isGiaHqtt ? "HQTT" : "SP"} thành công`);
  }

  // 3️⃣ XỬ LÝ GỬI ẨN DANH THEO CÁC TAG CÒN LẠI
  const tag = Object.keys(TAG_GROUPS).find((t) => lowerText.includes(t));

  // Nếu không có tag nào và cũng không phải là reply/tính giá thì không làm gì cả
  if (!tag) return;

  const cleaned = text.replace(new RegExp(tag, 'gi'), "").trim();

  try {
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
  } catch (err) {
    console.error("❌ Lỗi gửi ẩn danh:", err);
    ctx.reply("❌ Có lỗi xảy ra khi gửi tin nhắn vào nhóm.");
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
// =========================================================
// START
// =========================================================

console.log("🤖 Bot running...");
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));