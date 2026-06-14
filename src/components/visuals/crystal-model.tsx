"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface CrystalModelProps {
  level?: string; // e.g. "V1", "V2", "V3", "V4", "V5"
}

export function CrystalModel({ level = "V1" }: CrystalModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Determine colors based on level
    let crystalColor = 0x0ea5e9; // Blue (Default)
    let emissiveColor = 0x064e6b;
    let wireframeColor = 0x14b8a6; // Teal
    let glowColor = 0x6366f1; // Indigo
    let rotationSpeedX = 0.002;
    let rotationSpeedY = 0.005;

    const lvl = level.toUpperCase();
    if (lvl === "V2") {
      crystalColor = 0x14b8a6; // Teal
      emissiveColor = 0x0f766e;
      wireframeColor = 0x0ea5e9;
      glowColor = 0x10b981; // Green
    } else if (lvl === "V3") {
      crystalColor = 0x8b5cf6; // Purple
      emissiveColor = 0x5b21b6;
      wireframeColor = 0xec4899; // Pink
      glowColor = 0x6366f1; // Indigo
      rotationSpeedX = 0.003;
      rotationSpeedY = 0.007;
    } else if (lvl === "V4") {
      crystalColor = 0xec4899; // Pink
      emissiveColor = 0x9d174d;
      wireframeColor = 0xf59e0b; // Amber
      glowColor = 0x8b5cf6;
      rotationSpeedX = 0.004;
      rotationSpeedY = 0.009;
    } else if (lvl === "V5") {
      crystalColor = 0xf59e0b; // Amber/Gold
      emissiveColor = 0x78350f;
      wireframeColor = 0xef4444; // Red
      glowColor = 0xfacc15; // Yellow
      rotationSpeedX = 0.005;
      rotationSpeedY = 0.012;
    }

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Crystal Geometry (Dodecahedron)
    const geometry = new THREE.DodecahedronGeometry(1.5, 0);
    const material = new THREE.MeshPhongMaterial({
      color: crystalColor,
      emissive: emissiveColor,
      specular: 0xffffff,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
      flatShading: true,
    });

    const crystal = new THREE.Mesh(geometry, material);
    scene.add(crystal);

    // Wireframe overlay
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: wireframeColor,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const wireframe = new THREE.Mesh(geometry, wireframeMat);
    crystal.add(wireframe);

    // Inner glow sphere
    const glowGeo = new THREE.SphereGeometry(0.75, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.5,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);

    // Lights
    const dirLight1 = new THREE.PointLight(0xffffff, 1.5, 100);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.PointLight(crystalColor, 1.0, 100);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    scene.add(new THREE.AmbientLight(0x1a1a24));

    let animationFrameId: number;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      crystal.rotation.y += rotationSpeedY;
      crystal.rotation.x += rotationSpeedX;
      
      // Pulse inner glow
      const time = Date.now() * 0.002;
      glow.scale.setScalar(0.95 + Math.sin(time) * 0.08);

      renderer.render(scene, camera);
    }

    animate();

    function handleResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(container);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      cancelAnimationFrame(animationFrameId);
      
      // Dispose WebGL resources
      geometry.dispose();
      material.dispose();
      wireframeMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [level]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[250px] flex items-center justify-center"
    />
  );
}
