"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

type SceneStar = { id: string; diaryId: string; title: string; diaryDate: string; color: string; x: number; y: number };
type Galaxy = { id: string; year: number; month: number };
type HoveredStar = { title: string; diaryDate: string; x: number; y: number };

const dateLabelFormatter = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" });

function seededNumber(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return ((hash >>> 0) % 10_000) / 10_000;
}

function starPosition(star: SceneStar) {
  return new THREE.Vector3(star.x / 180, -star.y / 180, (seededNumber(star.id) - 0.5) * 11);
}

function createGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Texture();
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,.92)");
  gradient.addColorStop(0.06, "rgba(225,235,255,.7)");
  gradient.addColorStop(0.2, "rgba(140,180,255,.18)");
  gradient.addColorStop(1, "rgba(80,100,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function createPlanetSurfaceTexture(seed: string, baseColor: string, gasGiant: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Texture();
  const base = new THREE.Color(baseColor);
  const surfaceGradient = context.createLinearGradient(0, 0, 0, canvas.height);
  surfaceGradient.addColorStop(0, base.clone().offsetHSL(0, -0.08, 0.13).getStyle());
  surfaceGradient.addColorStop(0.5, base.getStyle());
  surfaceGradient.addColorStop(1, base.clone().offsetHSL(0, 0.05, -0.16).getStyle());
  context.fillStyle = surfaceGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (gasGiant) {
    for (let index = 0; index < 20; index += 1) {
      const shade = base.clone().offsetHSL(0, 0, (seededNumber(`${seed}-band-${index}`) - 0.5) * 0.22);
      context.fillStyle = shade.getStyle();
      const y = (index / 20) * canvas.height;
      context.fillRect(0, y, canvas.width, 3 + seededNumber(`${seed}-band-height-${index}`) * 8);
    }
    context.fillStyle = "rgba(30,20,35,.28)";
    context.beginPath();
    context.ellipse(328, 152, 56, 18, -0.16, 0, Math.PI * 2);
    context.fill();
  } else {
    for (let index = 0; index < 38; index += 1) {
      const shade = base.clone().offsetHSL(0, -0.1, (seededNumber(`${seed}-surface-${index}`) - 0.55) * 0.25);
      context.fillStyle = shade.getStyle();
      context.beginPath();
      context.ellipse(seededNumber(`${seed}-surface-x-${index}`) * canvas.width, seededNumber(`${seed}-surface-y-${index}`) * canvas.height, 2 + seededNumber(`${seed}-surface-w-${index}`) * 17, 1 + seededNumber(`${seed}-surface-h-${index}`) * 8, seededNumber(`${seed}-surface-r-${index}`) * Math.PI, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = "rgba(225,240,255,.24)";
    context.fillRect(0, 0, canvas.width, 12);
    context.fillRect(0, canvas.height - 12, canvas.width, 12);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStarField(count: number, spread: number, seed: string) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  for (let index = 0; index < count; index += 1) {
    const radius = spread * (0.25 + seededNumber(`${seed}-r-${index}`) * 0.75);
    const theta = seededNumber(`${seed}-t-${index}`) * Math.PI * 2;
    const phi = Math.acos(1 - seededNumber(`${seed}-p-${index}`) * 2);
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.cos(phi);
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 35;
    color.setHSL(0.55 + seededNumber(`${seed}-c-${index}`) * 0.13, 0.38, 0.62 + seededNumber(`${seed}-l-${index}`) * 0.34);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.14, vertexColors: true, transparent: true, opacity: 0.66, depthWrite: false }));
}

function createDiaryStarGeometry() {
  const shape = new THREE.Shape();
  const outerRadius = 0.62;
  const innerRadius = 0.28;
  for (let index = 0; index < 10; index += 1) {
    const angle = -Math.PI / 2 + index * Math.PI / 5;
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.035, bevelThickness: 0.035 });
  geometry.center();
  return geometry;
}

