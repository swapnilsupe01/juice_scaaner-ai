import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeCanvas({ isDark = true }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentRef = mountRef.current;
    if (!currentRef) return;

    let renderer, animationFrameId, geometry, material;

    try {
      const width = currentRef.clientWidth || window.innerWidth;
      const height = currentRef.clientHeight || window.innerHeight;

      // Scene
      const scene = new THREE.Scene();
      
      // Camera
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
      camera.position.z = 80;

      // Renderer
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      currentRef.appendChild(renderer.domElement);

      // Particles setup
      const particleCount = 180;
      geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const blueColor = new THREE.Color(0x00d1ff);
      const violetColor = new THREE.Color(0xbc00ff);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 160;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

        const mixColor = Math.random() > 0.5 ? blueColor : violetColor;
        colors[i * 3] = mixColor.r;
        colors[i * 3 + 1] = mixColor.g;
        colors[i * 3 + 2] = mixColor.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      material = new THREE.PointsMaterial({
        size: 1.6,
        vertexColors: true,
        transparent: true,
        opacity: isDark ? 0.75 : 0.45,
        blending: THREE.AdditiveBlending
      });

      const particleSystem = new THREE.Points(geometry, material);
      scene.add(particleSystem);

      // Grid wireframe mesh
      const gridGeometry = new THREE.PlaneGeometry(160, 160, 20, 20);
      const gridMaterial = new THREE.MeshBasicMaterial({
        color: isDark ? 0x00d1ff : 0x0099ff,
        wireframe: true,
        transparent: true,
        opacity: isDark ? 0.06 : 0.08
      });
      const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
      gridMesh.rotation.x = Math.PI / 2.5;
      gridMesh.position.y = -35;
      scene.add(gridMesh);

      // Animation Loop
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        particleSystem.rotation.y = elapsedTime * 0.03;
        particleSystem.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;
        gridMesh.rotation.z = elapsedTime * 0.015;

        renderer.render(scene, camera);
      };

      animate();

      // Resize Handler
      const handleResize = () => {
        if (!currentRef || !renderer) return;
        const w = currentRef.clientWidth || window.innerWidth;
        const h = currentRef.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        if (currentRef && renderer && renderer.domElement) {
          try {
            currentRef.removeChild(renderer.domElement);
          } catch (e) {}
        }
        if (geometry) geometry.dispose();
        if (material) material.dispose();
        if (renderer) renderer.dispose();
      };
    } catch (err) {
      console.warn('Three.js canvas setup bypassed:', err);
    }
  }, [isDark]);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none z-0 overflow-hidden" />;
}
