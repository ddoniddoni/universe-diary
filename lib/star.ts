export const EMOTION_STAR_COLORS = {
  HAPPY: "#F3D7A4",
  CALM: "#A8DDE0",
  SAD: "#B9C4EA",
  ANGRY: "#E1A7A3",
  EXCITED: "#E7BCD2",
  TIRED: "#C7D1DB",
} as const;

export type EmotionKey = keyof typeof EMOTION_STAR_COLORS;

const MIN_COORDINATE = -4200;
const MAX_COORDINATE = 4200;
const MIN_STAR_DISTANCE = 320;
const MAX_POSITION_ATTEMPTS = 20;
const MONTH_REGION_RADIUS_X = 2800;
const MONTH_REGION_RADIUS_Y = 2100;
const MONTH_REGION_SPREAD = 620;

export type StarPosition = {
  x: number;
  y: number;
};

export function getEmotionStarColor(emotion: EmotionKey): string {
  return EMOTION_STAR_COLORS[emotion];
}

export function createStarPosition(existingStars: StarPosition[], diaryDate: Date): StarPosition {
  const anchor = getMonthStarAnchor(diaryDate.getUTCMonth() + 1);
  let candidate: StarPosition = { x: 0, y: 0 };

  for (let attempt = 0; attempt < MAX_POSITION_ATTEMPTS; attempt += 1) {
    candidate = {
      x: randomCoordinate(anchor.x),
      y: randomCoordinate(anchor.y),
    };

    if (existingStars.every((star) => isFarEnough(candidate, star))) {
      return candidate;
    }
  }

  return candidate;
}

export function getMonthStarAnchor(month: number): StarPosition {
  const angle = -Math.PI / 2 + (month - 1) * (Math.PI * 2 / 12);
  return {
    x: Math.round(Math.cos(angle) * MONTH_REGION_RADIUS_X),
    y: Math.round(Math.sin(angle) * MONTH_REGION_RADIUS_Y),
  };
}

function randomCoordinate(anchor: number): number {
  const value = Math.floor(Math.random() * (MONTH_REGION_SPREAD * 2 + 1)) + anchor - MONTH_REGION_SPREAD;
  return Math.max(MIN_COORDINATE, Math.min(MAX_COORDINATE, value));
}

function isFarEnough(first: StarPosition, second: StarPosition): boolean {
  return Math.hypot(first.x - second.x, first.y - second.y) >= MIN_STAR_DISTANCE;
}