function createDeepSpaceSector(x: number, y: number) {
  const sector = new THREE.Group();
  const sectorSize = 42;
  const originX = x * sectorSize;
  const originY = y * sectorSize;
  const orbitPivots: THREE.Group[] = [];
  const planetColors = ["#6387bc", "#d6a66a", "#b2728d", "#7c91a9", "#8a76c5", "#6eaa9a"];
  const systemCount = 1 + Math.floor(seededNumber(`system-count-${x}-${y}`) * 2);
  for (let systemIndex = 0; systemIndex < systemCount; systemIndex += 1) {
    const systemX = originX + 5 + seededNumber(`system-x-${x}-${y}-${systemIndex}`) * (sectorSize - 10);
    const systemY = originY + 5 + seededNumber(`system-y-${x}-${y}-${systemIndex}`) * (sectorSize - 10);
    const systemZ = -10 - seededNumber(`system-z-${x}-${y}-${systemIndex}`) * 14;
    const sunColor = new THREE.Color().setHSL(0.06 + seededNumber(`sun-color-${x}-${y}-${systemIndex}`) * 0.1, 0.85, 0.65);
    const sunSize = 0.48 + seededNumber(`sun-size-${x}-${y}-${systemIndex}`) * 0.72;
    const sun = new THREE.Mesh(new THREE.SphereGeometry(sunSize, 32, 32), new THREE.MeshStandardMaterial({ color: sunColor, roughness: 0.62, metalness: 0.05 }));
    sun.position.set(systemX, systemY, systemZ);
    sector.add(sun);
    const sunlight = new THREE.PointLight(sunColor, 3.2, 18);
    sunlight.position.copy(sun.position);
    sector.add(sunlight);
    const planetCount = 2 + Math.floor(seededNumber(`planet-count-${x}-${y}-${systemIndex}`) * 4);
    for (let planetIndex = 0; planetIndex < planetCount; planetIndex += 1) {
      const orbit = new THREE.Group();
      orbit.position.copy(sun.position);
      orbit.rotation.x = 0.2 + seededNumber(`orbit-tilt-${x}-${y}-${systemIndex}-${planetIndex}`) * 0.5;
      orbit.rotation.z = seededNumber(`orbit-phase-${x}-${y}-${systemIndex}-${planetIndex}`) * Math.PI * 2;
      const orbitRadius = 2.1 + planetIndex * 1.25 + seededNumber(`orbit-radius-${x}-${y}-${systemIndex}-${planetIndex}`) * 0.7;
      const planetSize = 0.24 + seededNumber(`planet-size-${x}-${y}-${systemIndex}-${planetIndex}`) * 0.5;
      const color = planetColors[Math.floor(seededNumber(`planet-color-${x}-${y}-${systemIndex}-${planetIndex}`) * planetColors.length)];
      const gasGiant = planetSize > 0.31 || seededNumber(`planet-type-${x}-${y}-${systemIndex}-${planetIndex}`) > 0.72;
      const surfaceTexture = createPlanetSurfaceTexture(`planet-${x}-${y}-${systemIndex}-${planetIndex}`, color, gasGiant);
      const planet = new THREE.Mesh(new THREE.SphereGeometry(planetSize, 24, 24), new THREE.MeshPhysicalMaterial({ map: surfaceTexture, roughness: gasGiant ? 0.48 : 0.84, metalness: 0.03, clearcoat: gasGiant ? 0.12 : 0.02 }));
      planet.position.x = orbitRadius;
      planet.userData.rotationSpeed = 0.0009 + seededNumber(`planet-spin-${x}-${y}-${systemIndex}-${planetIndex}`) * 0.0014;
      orbit.add(planet);
      if (!gasGiant) {
        const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(planetSize * 1.035, 32, 32), new THREE.MeshPhongMaterial({ color: "#b8e8ff", transparent: true, opacity: 0.075, side: THREE.BackSide }));
        planet.add(atmosphere);
      }
      if (seededNumber(`planet-ring-${x}-${y}-${systemIndex}-${planetIndex}`) > 0.77) {
        const planetRing = new THREE.Mesh(new THREE.RingGeometry(planetSize * 1.45, planetSize * 2.25, 32), new THREE.MeshBasicMaterial({ color: "#d9d0bd", transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
        planetRing.rotation.x = Math.PI / 2.8;
        planet.add(planetRing);
      }
      if (seededNumber(`planet-moon-${x}-${y}-${systemIndex}-${planetIndex}`) > 0.58) {
        const moonPivot = new THREE.Group();
        const moon = new THREE.Mesh(new THREE.SphereGeometry(planetSize * 0.22, 16, 16), new THREE.MeshStandardMaterial({ color: "#a7a2ad", roughness: 0.9 }));
        moon.position.x = planetSize * 2.1;
        moonPivot.add(moon);
        planet.add(moonPivot);
        moonPivot.userData.rotationSpeed = 0.0018;
      }
      sector.add(orbit);
      orbitPivots.push(orbit);
    }
  }
  sector.userData.orbitPivots = orbitPivots;
  return sector;
}

function disposeDeepSpaceSector(sector: THREE.Group) {
  sector.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        const texturedMaterial = material as THREE.MeshStandardMaterial;
        texturedMaterial.map?.dispose();
        material.dispose();
      });
    }
    if (object instanceof THREE.Sprite) object.material.dispose();
  });
}

