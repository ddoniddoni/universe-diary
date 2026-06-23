type Star = { id: string; x: number; y: number; diary: { diaryDate: Date } };
type Galaxy = { year: number; month: number };

export function GalaxyLines({ stars, galaxies }: { stars: Star[]; galaxies: Galaxy[] }) {
  return <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">{galaxies.flatMap(galaxy => { const points = stars.filter(star => { const date = star.diary.diaryDate; return date.getUTCFullYear() === galaxy.year && date.getUTCMonth() + 1 === galaxy.month; }).toSorted((a,b) => a.diary.diaryDate.getTime() - b.diary.diaryDate.getTime()); return points.length > 1 ? [<polyline key={`${galaxy.year}-${galaxy.month}`} points={points.map(point => `${500 + point.x / 20},${400 + point.y / 20}`).join(" ")} fill="none" stroke="#B8A1FF" strokeOpacity="0.5" strokeWidth="2" />] : []; })}</svg>;
}
