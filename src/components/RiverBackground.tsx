'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FluidWaterMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Generate a detailed grid geometry for fluid wave deformation
  const geometry = useMemo(() => new THREE.PlaneGeometry(140, 140, 80, 80), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    const time = clock.getElapsedTime() * 0.8;
    const positions = (meshRef.current.geometry as THREE.PlaneGeometry).attributes.position;
    
    // Perform procedural wave composition (representing Mtkvari river current + natural wind ripples)
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Primary flowing current wave (along river course)
      const wave1 = Math.sin(x * 0.15 + time * 1.5) * 0.4;
      // Secondary interfering wind ripple
      const wave2 = Math.cos(y * 0.2 - time * 0.9) * 0.35;
      // High-frequency surface shimmer
      const wave3 = Math.sin((x + y) * 0.35 + time * 2.2) * 0.15;
      
      const z = wave1 + wave2 + wave3;
      positions.setZ(i, z);
    }
    
    positions.needsUpdate = true;
    (meshRef.current.geometry as THREE.PlaneGeometry).computeVertexNormals();
  });

  return (
    <mesh 
      ref={meshRef} 
      geometry={geometry} 
      rotation={[-Math.PI * 0.42, 0, -Math.PI * 0.15]} 
      position={[0, -12, -20]}
    >
      <meshStandardMaterial
        ref={materialRef}
        color="#0a2318"
        emissive="#05140d"
        emissiveIntensity={0.6}
        roughness={0.18}
        metalness={0.75}
        wireframe={false}
        flatShading={false}
      />
    </mesh>
  );
};

const RiverScene = () => {
  return (
    <>
      {/* Ambient twilight forest radiance */}
      <ambientLight color="#18422e" intensity={1.4} />
      
      {/* Golden sunset reflection lighting simulating sunlight hitting Mtkvari waters */}
      <directionalLight 
        color="#e5c973" 
        position={[25, 30, 20]} 
        intensity={2.8} 
      />
      
      {/* Deep green fill light */}
      <pointLight 
        color="#2a5d3c" 
        position={[-30, 10, -10]} 
        intensity={3.5} 
        distance={80} 
      />
      
      <pointLight 
        color="#c9a84c" 
        position={[15, -5, 10]} 
        intensity={1.8} 
        distance={60} 
      />

      <FluidWaterMesh />
    </>
  );
};

export default function RiverBackground() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-[#06140e]">
      <Canvas
        camera={{ position: [0, 5, 22], fov: 60 }}
        dpr={[1, 1.5]} // Optimize performance for mobile GPUs while maintaining sharpness
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <RiverScene />
        </Suspense>
      </Canvas>
      
      {/* Atmospheric gradient vignette for contrast and depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06140e] via-transparent to-[#06140e]/80" />
    </div>
  );
}
