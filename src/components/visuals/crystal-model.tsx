"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

interface CrystalModelProps {
  points?: number;
}

const GEM_RANKS = [
  { threshold: 0, color: 0xdde4ec, emissive: 0x11151c, glow: 0xcccccc, name: "Quartz" },
  { threshold: 5000, color: 0x5a189a, emissive: 0x1d4ed8, glow: 0x7b2cbf, name: "Amethyst" },
  { threshold: 10000, color: 0xffd83b, emissive: 0x501b02, glow: 0xff7900, name: "Citrine" },
  { threshold: 20000, color: 0xd90429, emissive: 0x3a0007, glow: 0xff2a2a, name: "Garnet" },
  { threshold: 40000, color: 0xadff2f, emissive: 0x2d5c00, glow: 0xd4ff3f, name: "Peridot" },
  { threshold: 60000, color: 0x70c1ff, emissive: 0x0b3c66, glow: 0x0091ff, name: "Aquamarine" },
  { threshold: 80000, color: 0x1e40af, emissive: 0x030712, glow: 0x3b82f6, name: "Topaz" },
  { threshold: 100000, color: 0x01604b, emissive: 0x001f18, glow: 0x10b981, name: "Emerald" },
  { threshold: 150000, color: 0xd81b60, emissive: 0x44001a, glow: 0xff4081, name: "Sapphire" },
  { threshold: 200000, color: 0xf0f5ff, emissive: 0x22252a, glow: 0xffffff, name: "Diamond" },
  { threshold: 500000, color: 0xe0115f, emissive: 0x3a0007, glow: 0xff004f, name: "Ruby" },
];