export function UniverseScene({ stars, galaxies, year }: { stars: SceneStar[]; galaxies: Galaxy[]; year: number }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const galaxyFocusRef = useRef<{ year: number; month: number } | null>(null);
  const router = useRouter();
  const [hoveredStar, setHoveredStar] = useState<HoveredStar | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const navigationYear = year;
  const completedMonths = new Set(galaxies.filter((galaxy) => galaxy.year === navigationYear).map((galaxy) => galaxy.month));

  function focusGalaxy(month: number) {
    if (!completedMonths.has(month)) return;
    galaxyFocusRef.current = { year: navigationYear, month };
    setSelectedMonth(month);
  }

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#01020a");
    scene.fog = new THREE.FogExp2("#01020a", 0.012);
    const camera = new THREE.PerspectiveCamera(52, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 0.5, 32);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.setAttribute("aria-label", "나의 3D 우주. 별을 클릭하면 해당 다이어리를 볼 수 있습니다.");
    renderer.domElement.className = "h-full w-full touch-none";
    mount.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(mount.clientWidth, mount.clientHeight), 0.36, 0.5, 0.58));

    const glowTexture = createGlowTexture();
    const universe = new THREE.Group();
    scene.add(universe);
    const farStars = createStarField(2800, 105, "far");
    const nearStars = createStarField(850, 55, "near");
    nearStars.material.size = 0.2;
    universe.add(farStars, nearStars);

    const milkyWay = new THREE.Group();
    const milkyPositions = new Float32Array(2200 * 3);
    const milkyColors = new Float32Array(2200 * 3);
    const milkyColor = new THREE.Color();
    for (let index = 0; index < 2200; index += 1) {
      const angle = seededNumber(`milky-angle-${index}`) * Math.PI * 2;
      const radius = 12 + seededNumber(`milky-radius-${index}`) * 54;
      milkyPositions[index * 3] = Math.cos(angle) * radius;
      milkyPositions[index * 3 + 1] = (seededNumber(`milky-height-${index}`) - 0.5) * (2 + radius * 0.055);
      milkyPositions[index * 3 + 2] = Math.sin(angle) * radius - 28;
      milkyColor.setHSL(0.62 + seededNumber(`milky-color-${index}`) * 0.1, 0.5, 0.55 + seededNumber(`milky-light-${index}`) * 0.35);
      milkyColors[index * 3] = milkyColor.r;
      milkyColors[index * 3 + 1] = milkyColor.g;
      milkyColors[index * 3 + 2] = milkyColor.b;
    }
    const milkyGeometry = new THREE.BufferGeometry();
    milkyGeometry.setAttribute("position", new THREE.BufferAttribute(milkyPositions, 3));
    milkyGeometry.setAttribute("color", new THREE.BufferAttribute(milkyColors, 3));
    milkyWay.add(new THREE.Points(milkyGeometry, new THREE.PointsMaterial({ size: 0.22, vertexColors: true, transparent: true, opacity: 0.25, depthWrite: false })));
    milkyWay.rotation.set(0.45, -0.55, -0.26);
    universe.add(milkyWay);

    const nebulae = new THREE.Group();
    const nebulaPalette = ["#4b2385", "#1e609a", "#9d2b66", "#2d4f9a", "#6930a0"];
    for (let index = 0; index < 18; index += 1) {
      const material = new THREE.SpriteMaterial({ map: glowTexture, color: nebulaPalette[index % nebulaPalette.length], transparent: true, opacity: 0.08 + seededNumber(`nebula-opacity-${index}`) * 0.11, blending: THREE.AdditiveBlending, depthWrite: false });
      const sprite = new THREE.Sprite(material);
      sprite.position.set((seededNumber(`nebula-x-${index}`) - 0.5) * 75, (seededNumber(`nebula-y-${index}`) - 0.5) * 32, -38 - seededNumber(`nebula-z-${index}`) * 30);
      const scale = 15 + seededNumber(`nebula-scale-${index}`) * 22;
      sprite.scale.set(scale * 1.8, scale, 1);
      nebulae.add(sprite);
    }
    universe.add(nebulae);

    scene.add(new THREE.HemisphereLight("#9bb8ff", "#03040e", 1.35));
    const sunlight = new THREE.DirectionalLight("#b8d5ff", 3.6);
    sunlight.position.set(-18, 13, 20);
    scene.add(sunlight);
    const deepSpace = new THREE.Group();
    scene.add(deepSpace);
    const sectors = new Map<string, THREE.Group>();
    const orbitPivots = new Set<THREE.Group>();
    const galaxyTargets = new Map<string, THREE.Vector3>();
    const sectorSize = 42;
    const updateSectors = () => {
      const centerX = Math.round(-deepSpace.position.x / sectorSize);
      const centerY = Math.round(-deepSpace.position.y / sectorSize);
      const wanted = new Set<string>();
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
          const sectorX = centerX + offsetX;
          const sectorY = centerY + offsetY;
          const key = `${sectorX}:${sectorY}`;
          wanted.add(key);
          if (sectors.has(key)) continue;
          const sector = createDeepSpaceSector(sectorX, sectorY);
          sectors.set(key, sector);
          (sector.userData.orbitPivots as THREE.Group[]).forEach((orbit) => orbitPivots.add(orbit));
          deepSpace.add(sector);
        }
      }
      sectors.forEach((sector, key) => {
        if (wanted.has(key)) return;
        (sector.userData.orbitPivots as THREE.Group[]).forEach((orbit) => orbitPivots.delete(orbit));
        deepSpace.remove(sector);
        disposeDeepSpaceSector(sector);
        sectors.delete(key);
      });
    };
    updateSectors();
    const diaryStarGeometry = createDiaryStarGeometry();
    const diaryStarHitGeometry = new THREE.SphereGeometry(0.72, 12, 12);
    const diaryStarHitMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const pickableStars: THREE.Object3D[] = [];
    const diaryStars: THREE.Mesh[] = [];
    const diaryHalos: THREE.Sprite[] = [];
    for (const star of stars) {
      const position = starPosition(star);
      const core = new THREE.Mesh(diaryStarGeometry, new THREE.MeshBasicMaterial({ color: star.color }));
      core.position.copy(position);
      core.rotation.z = seededNumber(`rotation-${star.id}`) * Math.PI * 2;
      core.userData.diaryId = star.diaryId;
      core.userData.title = star.title;
      core.userData.diaryDate = star.diaryDate;
      core.userData.baseScale = 0.8 + seededNumber(star.id) * 0.5;
      core.scale.setScalar(core.userData.baseScale as number);
      pickableStars.push(core);
      diaryStars.push(core);
      deepSpace.add(core);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: star.color, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.position.copy(position);
      halo.userData.baseScale = 1.55;
      halo.scale.setScalar(halo.userData.baseScale as number);
      diaryHalos.push(halo);
      deepSpace.add(halo);
      const hitArea = new THREE.Mesh(diaryStarHitGeometry, diaryStarHitMaterial);
      hitArea.position.copy(position);
      hitArea.userData.diaryId = star.diaryId;
      hitArea.userData.title = star.title;
      hitArea.userData.diaryDate = star.diaryDate;
      pickableStars.push(hitArea);
      deepSpace.add(hitArea);
      const light = new THREE.PointLight(star.color, 2.5, 9);
      light.position.copy(position);
      deepSpace.add(light);
    }

    for (const galaxy of galaxies) {
      const points = stars.filter((star) => {
        const date = new Date(star.diaryDate);
        return date.getUTCFullYear() === galaxy.year && date.getUTCMonth() + 1 === galaxy.month;
      }).sort((left, right) => left.diaryDate.localeCompare(right.diaryDate)).map(starPosition);
      if (points.length < 2) continue;
      const curve = new THREE.CatmullRomCurve3(points);
      const center = points.reduce((total, point) => total.add(point), new THREE.Vector3()).multiplyScalar(1 / points.length);
      galaxyTargets.set(`${galaxy.year}-${galaxy.month}`, center);
      const ribbon = new THREE.Mesh(
        new THREE.TubeGeometry(curve, Math.max(80, points.length * 7), 0.065, 8, false),
        new THREE.MeshBasicMaterial({ color: "#b8a1ff", transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      deepSpace.add(ribbon);

      const dustPositions = new Float32Array(520 * 3);
      const sampled = curve.getPoints(180);
      for (let index = 0; index < 520; index += 1) {
        const base = sampled[Math.floor(seededNumber(`${galaxy.id}-dust-path-${index}`) * sampled.length)];
        dustPositions[index * 3] = base.x + (seededNumber(`${galaxy.id}-dust-x-${index}`) - 0.5) * 1.5;
        dustPositions[index * 3 + 1] = base.y + (seededNumber(`${galaxy.id}-dust-y-${index}`) - 0.5) * 0.72;
        dustPositions[index * 3 + 2] = base.z + (seededNumber(`${galaxy.id}-dust-z-${index}`) - 0.5) * 1.6;
      }
      const dustGeometry = new THREE.BufferGeometry();
      dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
      deepSpace.add(new THREE.Points(dustGeometry, new THREE.PointsMaterial({ size: 0.065, color: "#d8ccff", transparent: true, opacity: 0.45, depthWrite: false })));
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered: THREE.Intersection | undefined;
    let zoom = 32;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let moved = false;
    let focusedDiaryId: string | null = null;
    const setPointer = (event: PointerEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      hovered = raycaster.intersectObjects(pickableStars, false)[0];
      renderer.domElement.style.cursor = hovered ? "pointer" : dragging ? "grabbing" : "grab";
      const diaryId = hovered?.object.userData.diaryId as string | undefined;
      if (diaryId !== focusedDiaryId) {
        focusedDiaryId = diaryId ?? null;
        setHoveredStar(hovered ? {
          title: hovered.object.userData.title as string,
          diaryDate: hovered.object.userData.diaryDate as string,
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        } : null);
      }
      renderer.domElement.title = hovered ? `${dateLabelFormatter.format(new Date(hovered.object.userData.diaryDate as string))} · ${hovered.object.userData.title as string}` : "드래그해서 우주를 둘러보고, 별을 클릭해 기록을 만나보세요";
    };
    const onPointerDown = (event: PointerEvent) => { dragging = true; moved = false; startX = event.clientX; startY = event.clientY; renderer.domElement.setPointerCapture(event.pointerId); setPointer(event); };
    const onPointerMove = (event: PointerEvent) => {
      setPointer(event);
      if (!dragging) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      if (Math.abs(deltaX) + Math.abs(deltaY) > 3) moved = true;
      deepSpace.position.x += deltaX * 0.05;
      deepSpace.position.y -= deltaY * 0.05;
      updateSectors();
      startX = event.clientX;
      startY = event.clientY;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!moved && hovered?.object.userData.diaryId) router.push(`/diary/${hovered.object.userData.diaryId as string}`);
      dragging = false;
      renderer.domElement.style.cursor = hovered ? "pointer" : "grab";
      renderer.domElement.releasePointerCapture(event.pointerId);
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoom = THREE.MathUtils.clamp(zoom + event.deltaY * 0.018, 15, 58);
    };
    const onResize = () => { camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight); composer.setSize(mount.clientWidth, mount.clientHeight); };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const elapsed = performance.now() * 0.00008;
      const focusRequest = galaxyFocusRef.current;
      if (focusRequest) {
        const target = galaxyTargets.get(`${focusRequest.year}-${focusRequest.month}`);
        if (target) {
          deepSpace.position.x += (-target.x - deepSpace.position.x) * 0.06;
          deepSpace.position.y += (-target.y - deepSpace.position.y) * 0.06;
          updateSectors();
          if (Math.hypot(target.x + deepSpace.position.x, target.y + deepSpace.position.y) < 0.08) galaxyFocusRef.current = null;
        }
      }
      camera.position.z += (zoom - camera.position.z) * 0.08;
      camera.lookAt(0, 0, -4);
      farStars.rotation.y = elapsed * 0.14;
      nearStars.rotation.y = -elapsed * 0.05;
      milkyWay.rotation.y = -0.55 + elapsed * 0.035;
      nebulae.rotation.z = elapsed * 0.018;
      const closeScale = THREE.MathUtils.clamp((camera.position.z - 10) / 22, 0.5, 1);
      diaryStars.forEach((star, index) => {
        star.rotation.z += 0.0008 + (index % 3) * 0.00015;
        star.scale.setScalar((star.userData.baseScale as number) * closeScale);
      });
      diaryHalos.forEach((halo) => halo.scale.setScalar((halo.userData.baseScale as number) * closeScale));
      let orbitIndex = 0;
      orbitPivots.forEach((orbit) => {
        orbit.rotation.z += 0.0007 + (orbitIndex % 5) * 0.00013;
        const planet = orbit.children.find((child) => child instanceof THREE.Mesh);
        if (planet) {
          planet.rotation.y += planet.userData.rotationSpeed as number;
          planet.children.forEach((child) => {
            if (child instanceof THREE.Group) child.rotation.y += child.userData.rotationSpeed as number;
          });
        }
        orbitIndex += 1;
      });
      composer.render();
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            const texturedMaterial = material as THREE.MeshStandardMaterial;
            texturedMaterial.map?.dispose();
            material.dispose();
          });
        }
        if (object instanceof THREE.Sprite) object.material.dispose();
      });
      glowTexture.dispose();
      composer.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [galaxies, router, stars]);

  return (
    <div className="absolute inset-0">
      <div ref={mountRef} className="absolute inset-0" />
      {hoveredStar && (
        <div
          className="pointer-events-none absolute z-20 max-w-56 -translate-y-full rounded-xl border border-white/15 bg-[#0a0d22]/90 px-3 py-2 text-left shadow-xl backdrop-blur-md"
          style={{ left: hoveredStar.x + 14, top: hoveredStar.y - 10 }}
        >
          <p className="text-xs font-medium text-[#ffd166]">{dateLabelFormatter.format(new Date(hoveredStar.diaryDate))}</p>
          <p className="mt-0.5 truncate text-xs text-white">{hoveredStar.title}</p>
        </div>
      )}
      <nav aria-label="은하수 월 이동" className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#080b20]/70 p-2 shadow-2xl backdrop-blur-xl sm:right-4">
        <p className="px-2 pb-2 text-center text-[10px] font-medium tracking-[0.16em] text-[#9fb4ff]">{navigationYear}</p>
        <div className="space-y-1">
          {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => {
            const completed = completedMonths.has(month);
            return (
              <button
                key={month}
                type="button"
                disabled={!completed}
                onClick={() => focusGalaxy(month)}
                title={completed ? `${navigationYear}년 ${month}월의 은하수로 이동` : `${month}월 은하수는 아직 완성되지 않았습니다`}
                className={`flex h-7 w-9 items-center justify-center rounded-lg text-xs transition ${completed ? "text-[#f4eaff] hover:bg-[#b8a1ff]/25 hover:text-white" : "cursor-not-allowed text-white/25"} ${selectedMonth === month ? "bg-[#b8a1ff]/30 text-white shadow-[0_0_18px_rgba(184,161,255,.4)]" : ""}`}
              >
                {month}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
