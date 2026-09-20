import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

interface BrandNewDayCanvasProps {
  scrollProgress: React.MutableRefObject<number>;
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
  reducedMotion?: boolean;
}

export function BrandNewDayCanvas({
  scrollProgress,
  mouseX,
  mouseY,
  reducedMotion = false,
}: BrandNewDayCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isMounted = true;

    // ─────────────────────────────────────────────
    // 1. SCENE & COSMIC DEEP SPACE ATMOSPHERE
    // ─────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080611');
    scene.fog = new THREE.FogExp2('#080611', 0.016);

    // ─────────────────────────────────────────────
    // 2. CAMERA SETUP (RESPONSIVE)
    // ─────────────────────────────────────────────
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;

    const camera = new THREE.PerspectiveCamera(
      isMobile ? 55 : 45,
      width / height,
      0.1,
      800
    );
    // Position camera based on aspect ratio
    const baseZ = isMobile ? 26 : 20;
    camera.position.set(0, isMobile ? 1.5 : 2.2, baseZ);

    // ─────────────────────────────────────────────
    // 3. RENDERER
    // ─────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    renderer.setSize(width, height);
    const dpr = Math.min(reducedMotion ? 1.0 : (isMobile ? 1.25 : 1.5), window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ─────────────────────────────────────────────
    // 4. POST PROCESSING
    // ─────────────────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.45,  // strength
      0.4,   // radius
      0.88   // threshold
    );
    const highPassUniforms = bloomPass.highPassUniforms as Record<string, { value: unknown }> | undefined;
    if (highPassUniforms && highPassUniforms.smoothWidth) {
      highPassUniforms.smoothWidth.value = 0.25;
    }
    composer.addPass(bloomPass);

    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms.darkness.value = 1.05;
    vignettePass.uniforms.offset.value = 1.2;
    composer.addPass(vignettePass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // ─────────────────────────────────────────────
    // 5. LIGHTING (COSMIC NEBULA VIOLET ATMOSPHERE)
    // ─────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight('#262040', 2.2);
    scene.add(ambientLight);

    // Main top-right starlight key light
    const keyLight = new THREE.DirectionalLight('#ffffff', 3.6);
    keyLight.position.set(10, 16, 14);
    scene.add(keyLight);

    // Back rim light to highlight spider contours and glistening dew
    const rimLight = new THREE.DirectionalLight('#d6c4ff', 2.6);
    rimLight.position.set(-12, 10, -12);
    scene.add(rimLight);

    // Nebula violet floor glow
    const violetFloorGlow = new THREE.PointLight('#9b6bff', 3.5, 30);
    violetFloorGlow.position.set(0, -4.5, 2.0);
    scene.add(violetFloorGlow);

    // Subtle red hourglass accent
    const crimsonAccent = new THREE.PointLight('#e11d48', 2.2, 20);
    crimsonAccent.position.set(0, -0.8, -1.0);
    scene.add(crimsonAccent);

    // Center focal fill
    const focalLight = new THREE.PointLight('#f5f5f5', 2.0, 35);
    focalLight.position.set(0, 4, 8);
    scene.add(focalLight);

    // ─────────────────────────────────────────────
    // 6. 3D MODELS ROOT GROUPS & CORRIDOR LAYERS
    // ─────────────────────────────────────────────
    const sceneMasterGroup = new THREE.Group();
    scene.add(sceneMasterGroup);

    const spiderMasterGroup = new THREE.Group();
    sceneMasterGroup.add(spiderMasterGroup);

    // Primary & Depth Web Groups for the Zoom-In Corridor
    const webMasterGroup = new THREE.Group();
    sceneMasterGroup.add(webMasterGroup);

    const webDeepGroup1 = new THREE.Group();
    sceneMasterGroup.add(webDeepGroup1);

    const webDeepGroup2 = new THREE.Group();
    sceneMasterGroup.add(webDeepGroup2);

    // ─────────────────────────────────────────────
    // 7. GLTF LOADER — LOAD BLENDER SPIDER & WEB
    // ─────────────────────────────────────────────
    const gltfLoader = new GLTFLoader();
    let mixer: THREE.AnimationMixer | null = null;
    let spiderModel: THREE.Group | null = null;
    let webModel: THREE.Group | null = null;

    // Load Spiderweb with Dew GLB
    gltfLoader.load(
      '/models/spiderweb_dew.glb',
      (gltf) => {
        if (!isMounted) return;
        webModel = gltf.scene;

        // Enhance web & dew materials for high visual fidelity
        webModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.name === 'DewDrops' || mesh.name.includes('Sphere') || mesh.name.includes('Water')) {
              // Translucent glistening water dew material
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color('#ffffff'),
                roughness: 0.05,
                metalness: 0.05,
                transmission: 0.65,
                transparent: true,
                opacity: 0.94,
                reflectivity: 0.9,
                clearcoat: 1.0,
                clearcoatRoughness: 0.05,
              });
            } else {
              // Silvery silk thread material
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#d4d4d4'),
                roughness: 0.35,
                metalness: 0.2,
                transparent: true,
                opacity: 0.88,
                emissive: new THREE.Color('#1f1f1f'),
              });
            }
          }
        });

        // Center and scale the web appropriately
        const box = new THREE.Box3().setFromObject(webModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        webModel.position.sub(center);
        const webTargetSpan = isMobile ? 22 : 30;
        const scaleFactor = webTargetSpan / Math.max(size.x, size.y, 0.1);
        webModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Layer 1: Front web behind spider
        webMasterGroup.position.set(0, isMobile ? 0.8 : 0.4, -2.5);
        webMasterGroup.rotation.set(-0.12, 0.05, -0.06);
        webMasterGroup.add(webModel);

        // Layer 2: Deep secondary web for fly-through corridor
        const webClone1 = webModel.clone(true);
        webClone1.scale.multiplyScalar(1.6);
        webDeepGroup1.position.set(2.0, -1.0, -18.0);
        webDeepGroup1.rotation.set(0.2, -0.15, 0.4);
        webDeepGroup1.add(webClone1);

        // Layer 3: Ancient Archive deepest web
        const webClone2 = webModel.clone(true);
        webClone2.scale.multiplyScalar(2.2);
        webDeepGroup2.position.set(-3.0, 2.0, -36.0);
        webDeepGroup2.rotation.set(-0.25, 0.3, -0.2);
        webDeepGroup2.add(webClone2);
      },
      undefined,
      (err) => console.warn('Spiderweb GLB load note:', err)
    );

    // Load Black Widow Spider GLB
    gltfLoader.load(
      '/models/black_widow.glb',
      (gltf) => {
        if (!isMounted) return;
        spiderModel = gltf.scene;

        // Enhance Black Widow materials
        spiderModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat) {
              if (mat.name === 'eyes' || mesh.name.includes('Sphere.002') || mesh.name.includes('Sphere.003')) {
                // High-shine obsidian eyes
                mesh.material = new THREE.MeshStandardMaterial({
                  color: new THREE.Color('#f0f0f5'),
                  roughness: 0.05,
                  metalness: 0.95,
                  emissive: new THREE.Color('#111111'),
                });
              } else if (mat.name === 'chitin abdomen' || mesh.name.includes('Sphere.001')) {
                // Black Widow abdomen with deep chitin gloss
                mat.roughness = 0.2;
                mat.metalness = 0.15;
                mat.needsUpdate = true;
              } else if (mat.name === 'fang tip') {
                // Sharp sinister fangs
                mesh.material = new THREE.MeshStandardMaterial({
                  color: new THREE.Color('#2b0509'),
                  roughness: 0.15,
                  metalness: 0.35,
                  emissive: new THREE.Color('#1a0003'),
                });
              } else {
                // Shiny chitin body and articulated legs
                mat.color = new THREE.Color('#111111');
                mat.roughness = 0.25;
                mat.metalness = 0.22;
                mat.needsUpdate = true;
              }
            }
          }
        });

        // Center the spider
        const box = new THREE.Box3().setFromObject(spiderModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        spiderModel.position.set(-center.x, -center.y, -center.z);

        // Adjust spider scale
        const spiderTargetSpan = isMobile ? 5.5 : 7.2;
        const spiderScale = spiderTargetSpan / Math.max(size.x, size.y, size.z, 0.1);
        spiderMasterGroup.scale.set(spiderScale, spiderScale, spiderScale);

        spiderMasterGroup.position.set(0, isMobile ? 0.6 : 0.2, 1.2);
        spiderMasterGroup.rotation.set(-0.2, 0, 0);

        spiderMasterGroup.add(spiderModel);

        // Set up animations if present
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(spiderModel);
          gltf.animations.forEach((clip) => {
            const action = mixer?.clipAction(clip);
            action?.setEffectiveTimeScale(0.65);
            action?.play();
          });
        }

        setLoaded(true);
      },
      undefined,
      (err) => console.warn('Spider GLB load note:', err)
    );

    // ─────────────────────────────────────────────
    // 8. ATMOSPHERIC PARTICLES & SILK STRANDS
    // ─────────────────────────────────────────────
    const particleCount = isMobile ? 180 : 350;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 50;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      particlePositions[i * 3 + 2] = 10 - Math.random() * 60;
      particleSpeeds[i] = 0.2 + Math.random() * 0.5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: '#d6c4ff',
      size: isMobile ? 0.1 : 0.14,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Longitudinal Silk Filaments Tunnel
    const filamentGroup = new THREE.Group();
    const filamentMat = new THREE.LineBasicMaterial({
      color: '#9b6bff',
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });

    for (let f = 0; f < 36; f++) {
      const angle = (f / 36) * Math.PI * 2;
      const radius = 8 + Math.random() * 8;
      const p1 = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 12);
      const p2 = new THREE.Vector3(
        Math.cos(angle + 0.3) * (radius * 1.4),
        Math.sin(angle + 0.3) * (radius * 1.4),
        -48
      );
      const fGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const fLine = new THREE.Line(fGeo, filamentMat);
      filamentGroup.add(fLine);
    }
    scene.add(filamentGroup);

    // ─────────────────────────────────────────────
    // 9. ANIMATION LOOP & SCROLL-DRIVEN ZOOM FLYTHROUGH
    // ─────────────────────────────────────────────
    let animId = 0;
    let clock = new THREE.Clock();
    let currentTiltX = 0;
    let currentTiltY = 0;

    const renderFrame = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const p = clamp01(scrollProgress.current);
      const mx = mouseX.current;
      const my = mouseY.current;

      // Update mixer animations
      if (mixer) {
        mixer.update(delta);
      }

      // Smooth mouse / touch parallax damping
      currentTiltX += (mx - currentTiltX) * 0.05;
      currentTiltY += (my - currentTiltY) * 0.05;

      const time = clock.getElapsedTime();

      // ── Spider Interactive Motion & Scroll Reactivity ──
      const breath = Math.sin(time * 1.8) * 0.06;
      if (spiderModel) {
        // Spider stays in front during early scroll, then as camera flies past (p > 0.35),
        // spider tilts and arches back as user penetrates into the web
        const spiderScaleMulti = Math.max(0.2, 1.0 - p * 0.4);
        const baseY = isMobile ? 0.6 : 0.2;
        
        spiderMasterGroup.scale.setScalar((isMobile ? 0.65 : 1.0) * spiderScaleMulti);
        spiderMasterGroup.position.y = baseY + breath + currentTiltY * 0.35 - p * 1.5;
        spiderMasterGroup.position.x = currentTiltX * 0.45 + Math.sin(p * Math.PI * 2) * 0.8;
        spiderMasterGroup.position.z = 1.2 - p * 4.0;

        const targetRotY = currentTiltX * 0.4 + Math.sin(p * Math.PI * 3) * 0.3;
        const targetRotX = -0.2 - currentTiltY * 0.25 + (p * 0.8);
        const targetRotZ = -currentTiltX * 0.15;

        spiderMasterGroup.rotation.y += (targetRotY - spiderMasterGroup.rotation.y) * 0.06;
        spiderMasterGroup.rotation.x += (targetRotX - spiderMasterGroup.rotation.x) * 0.06;
        spiderMasterGroup.rotation.z += (targetRotZ - spiderMasterGroup.rotation.z) * 0.06;
      }

      // ── Spiderwebs Dynamic Zooming & Sway ──
      if (webModel) {
        const webSway = Math.sin(time * 0.7) * 0.02;
        // Primary Web spins slightly and expands on scroll
        webMasterGroup.rotation.z = -0.06 + webSway + p * 0.8;
        webMasterGroup.rotation.x = -0.12 + currentTiltY * 0.1;
        webMasterGroup.rotation.y = 0.05 + currentTiltX * 0.12;

        // Deep Web 1 & 2 rotate in opposite spiral
        webDeepGroup1.rotation.z = 0.4 - webSway - p * 1.1;
        webDeepGroup2.rotation.z = -0.2 + p * 1.4;
      }

      // ── Particles Flowing Towards Camera on Scroll ──
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        // Particles drift and rush past camera as user scrolls
        posArray[i * 3 + 2] += (particleSpeeds[i] * 0.1) + (p * 0.2);
        if (posArray[i * 3 + 2] > 18) {
          posArray[i * 3 + 2] = -45;
        }
      }
      posAttr.needsUpdate = true;

      // ── DEEP CAMERA FLYTHROUGH & PENETRATION MATH ──
      // Journey from outer orbit (z=24) into the spider (z=2), through Web 1 (z=-3),
      // through Web 2 (z=-18) into the deepest core of the web (z=-38)
      const travelZ = (baseZ) - (p * (baseZ + 32.0));
      const swayX = Math.sin(p * Math.PI * 4) * (isMobile ? 1.6 : 3.0) + currentTiltX * 1.2;
      const swayY = (isMobile ? 1.5 : 2.2) - (p * 2.5) + Math.cos(p * Math.PI * 3) * 1.2 + currentTiltY * 0.8;

      camera.position.set(swayX, swayY, travelZ);

      // Look slightly ahead down the web corridor
      const lookAheadZ = travelZ - 12.0;
      camera.lookAt(swayX * 0.4, (isMobile ? 0.6 : 0.2) - (p * 2.0), lookAheadZ);

      // Render Scene through bloom & tone mapping
      composer.render();

      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);

    // ─────────────────────────────────────────────
    // 10. RESPONSIVE RESIZE HANDLER
    // ─────────────────────────────────────────────
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mobile = w < 768;

      camera.fov = mobile ? 58 : 45;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      composer.setSize(w, h);

      // Adjust spider and web scales dynamically
      if (spiderModel) {
        const targetSpan = mobile ? 5.5 : 7.2;
        const box = new THREE.Box3().setFromObject(spiderModel);
        const size = box.getSize(new THREE.Vector3());
        const s = targetSpan / Math.max(size.x, size.y, size.z, 0.1);
        spiderMasterGroup.scale.set(s, s, s);
        spiderMasterGroup.position.y = mobile ? 0.6 : 0.2;
      }

      if (webModel) {
        const targetSpan = mobile ? 22 : 30;
        const box = new THREE.Box3().setFromObject(webModel);
        const size = box.getSize(new THREE.Vector3());
        const s = targetSpan / Math.max(size.x, size.y, 0.1);
        webModel.scale.set(s, s, s);
        webMasterGroup.position.y = mobile ? 0.8 : 0.4;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);

      // Clean up GPU resources
      particleGeo.dispose();
      particleMat.dispose();
      filamentMat.dispose();
      filamentGroup.children.forEach((c) => {
        if ((c as THREE.Line).geometry) (c as THREE.Line).geometry.dispose();
      });

      renderer.dispose();
      composer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}