function createCrystalGeometry(name: string): THREE.BufferGeometry {
  if (name === "Diamond" || name === "Ruby") {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    
    // Ring 0 (Top Table): 8 vertices
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      positions.push(0.7 * Math.cos(angle), 0.45, 0.7 * Math.sin(angle));
    }
    
    // Ring 1 (Girdle): 16 vertices
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      positions.push(1.3 * Math.cos(angle), 0.0, 1.3 * Math.sin(angle));
    }
    
    // Bottom Apex (Culet): 1 vertex (index 24)
    positions.push(0, -0.85, 0);
    
    const indices: number[] = [];
    
    // 1. Top Table triangulation (CCW)
    for (let i = 1; i < 7; i++) {
      indices.push(0, i, i + 1);
    }
    
    // 2. Crown facets
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      const g0 = 2 * i + 8;
      const g1 = 2 * i + 9;
      const g2 = ((2 * i + 10) % 16) + 8;
      
      indices.push(i, g0, g1);
      indices.push(i, g1, next);
      indices.push(next, g1, g2);
    }
    
    // 3. Pavilion facets (connecting girdle to culet)
    for (let j = 0; j < 16; j++) {
      const nextG = ((j + 1) % 16) + 8;
      indices.push(j + 8, nextG, 24);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }

  if (name === "Topaz" || name === "Emerald" || name === "Sapphire") {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    
    // Helper to add octagon vertices
    const addOctagon = (y: number, W: number, D: number, C: number) => {
      positions.push(W/2 - C,  y,  D/2);     // 0
      positions.push(W/2,      y,  D/2 - C); // 1
      positions.push(W/2,      y, -D/2 + C); // 2
      positions.push(W/2 - C,  y, -D/2);     // 3
      positions.push(-W/2 + C, y, -D/2);     // 4
      positions.push(-W/2,     y, -D/2 + C); // 5
      positions.push(-W/2,     y,  D/2 - C); // 6
      positions.push(-W/2 + C, y,  D/2);     // 7
    };

    // Ring 0 (Top Table)
    addOctagon(0.4, 0.8, 0.5, 0.15);
    // Ring 1 (Girdle Top)
    addOctagon(0.12, 1.4, 0.9, 0.25);
    // Ring 2 (Girdle Bottom)
    addOctagon(-0.12, 1.4, 0.9, 0.25);
    // Ring 3 (Bottom Table - symmetrical flat end)
    addOctagon(-0.4, 0.8, 0.5, 0.15);
    
    const indices: number[] = [];
    
    // 1. Top Table triangulation (CCW)
    indices.push(0, 1, 2);
    indices.push(0, 2, 3);
    indices.push(0, 3, 4);
    indices.push(0, 4, 5);
    indices.push(0, 5, 6);
    indices.push(0, 6, 7);

    // 2. Upper stepped facets (between Ring 0 and Ring 1)
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      indices.push(i, i + 8, next + 8);
      indices.push(i, next + 8, next);
    }

    // 3. Girdle sides (between Ring 1 and Ring 2)
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      indices.push(i + 8, i + 16, next + 16);
      indices.push(i + 8, next + 16, next + 8);
    }

    // 4. Lower stepped facets (between Ring 2 and Ring 3)
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      indices.push(i + 16, i + 24, next + 24);
      indices.push(i + 16, next + 24, next + 16);
    }

    // 5. Bottom Table triangulation (CW looking from top to point down/outwards)
    indices.push(24, 26, 25);
    indices.push(24, 27, 26);
    indices.push(24, 28, 27);
    indices.push(24, 29, 28);
    indices.push(24, 30, 29);
    indices.push(24, 31, 30);

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }

  if (name === "Garnet" || name === "Peridot" || name === "Aquamarine") {
    const points: THREE.Vector2[] = [];
    // Pear-cut teardrop shape profile
    points.push(new THREE.Vector2(0.001, 1.4));
    points.push(new THREE.Vector2(0.3, 1.0));
    points.push(new THREE.Vector2(0.65, 0.5));
    points.push(new THREE.Vector2(0.85, 0.0));
    points.push(new THREE.Vector2(0.8, -0.4));
    points.push(new THREE.Vector2(0.55, -0.8));
    points.push(new THREE.Vector2(0.25, -1.1));
    points.push(new THREE.Vector2(0.001, -1.2));
    
    // 8 segments for sharp faceted appearance
    const geometry = new THREE.LatheGeometry(points, 8);
    geometry.computeVertexNormals();
    return geometry;
  }

  // Hexagonal double-terminated prism geometry (Default)
  const geometry = new THREE.BufferGeometry();
  const R = 0.75;
  const H = 1.4;
  const h = 0.7;
  
  const positions: number[] = [];
  
  // Top ring (0..5)
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    positions.push(R * Math.cos(angle), H / 2, R * Math.sin(angle));
  }
  // Bottom ring (6..11)
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    positions.push(R * Math.cos(angle), -H / 2, R * Math.sin(angle));
  }
  // Top apex (12)
  positions.push(0, H / 2 + h, 0);
  // Bottom apex (13)
  positions.push(0, -H / 2 - h, 0);
  
  const indices: number[] = [];
  
  for (let i = 0; i < 6; i++) {
    const next = (i + 1) % 6;
    
    // Top cap (CCW looking from outside)
    indices.push(next, i, 12);
    
    // Sides (CCW looking from outside)
    indices.push(i, next, next + 6);
    indices.push(i, next + 6, i + 6);
    
    // Bottom cap (CCW looking from outside)
    indices.push(i + 6, next + 6, 13);
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  
  return geometry;
}

