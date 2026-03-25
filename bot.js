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
  "#gia": ["-5250242593"],

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
  const priceMatch = text.match(/(\d+)\s*t/i);
  const linkMatch = text.match(/https?:\/\/\S+/);

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
  // Chuyển đổi weight từ gram sang kg để so sánh với bảng (0.1, 0.2, ...)
  let weightKg = weight / 1000;

  // Công thức gốc trong ảnh là: 25x + (hằng số)
  // Hằng số bắt đầu từ 625 (tại 0.1kg) và tăng 50 đơn vị cho mỗi 0.1kg
  
  let constant = 0;

  if (weightKg <= 0) return null;

  // Tìm hằng số tương ứng dựa trên các mốc 0.1kg
  // Công thức tổng quát từ ảnh: Hằng số = 625 + (weightKg - 0.1) * 10 * 50
  // Nhưng để chính xác và dễ kiểm soát, ta dùng các mốc:
  
  if (weightKg <= 0.1) constant = 625;
  else if (weightKg <= 0.2) constant = 675;
  else if (weightKg <= 0.3) constant = 725;
  else if (weightKg <= 0.4) constant = 775;
  else if (weightKg <= 0.5) constant = 825;
  else if (weightKg <= 0.6) constant = 875;
  else if (weightKg <= 0.7) constant = 925;
  else if (weightKg <= 0.8) constant = 975;
  else if (weightKg <= 0.9) constant = 1025;
  else if (weightKg <= 1.0) constant = 1075;
  else if (weightKg <= 1.1) constant = 1125;
  else if (weightKg <= 1.2) constant = 1175;
  else if (weightKg <= 1.3) constant = 1225;
  else if (weightKg <= 1.4) constant = 1275;
  else if (weightKg <= 1.5) constant = 1325;
  else if (weightKg <= 1.6) constant = 1375;
  else if (weightKg <= 1.7) constant = 1425;
  else if (weightKg <= 1.8) constant = 1475;
  else if (weightKg <= 1.9) constant = 1525;
  else if (weightKg <= 2.0) constant = 1575;
  else if (weightKg <= 2.1) constant = 1625;
  else if (weightKg <= 2.2) constant = 1675;
  else if (weightKg <= 2.3) constant = 1725;
  else if (weightKg <= 2.4) constant = 1775;
  else if (weightKg <= 2.5) constant = 1825;
  else if (weightKg <= 2.6) constant = 1875;
  else if (weightKg <= 2.7) constant = 1925;
  else if (weightKg <= 2.8) constant = 1975;
  else {
    // Nếu vượt quá 2.8kg, bạn có thể thêm logic hoặc trả về null
    return null; 
  }

  // Trả về kết quả theo công thức (25x + hằng số) / 17
  return Math.round((25 * x + constant) / 17);
}

function isSpecialCase(weight, x) {
  return (
    (x < 8 && weight < 100) ||
    (x < 7 && weight >= 100 && weight <= 200)
  );
}

function calculateCombos(weight, x, isSpecial) {
  const results = [];

  for (let i = 1; i <= 5; i++) {
    const multiplier = isSpecial ? i * 2 : i;
    const totalWeight = weight * multiplier;
    const price = getPriceByWeight(totalWeight, x);

    if (!price) continue;

    results.push({
      label: isSpecial ? `${i}+${i}` : `${i}`,
      totalWeight,
      price
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

  // gửi group #gia
  for (const groupId of TAG_GROUPS["#gia"]) {
    await ctx.telegram.sendPhoto(groupId, photoId, {
      caption: fullMessage
    });
  }

  // gửi lại cho user
  await ctx.telegram.sendPhoto(ctx.chat.id, photoId, {
    caption: fullMessage
  });
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

  // ================= #gia =================
  if (text.includes("#gia")) {
    const data = parseInput(text);

    if (!msg.photo) {
      return ctx.reply("❌ Thiếu ảnh");
    }

    if (!data) {
      return ctx.reply(
        "❌ Sai cú pháp\nVí dụ:\n#gia 150g 6t https://link"
      );
    }

    const special = isSpecialCase(data.weight, data.x);
    const combos = calculateCombos(data.weight, data.x, special);

    if (combos.length === 0) {
      return ctx.reply("❌ Không tính được giá");
    }

    const photoId = msg.photo.at(-1).file_id;

    await sendPriceToGroup(ctx, data, combos, photoId);

    return ctx.reply("✅ Làm giá thành công");
  }

  // ================= TAG KHÁC =================
  const tag = Object.keys(TAG_GROUPS).find((t) =>
    text.toLowerCase().includes(t)
  );

  if (!tag || tag === "#gia") return;

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

  const userId = GROUP_REPLY_MAP[msgId];
  if (!userId) return;

  const emojis = data.new_reaction.map((r) => r.emoji).join(", ");

  await ctx.telegram.sendMessage(
    userId,
    `❤️ Có reaction: ${emojis}`
  );
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