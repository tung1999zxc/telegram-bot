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
function getPriceByWeight(weight, x) {
  // weight truyền vào tính bằng gram
  let weightKg = weight / 1000;
  let constant = 0;

  if (weightKg <= 0) return null;

  // --- NHÓM 0kg - 1kg ---
  if (weightKg <= 0.03) constant = 590;
  else if (weightKg <= 0.06) constant = 605;
  else if (weightKg <= 0.09) constant = 620;
  else if (weightKg <= 0.12) constant = 635;
  else if (weightKg <= 0.15) constant = 650;
  else if (weightKg <= 0.18) constant = 665;
  else if (weightKg <= 0.21) constant = 680;
  else if (weightKg <= 0.24) constant = 695;
  else if (weightKg <= 0.27) constant = 710;
  else if (weightKg <= 0.30) constant = 725; // Khớp ảnh
  else if (weightKg <= 0.33) constant = 740;
  else if (weightKg <= 0.36) constant = 755;
  else if (weightKg <= 0.39) constant = 770;
  else if (weightKg <= 0.42) constant = 785;
  else if (weightKg <= 0.45) constant = 800;
  else if (weightKg <= 0.48) constant = 815;
  else if (weightKg <= 0.51) constant = 830;
  else if (weightKg <= 0.54) constant = 845;
  else if (weightKg <= 0.57) constant = 860;
  else if (weightKg <= 0.60) constant = 875; // Khớp ảnh
  else if (weightKg <= 0.63) constant = 890;
  else if (weightKg <= 0.66) constant = 905;
  else if (weightKg <= 0.69) constant = 920;
  else if (weightKg <= 0.72) constant = 935;
  else if (weightKg <= 0.75) constant = 950;
  else if (weightKg <= 0.78) constant = 965;
  else if (weightKg <= 0.81) constant = 980;
  else if (weightKg <= 0.84) constant = 995;
  else if (weightKg <= 0.87) constant = 1010;
  else if (weightKg <= 0.90) constant = 1025; // Khớp ảnh
  else if (weightKg <= 0.93) constant = 1040;
  else if (weightKg <= 0.96) constant = 1055;
  else if (weightKg <= 1.00) constant = 1075; // Khớp ảnh (Mốc 1kg)

  // --- NHÓM 1kg - 2kg ---
  else if (weightKg <= 1.03) constant = 1090;
  else if (weightKg <= 1.06) constant = 1105;
  else if (weightKg <= 1.09) constant = 1120;
  else if (weightKg <= 1.12) constant = 1135;
  else if (weightKg <= 1.15) constant = 1150;
  else if (weightKg <= 1.18) constant = 1165;
  else if (weightKg <= 1.21) constant = 1180;
  else if (weightKg <= 1.24) constant = 1195;
  else if (weightKg <= 1.27) constant = 1210;
  else if (weightKg <= 1.30) constant = 1225; // Khớp ảnh
  else if (weightKg <= 1.33) constant = 1240;
  else if (weightKg <= 1.36) constant = 1255;
  else if (weightKg <= 1.39) constant = 1270;
  else if (weightKg <= 1.42) constant = 1285;
  else if (weightKg <= 1.45) constant = 1300;
  else if (weightKg <= 1.48) constant = 1315;
  else if (weightKg <= 1.51) constant = 1330;
  else if (weightKg <= 1.54) constant = 1345;
  else if (weightKg <= 1.57) constant = 1360;
  else if (weightKg <= 1.60) constant = 1375; // Khớp ảnh
  else if (weightKg <= 1.63) constant = 1390;
  else if (weightKg <= 1.66) constant = 1405;
  else if (weightKg <= 1.69) constant = 1420;
  else if (weightKg <= 1.72) constant = 1435;
  else if (weightKg <= 1.75) constant = 1450;
  else if (weightKg <= 1.78) constant = 1465;
  else if (weightKg <= 1.81) constant = 1480;
  else if (weightKg <= 1.84) constant = 1495;
  else if (weightKg <= 1.87) constant = 1510;
  else if (weightKg <= 1.90) constant = 1525; // Khớp ảnh
  else if (weightKg <= 1.93) constant = 1540;
  else if (weightKg <= 1.96) constant = 1555;
  else if (weightKg <= 2.00) constant = 1575; // Khớp ảnh (Mốc 2kg)

  // --- NHÓM 2kg - 3kg ---
  else if (weightKg <= 2.03) constant = 1590;
  else if (weightKg <= 2.06) constant = 1605;
  else if (weightKg <= 2.09) constant = 1620;
  else if (weightKg <= 2.12) constant = 1635;
  else if (weightKg <= 2.15) constant = 1650;
  else if (weightKg <= 2.18) constant = 1665;
  else if (weightKg <= 2.21) constant = 1680;
  else if (weightKg <= 2.24) constant = 1695;
  else if (weightKg <= 2.27) constant = 1710;
  else if (weightKg <= 2.30) constant = 1725; // Khớp ảnh
  else if (weightKg <= 2.33) constant = 1740;
  else if (weightKg <= 2.36) constant = 1755;
  else if (weightKg <= 2.39) constant = 1770;
  else if (weightKg <= 2.42) constant = 1785;
  else if (weightKg <= 2.45) constant = 1800;
  else if (weightKg <= 2.48) constant = 1815;
  else if (weightKg <= 2.51) constant = 1830;
  else if (weightKg <= 2.54) constant = 1845;
  else if (weightKg <= 2.57) constant = 1860;
  else if (weightKg <= 2.60) constant = 1875; // Khớp ảnh
  else if (weightKg <= 2.63) constant = 1890;
  else if (weightKg <= 2.66) constant = 1905;
  else if (weightKg <= 2.69) constant = 1920;
  else if (weightKg <= 2.72) constant = 1935;
  else if (weightKg <= 2.75) constant = 1950;
  else if (weightKg <= 2.78) constant = 1965;
  else if (weightKg <= 2.81) constant = 1980;
  else if (weightKg <= 2.84) constant = 1995;
  else if (weightKg <= 2.87) constant = 2010;
  else if (weightKg <= 2.90) constant = 2025;
  else if (weightKg <= 2.93) constant = 2040;
  else if (weightKg <= 2.96) constant = 2055;
  else if (weightKg <= 3.00) constant = 2075; 
  else {
    return null; // Vượt quá 3kg
  }

  // Trả về kết quả cuối cùng
  return Math.round((25 * x + constant) / 17);
}

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
    const quantity = isSpecial ? i * 2 : i;
    
    // 1. Tính tổng cân nặng của cả combo (đã cộng phí đóng gói 100g)
    const totalWeightGram = (weightPerUnit * quantity) + 100; 
    
    let price;
    if (isHqtt) {
      // Dùng hàm cho HQTT (tra theo kg)
      const constant = getConstantHqtt(totalWeightGram / 1000);
      price = constant ? Math.round((25 * x + constant) / 17) : null;
    } else {
      // Dùng hàm cũ của bạn (truyền gram vào)
      price = getPriceByWeight(totalWeightGram, x);
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
async function sendPriceToGroup(ctx, data, combos, photoId) {
  const sender = ctx.from;
  const senderName =
    `${sender.first_name || ""} ${sender.last_name || ""}`.trim();

  const form =
    
    `👤 Người gửi: ${senderName} (@${sender.username || "no_user"})\n` +
    `🔗 Link: ${data.link}\n` +
    `⚖️ Cân nặng: ${data.weight}g\n` +
    `💰 Giá nhập: ${data.x} tệ\n\n`;

  const table = formatTable(combos);
  const fullMessage = form + table;

let sentMessageInfo = [];
  // gửi group #gia
  for (const groupId of TAG_GROUPS["#giahq"]) {
    await ctx.telegram.sendPhoto(groupId, photoId, {
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
bot.on("message", async (ctx) => {
  const msg = ctx.message;

  // reply
  if (msg.reply_to_message) {
    const repliedId = msg.reply_to_message.message_id;

    if (GROUP_REPLY_MAP[repliedId]) {
      const userId = GROUP_REPLY_MAP[repliedId];

      if (msg.text) {
        await ctx.telegram.sendMessage(userId, `📩 ${msg.text}`);
      }
      return;
    }
  }

  const text = msg.caption || msg.text || "";
const lowerText = text.toLowerCase();
  // ================= #gia =================
  // Kiểm tra xem là loại giá nào
  const isGiaNormal = lowerText.includes("#giahq");
  const isGiaHqtt = lowerText.includes("#giahqtt");

  if (isGiaNormal || isGiaHqtt) {
    const data = parseInput(text);

    if (!msg.photo) return ctx.reply("❌ Thiếu ảnh");
    if (!data) return ctx.reply("❌ Sai cú pháp\nVí dụ: #giahq 150g 6t https://detail.1688");

    const special = isSpecialCase(data.weight, data.x);
    // Truyền thêm biến isGiaHqtt vào đây
    const combos = calculateCombos(data.weight, data.x, special, isGiaHqtt);

    if (combos.length === 0) return ctx.reply("❌ Không tính được giá (Vượt quá cân nặng cho phép)");

    const photoId = msg.photo.at(-1).file_id;
    
    // Gửi phản hồi (tận dụng hàm cũ của bạn)
   const sentIds = await sendPriceToGroup(ctx, data, combos, photoId);
    
    // LƯU VÀO MAP ĐỂ KHI CÓ NGƯỜI REPLY TRONG GROUP THÌ BOT BIẾT GỬI CHO AI
    sentIds.forEach(id => {
      GROUP_REPLY_MAP[id] = ctx.from.id;
    });

    return ctx.reply(`✅ Làm giá ${isGiaHqtt ? "HQTT" : "SP"} thành công`);
  }

  // ================= TAG KHÁC =================
  const tag = Object.keys(TAG_GROUPS).find((t) =>
    text.toLowerCase().includes(t)
  );

  if (!tag || tag === "#giahq") return;

  const cleaned = text.replace(tag, "").trim();

  for (const groupId of TAG_GROUPS[tag]) {
    const m = await ctx.telegram.sendMessage(groupId, cleaned);
    GROUP_REPLY_MAP[m.message_id] = ctx.from.id;
  }

  return ctx.reply("✅ Đã gửi ẩn danh");
});

// =========================================================
// REACTION
// =========================================================

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
// START
// =========================================================
(async () => {
  await bot.telegram.deleteWebhook();
  await bot.launch();

  console.log("🤖 Bot running...");
})();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));