export function CrystalModel({ points = 0 }: CrystalModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Determine rank based on points
    let currentRank = GEM_RANKS[0];
    for (let i = 0; i < GEM_RANKS.length; i++) {
      if (points >= GEM_RANKS[i].threshold) {
        currentRank = GEM_RANKS[i];
      } else {
        break;
      }
    }

    const { color: crystalColor, emissive: emissiveColor, glow: glowColor, name: gemName } = currentRank;
    const rotationSpeedX = 0.003;
    const rotationSpeedY = 0.005;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Important for MeshPhysicalMaterial realistic lighting
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; // Slightly lower exposure
    container.appendChild(renderer.domElement);

    // Generate environment map for hyper-realistic reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const environment = new RoomEnvironment();
    const envMap = pmremGenerator.fromScene(environment).texture;
    scene.environment = envMap;

    // Realistic Gem Material (Optimized for maximum shine and reflections)
    const material = new THREE.MeshPhysicalMaterial({
      color: crystalColor,
      emissive: emissiveColor,
      emissiveIntensity: gemName === "Quartz" ? 0.02 : 0.12,
      metalness: 0.1, // Slight metallic reflection for sharper glints
      roughness: 0.0, // Perfectly smooth polish for maximum shine
      transmission: 0.95, // Highly transparent
      thickness: 2.0, // Volume for refraction
      ior: gemName === "Quartz" ? 1.6 : 2.6, // Higher index of refraction for stronger edge reflections
      dispersion: gemName === "Quartz" ? 0.8 : 2.5, // High dispersion for vivid rainbow light splits
      clearcoat: 1.0, // Outer protective shine layer
      clearcoatRoughness: 0.0, // Glass-smooth clearcoat
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      envMapIntensity: 2.5, // MUCH stronger environmental reflections
      flatShading: true, // Sharp facets to catch lights at varying angles
    });

    const geometry = createCrystalGeometry(gemName);
    
    const crystal = new THREE.Mesh(geometry, material);
    if (gemName === "Garnet" || gemName === "Peridot" || gemName === "Aquamarine") {
      crystal.scale.set(1.2, 1.2, 0.7); // Flatten front-to-back for pear cut
    }
    scene.add(crystal);

    // Inner core/glow geometry (ONLY for glowing gemstones, disabled for Quartz to keep it clear)
    let glow: THREE.Mesh | null = null;
    let glowGeo: THREE.BufferGeometry | null = null;
    let glowMat: THREE.MeshBasicMaterial | null = null;

    if (gemName !== "Quartz") {
      glowGeo = createCrystalGeometry(gemName);
      glowMat = new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      glow = new THREE.Mesh(glowGeo, glowMat);
      if (gemName === "Garnet" || gemName === "Peridot" || gemName === "Aquamarine") {
        glow.scale.set(1.2 * 0.6, 1.2 * 0.6, 0.7 * 0.6); // Scale down while maintaining flatness
      } else {
        glow.scale.setScalar(0.6); // Scale it down inside the outer crystal
      }
      scene.add(glow);
    }

    // Floating particles around the crystal for more magic/realism (also softer)
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 30;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 4;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.03,
      color: glowColor,
      transparent: true,
      opacity: gemName === "Quartz" ? 0.3 : 0.5,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Balanced lighting setup (reduced intensities to prevent wash out)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(glowColor, 1.0);
    dirLight2.position.set(-5, -5, 2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(crystalColor, 1.5, 8);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    let animationFrameId: number;
    let time = 0;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.01;

      // Rotate crystal
      crystal.rotation.y += rotationSpeedY;
      crystal.rotation.x += rotationSpeedX;
      crystal.position.y = Math.sin(time) * 0.1; // Gentle hovering
      
      // Rotate and pulse inner glow if it exists
      if (glow) {
        glow.rotation.y -= rotationSpeedY * 1.5;
        glow.rotation.x -= rotationSpeedX * 1.5;
        const pulse = 0.95 + Math.sin(time * 2) * 0.08;
        if (gemName === "Garnet" || gemName === "Peridot" || gemName === "Aquamarine") {
          glow.scale.set(1.2 * 0.6 * pulse, 1.2 * 0.6 * pulse, 0.7 * 0.6 * pulse);
        } else {
          glow.scale.setScalar(0.6 * pulse); // Correct scaling relative to outer crystal
        }
        glow.position.y = Math.sin(time) * 0.1;
      }

      // Rotate particles slowly
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.001;

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
      
      geometry.dispose();
      material.dispose();
      if (glowGeo) glowGeo.dispose();
      if (glowMat) glowMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      environment.dispose();
      envMap.dispose();
      pmremGenerator.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [points]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[250px] flex items-center justify-center"
    />
  );
}
