export const EMOTION_STAR_COLORS = {
  HAPPY: "#FFD166",
  CALM: "#7BDFF2",
  SAD: "#B8A1FF",
  ANGRY: "#FF6B6B",
  EXCITED: "#FFAFCC",
  TIRED: "#D9D9D9",
} as const;

export type EmotionKey = keyof typeof EMOTION_STAR_COLORS;

const MIN_COORDINATE = -3000;
const MAX_COORDINATE = 3000;
const MIN_STAR_DISTANCE = 180;
const MAX_POSITION_ATTEMPTS = 20;

export type StarPosition = {
  x: number;
  y: number;
};

export function getEmotionStarColor(emotion: EmotionKey): string {
  return EMOTION_STAR_COLORS[emotion];
}

export function createStarPosition(existingStars: StarPosition[]): StarPosition {
  let candidate: StarPosition = { x: 0, y: 0 };

  for (let attempt = 0; attempt < MAX_POSITION_ATTEMPTS; attempt += 1) {
    candidate = {
      x: randomCoordinate(),
      y: randomCoordinate(),
    };

    if (existingStars.every((star) => isFarEnough(candidate, star))) {
      return candidate;
    }
  }

  return candidate;
}

function randomCoordinate(): number {
  return Math.floor(Math.random() * (MAX_COORDINATE - MIN_COORDINATE + 1)) + MIN_COORDINATE;
}

function isFarEnough(first: StarPosition, second: StarPosition): boolean {
  return Math.hypot(first.x - second.x, first.y - second.y) >= MIN_STAR_DISTANCE;
}
