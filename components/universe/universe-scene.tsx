"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";

type SceneStar = { id: string; diaryId: string; title: string; diaryDate: string; color: string; x: number; y: number };
type Galaxy = { id: string; year: number; month: number };

function seededNumber(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return ((hash >>> 0) % 10_000) / 10_000;
}

function starPosition(star: SceneStar) {
  return new THREE.Vector3(star.x / 180, -star.y / 180, (seededNumber(star.id) - 0.5) * 10);
}

export function UniverseScene({ stars, galaxies }: { stars: SceneStar[]; galaxies: Galaxy[] }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#02030b", 0.017);
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 31);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-label", "나의 3D 우주. 별을 클릭하면 해당 다이어리를 볼 수 있습니다.");
    renderer.domElement.className = "h-full w-full touch-none";
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight("#8d9dff", 0.7));
    const keyLight = new THREE.PointLight("#b8a1ff", 18, 70);
    keyLight.position.set(-12, 8, 15);
    scene.add(keyLight);

    const random = (index: number) => seededNumber(`sky-${index}`);
    const field = new Float32Array(1800 * 3);
    for (let index = 0; index < 1800; index += 1) {
      field[index * 3] = (random(index) - 0.5) * 150;
      field[index * 3 + 1] = (random(index + 3000) - 0.5) * 100;
      field[index * 3 + 2] = -20 - random(index + 6000) * 120;
    }
    const skyGeometry = new THREE.BufferGeometry();
    skyGeometry.setAttribute("position", new THREE.BufferAttribute(field, 3));
    const sky = new THREE.Points(skyGeometry, new THREE.PointsMaterial({ color: "#d9e6ff", size: 0.11, transparent: true, opacity: 0.8, depthWrite: false }));
    scene.add(sky);

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(4.9, 48, 48),
      new THREE.MeshStandardMaterial({ color: "#182254", roughness: 0.7, metalness: 0.3, emissive: "#080d2c", emissiveIntensity: 1.5 }),
    );
    planet.position.set(15, -9, -16);
    scene.add(planet);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.075, 12, 100), new THREE.MeshBasicMaterial({ color: "#9f87e8", transparent: true, opacity: 0.5 }));
    ring.position.copy(planet.position);
    ring.rotation.x = Math.PI / 2.45;
    scene.add(ring);

    const glowGeometry = new THREE.IcosahedronGeometry(0.42, 2);
    const pickableStars: THREE.Object3D[] = [];
    for (const star of stars) {
      const material = new THREE.MeshBasicMaterial({ color: star.color });
      const glow = new THREE.Mesh(glowGeometry, material);
      glow.position.copy(starPosition(star));
      glow.userData.diaryId = star.diaryId;
      glow.userData.title = star.title;
      glow.scale.setScalar(0.8 + seededNumber(star.id) * 0.6);
      pickableStars.push(glow);
      scene.add(glow);
      const halo = new THREE.PointLight(star.color, 2.2, 7);
      halo.position.copy(glow.position);
      scene.add(halo);
    }

    for (const galaxy of galaxies) {
      const points = stars
        .filter((star) => {
          const date = new Date(star.diaryDate);
          return date.getUTCFullYear() === galaxy.year && date.getUTCMonth() + 1 === galaxy.month;
        })
        .sort((left, right) => left.diaryDate.localeCompare(right.diaryDate))
        .map(starPosition);
      if (points.length < 2) continue;
      const curve = new THREE.CatmullRomCurve3(points);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(Math.max(24, points.length * 12)));
      scene.add(new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: "#b8a1ff", transparent: true, opacity: 0.68 })));
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
    const onResize = () => { camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight); };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    window.addEventListener("resize", onResize);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const elapsed = performance.now() * 0.00012;
      camera.position.x = Math.sin(elapsed + yaw) * 3.5;
      camera.position.y = 1.5 + pitch * 8;
      camera.lookAt(0, 0, -3);
      sky.rotation.y = elapsed * 0.2;
      planet.rotation.y += 0.0008;
      ring.rotation.z += 0.0004;
      renderer.render(scene, camera);
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
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [galaxies, router, stars]);

  return <div ref={mountRef} className="absolute inset-0" />;
}
