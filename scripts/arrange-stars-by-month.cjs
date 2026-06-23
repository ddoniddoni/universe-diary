/* eslint-disable @typescript-eslint/no-require-imports */

require("dotenv").config();

const { Client } = require("pg");

const userId = process.env.STAR_ARRANGE_USER_ID;
if (!userId) throw new Error("STAR_ARRANGE_USER_ID 환경 변수가 필요합니다.");

function monthAnchor(month) {
  const angle = -Math.PI / 2 + (month - 1) * (Math.PI * 2 / 12);
  return { x: Math.round(Math.cos(angle) * 2800), y: Math.round(Math.sin(angle) * 2100) };
}

function monthlyPosition(month, index, total) {
  const anchor = monthAnchor(month);
  const progress = total === 1 ? 0.5 : index / (total - 1);
  const angle = progress * Math.PI * 2.8;
  const radius = 220 + progress * Math.min(1050, 300 + total * 36);
  return { x: Math.round(anchor.x + Math.cos(angle) * radius), y: Math.round(anchor.y + Math.sin(angle) * radius * 0.62) };
}

async function arrange() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const result = await client.query('select s.id, d."diaryDate" from "Star" s join "Diary" d on d.id = s."diaryId" where s."userId" = $1 order by d."diaryDate" asc', [userId]);
    const months = new Map();
    for (const star of result.rows) {
      const date = new Date(star.diaryDate);
      const key = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
      months.set(key, [...(months.get(key) ?? []), star]);
    }
    for (const [key, stars] of months) {
      const month = Number(key.split("-")[1]);
      for (const [index, star] of stars.entries()) {
        const position = monthlyPosition(month, index, stars.length);
        await client.query('update "Star" set x = $1, y = $2, "updatedAt" = now() where id = $3', [position.x, position.y, star.id]);
      }
    }
    console.log("월별 성단 영역으로 별을 재배치했습니다.");
  } finally {
    await client.end();
  }
}

arrange().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
