"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

type SceneStar = { id: string; diaryId: string; title: string; diaryDate: string; color: string; x: number; y: number };
type Galaxy = { id: string; year: number; month: number };

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
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.08, "rgba(225,235,255,.95)");
  gradient.addColorStop(0.28, "rgba(140,180,255,.35)");
  gradient.addColorStop(1, "rgba(80,100,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function createPlanetTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 384;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Texture();
  const ocean = context.createLinearGradient(0, 0, 768, 384);
  ocean.addColorStop(0, "#07102d");
  ocean.addColorStop(0.42, "#155065");
  ocean.addColorStop(0.75, "#103049");
  ocean.addColorStop(1, "#080b22");
  context.fillStyle = ocean;
  context.fillRect(0, 0, 768, 384);
  for (let index = 0; index < 230; index += 1) {
    const x = seededNumber(`land-x-${index}`) * 768;
    const y = seededNumber(`land-y-${index}`) * 384;
    const width = 12 + seededNumber(`land-w-${index}`) * 95;
    const height = 4 + seededNumber(`land-h-${index}`) * 28;
    context.fillStyle = index % 3 === 0 ? "rgba(89,132,106,.48)" : "rgba(41,102,94,.42)";
    context.beginPath();
    context.ellipse(x, y, width, height, seededNumber(`land-r-${index}`) * Math.PI, 0, Math.PI * 2);
    context.fill();
  }
  for (let index = 0; index < 110; index += 1) {
    context.fillStyle = `rgba(210,235,255,${0.025 + seededNumber(`cloud-${index}`) * 0.09})`;
    context.beginPath();
    context.ellipse(seededNumber(`cloud-x-${index}`) * 768, seededNumber(`cloud-y-${index}`) * 384, 35 + seededNumber(`cloud-w-${index}`) * 120, 2 + seededNumber(`cloud-h-${index}`) * 8, 0, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStarField(count: number, spread: number, seed: string, texture: THREE.Texture) {
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
  return new THREE.Points(geometry, new THREE.PointsMaterial({ map: texture, size: 0.24, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending }));
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

export function UniverseScene({ stars, galaxies }: { stars: SceneStar[]; galaxies: Galaxy[] }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(mount.clientWidth, mount.clientHeight), 1.15, 0.85, 0.2));

    const glowTexture = createGlowTexture();
    const planetTexture = createPlanetTexture();
    const universe = new THREE.Group();
    scene.add(universe);
    const farStars = createStarField(2800, 105, "far", glowTexture);
    const nearStars = createStarField(850, 55, "near", glowTexture);
    nearStars.material.size = 0.34;
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
    milkyWay.add(new THREE.Points(milkyGeometry, new THREE.PointsMaterial({ map: glowTexture, size: 0.42, vertexColors: true, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending })));
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
    const planet = new THREE.Mesh(new THREE.SphereGeometry(7.4, 64, 64), new THREE.MeshPhysicalMaterial({ map: planetTexture, roughness: 0.75, metalness: 0.12, clearcoat: 0.15, clearcoatRoughness: 0.7 }));
    planet.position.set(16, -9, -20);
    scene.add(planet);
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(7.62, 64, 64), new THREE.MeshBasicMaterial({ color: "#4bc5ff", transparent: true, opacity: 0.13, side: THREE.BackSide, blending: THREE.AdditiveBlending }));
    atmosphere.position.copy(planet.position);
    scene.add(atmosphere);
    const ring = new THREE.Mesh(new THREE.RingGeometry(9.2, 9.35, 128), new THREE.MeshBasicMaterial({ color: "#9eb8ff", transparent: true, opacity: 0.42, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    ring.position.copy(planet.position);
    ring.rotation.set(0.95, 0.18, -0.12);
    scene.add(ring);

    const diaryStarGeometry = createDiaryStarGeometry();
    const pickableStars: THREE.Object3D[] = [];
    const diaryStars: THREE.Mesh[] = [];
    for (const star of stars) {
      const position = starPosition(star);
      const core = new THREE.Mesh(diaryStarGeometry, new THREE.MeshBasicMaterial({ color: star.color }));
      core.position.copy(position);
      core.rotation.z = seededNumber(`rotation-${star.id}`) * Math.PI * 2;
      core.userData.diaryId = star.diaryId;
      core.userData.title = star.title;
      core.scale.setScalar(0.85 + seededNumber(star.id) * 0.65);
      pickableStars.push(core);
      diaryStars.push(core);
      scene.add(core);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: star.color, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.position.copy(position);
      halo.scale.setScalar(3.2);
      scene.add(halo);
      const light = new THREE.PointLight(star.color, 2.5, 9);
      light.position.copy(position);
      scene.add(light);
    }

    for (const galaxy of galaxies) {
      const points = stars.filter((star) => {
        const date = new Date(star.diaryDate);
        return date.getUTCFullYear() === galaxy.year && date.getUTCMonth() + 1 === galaxy.month;
      }).sort((left, right) => left.diaryDate.localeCompare(right.diaryDate)).map(starPosition);
      if (points.length < 2) continue;
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(Math.max(32, points.length * 14)));
      scene.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "#d0bbff", transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending })));
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered: THREE.Intersection | undefined;
    let yaw = 0;
    let pitch = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let moved = false;
    const setPointer = (event: PointerEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      hovered = raycaster.intersectObjects(pickableStars, false)[0];
      renderer.domElement.style.cursor = hovered ? "pointer" : dragging ? "grabbing" : "grab";
      renderer.domElement.title = hovered?.object.userData.title as string ?? "드래그해서 우주를 둘러보고, 별을 클릭해 기록을 만나보세요";
    };
    const onPointerDown = (event: PointerEvent) => { dragging = true; moved = false; startX = event.clientX; startY = event.clientY; renderer.domElement.setPointerCapture(event.pointerId); setPointer(event); };
    const onPointerMove = (event: PointerEvent) => {
      setPointer(event);
      if (!dragging) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      if (Math.abs(deltaX) + Math.abs(deltaY) > 3) moved = true;
      yaw += deltaX * 0.004;
      pitch = THREE.MathUtils.clamp(pitch + deltaY * 0.003, -0.45, 0.45);
      startX = event.clientX;
      startY = event.clientY;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!moved && hovered?.object.userData.diaryId) router.push(`/diary/${hovered.object.userData.diaryId as string}`);
      dragging = false;
      renderer.domElement.style.cursor = hovered ? "pointer" : "grab";
      renderer.domElement.releasePointerCapture(event.pointerId);
    };
    const onResize = () => { camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight); composer.setSize(mount.clientWidth, mount.clientHeight); };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    window.addEventListener("resize", onResize);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const elapsed = performance.now() * 0.00008;
      camera.position.x = Math.sin(elapsed + yaw) * 4.1;
      camera.position.y = 0.5 + pitch * 8;
      camera.lookAt(0, 0, -4);
      farStars.rotation.y = elapsed * 0.14;
      nearStars.rotation.y = -elapsed * 0.05;
      milkyWay.rotation.y = -0.55 + elapsed * 0.035;
      nebulae.rotation.z = elapsed * 0.018;
      diaryStars.forEach((star, index) => { star.rotation.z += 0.0008 + (index % 3) * 0.00015; });
      planet.rotation.y += 0.00045;
      atmosphere.rotation.y += 0.0006;
      composer.render();
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
        if (object instanceof THREE.Sprite) object.material.dispose();
      });
      glowTexture.dispose();
      planetTexture.dispose();
      composer.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [galaxies, router, stars]);

  return <div ref={mountRef} className="absolute inset-0" />;
}
