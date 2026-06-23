/* eslint-disable @typescript-eslint/no-require-imports */

require("dotenv").config();

const { randomUUID } = require("node:crypto");
const { Client } = require("pg");

const userId = process.env.MAY_GALAXY_USER_ID;
if (!userId) throw new Error("MAY_GALAXY_USER_ID 환경 변수가 필요합니다.");

const emotions = ["CALM", "HAPPY", "EXCITED", "CALM", "TIRED", "HAPPY", "SAD"];
const colors = {
  HAPPY: "#FFD166",
  CALM: "#7BDFF2",
  SAD: "#B8A1FF",
  ANGRY: "#FF6B6B",
  EXCITED: "#FFAFCC",
  TIRED: "#D9D9D9",
};

function spiralPosition(day) {
  const progress = (day - 1) / 30;
  const angle = progress * Math.PI * 2.8;
  const radius = 220 + progress * 1050;
  return {
    x: Math.round(2425 + Math.cos(angle) * radius),
    y: Math.round(1050 + Math.sin(angle) * radius * 0.62),
  };
}

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const user = await client.query('select id from "User" where id = $1', [userId]);
    if (user.rowCount !== 1) throw new Error("대상 사용자를 찾을 수 없습니다.");

    for (let day = 1; day <= 31; day += 1) {
      const date = new Date(Date.UTC(2026, 4, day));
      const emotion = emotions[(day - 1) % emotions.length];
      const diary = await client.query(
        `insert into "Diary" (id, "userId", title, content, emotion, "diaryDate", "createdAt", "updatedAt")
         values ($1, $2, $3, $4, $5::"Emotion", $6, now(), now())
         on conflict ("userId", "diaryDate") do nothing
         returning id`,
        [randomUUID(), userId, `5월 ${day}일의 기록`, "5월의 하루를 천천히 기록했습니다. 이 별은 2026년 5월의 은하수를 완성합니다.", emotion, date],
      );
      const diaryId = diary.rows[0]?.id ?? (await client.query('select id from "Diary" where "userId" = $1 and "diaryDate" = $2', [userId, date])).rows[0].id;
      const position = spiralPosition(day);
      await client.query(
        `insert into "Star" (id, "userId", "diaryId", x, y, color, emotion, "createdAt", "updatedAt")
         values ($1, $2, $3, $4, $5, $6, $7::"Emotion", now(), now())
         on conflict ("diaryId") do update set x = excluded.x, y = excluded.y, color = excluded.color, emotion = excluded.emotion, "updatedAt" = now()`,
        [randomUUID(), userId, diaryId, position.x, position.y, colors[emotion], emotion],
      );
    }

    await client.query(
      `insert into "Galaxy" (id, "userId", year, month, "isCompleted", "createdAt", "updatedAt")
       values ($1, $2, 2026, 5, true, now(), now())
       on conflict ("userId", year, month) do update set "isCompleted" = true, "updatedAt" = now()`,
      [randomUUID(), userId],
    );
    console.log("2026년 5월의 다이어리와 은하수 데이터를 준비했습니다.");
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
