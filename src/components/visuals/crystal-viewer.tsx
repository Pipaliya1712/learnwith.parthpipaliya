"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface CrystalViewerProps {
  className?: string;
}

export function CrystalViewer({ className }: CrystalViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // Create Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(renderer.domElement);

    // Create Dodecahedron Crystal
    const geometry = new THREE.DodecahedronGeometry(1.5, 0);
    const material = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9, // Cyan
      emissive: 0x064e6b,
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
      color: 0x14b8a6, // Teal
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const wireframe = new THREE.Mesh(geometry, wireframeMat);
    crystal.add(wireframe);

    // Inner glow sphere
    const glowGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1, // Indigo
      transparent: true,
      opacity: 0.5,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);

    // Lighting
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      crystal.rotation.y += 0.005;
      crystal.rotation.x += 0.002;
      glow.scale.setScalar(1.0 + Math.sin(Date.now() * 0.002) * 0.1);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      const w = container.clientWidth || 300;
      const h = container.clientHeight || 300;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      wireframeMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className={className} style={{ width: "100%", height: "100%" }} />;
}
